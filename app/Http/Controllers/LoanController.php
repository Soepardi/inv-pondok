<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\Item;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class LoanController extends Controller
{
    // 📌 List semua pinjaman (admin: semua, user: sendiri)
    public function index(Request $request)
    {
        $query = Loan::query();
        $user = auth()->user();

        // Eager load relationships
        if ($user->role === 'admin') {
            $query->with(['user', 'item']);

            // Scope by admin's institution
            if ($user->institution_id) {
                $query->whereHas('item', function ($q) use ($user) {
                    $q->where('institution_id', $user->institution_id);
                });
            }
        } else {
            $query->with(['item.institution'])
                ->where('user_id', auth()->id());
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search, $user) {
                $q->whereHas('item', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('item_code', 'like', "%{$search}%");
                });
                // Admin can search users too
                if ($user->role === 'admin') {
                    $q->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                }
            });
        }

        // Filter Status
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        // Pagination
        $perPage = $request->input('per_page', 10);
        $loans = $query->latest()->paginate($perPage)->withQueryString();

        return Inertia::render('Loans/Index', [
            'loans' => $loans->items(),
            'current_page' => $loans->currentPage(),
            'last_page' => $loans->lastPage(),
            'total' => $loans->total(),
            'from' => $loans->firstItem(),
            'to' => $loans->lastItem(),
            'per_page' => $loans->perPage(),
        ]);
    }

    // 📌 Form peminjaman (hanya user)
    public function create(Request $request)
    {
        $query = Item::with('institution')
            ->where('condition', 'tersedia')
            ->where('status', 'baik')
            ->where('stock', '>', 0);

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('item_code', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->filled('institution')) {
            // Handle precise filtering if ID or name is passed. Assuming name based on previous snippets, but ID is safer. 
            // Let's support checks.
            $query->whereHas('institution', function ($q) use ($request) {
                // If numeric, assume ID, else Name
                if (is_numeric($request->institution)) {
                    $q->where('id', $request->institution);
                } else {
                    $q->where('name', $request->institution);
                }
            });
        }

        // Pagination
        $perPage = $request->input('per_page', 10);
        $items = $query->paginate($perPage)->withQueryString();

        // Get institutions that actually have available items
        $institutions = \App\Models\Institution::whereHas('items', function ($q) {
            $q->where('condition', 'tersedia')
                ->where('status', 'baik')
                ->where('stock', '>', 0);
        })->get();

        return Inertia::render('Loans/Create', [
            'items' => $items,
            'institutions' => $institutions,
            'filters' => $request->only(['search', 'institution']),
            'per_page' => $items->perPage(),
        ]);
    }

    // 📌 Simpan pinjaman baru (hanya user)
    public function store(Request $request)
    {
        $request->validate([
            'item_id' => 'required|exists:items,id',
            'loan_date' => 'required|date|after_or_equal:today',
            'due_date' => 'required|date|after:loan_date',
            'stock' => 'required|integer|min:1',
        ]);

        return \Illuminate\Support\Facades\DB::transaction(function () use ($request) {
            $item = Item::lockForUpdate()->find($request->item_id);

            // Double check availability
            if ($item->stock < $request->stock) {
                return back()->withErrors(['stock' => 'Stok barang tidak mencukupi (Tersedia: ' . $item->stock . ')']);
            }
            if ($item->condition !== 'tersedia' || $item->status !== 'baik') {
                return back()->withErrors(['item_id' => 'Barang tidak tersedia untuk dipinjam saat ini.']);
            }

            // Create Loan
            Loan::create([
                'user_id' => auth()->id(),
                'item_id' => $item->id,
                'loan_date' => $request->loan_date,
                'due_date' => $request->due_date,
                'stock' => $request->stock,
                'status' => 'pending',
                'return_date' => null,
            ]);

            // Decrement Stock
            $item->decrement('stock', $request->stock);

            // Update condition if out of stock
            if ($item->stock === 0) {
                $item->update(['condition' => 'dipinjam']);
            }

            return redirect()->route('history.my')->with('success', 'Permintaan peminjaman berhasil dibuat. Menunggu persetujuan admin.');
        });
    }

    // 📌 Setujui pinjaman (hanya admin)
    public function approve(Loan $loan)
    {
        $user = auth()->user();
        if ($user->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        // Enforce institution check
        if ($user->institution_id && $loan->item->institution_id !== $user->institution_id) {
            abort(403, 'Unauthorized action. You can only manage loans for your institution.');
        }

        if ($loan->status !== 'approved') {
            $loan->update(['status' => 'approved']);
            // Note: Stock was already decremented in store() when the user requested the loan.
            // When status becomes 'approved', we don't need to decrement again.
        }
        return redirect()->back()->with('success', 'Peminjaman disetujui');
    }

    // 📌 Tolak pinjaman (hanya admin)
    public function reject(Loan $loan)
    {
        $user = auth()->user();
        if ($user->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        // Enforce institution check
        if ($user->institution_id && $loan->item->institution_id !== $user->institution_id) {
            abort(403, 'Unauthorized action. You can only manage loans for your institution.');
        }

        // Kembalikan stock item jika loan ditolak
        if ($loan->status === 'pending') {
            $item = $loan->item;
            if ($item) {
                $item->increment('stock', $loan->stock);

                // Update condition jika stock kembali > 0
                if ($item->stock > 0) {
                    $item->update(['condition' => 'tersedia']);
                }
            }
        }

        $loan->update(['status' => 'rejected']);

        return redirect()->back()->with('success', 'Peminjaman ditolak');
    }

    // 📌 Kembalikan barang (bisa admin atau user pemilik)
    public function returnLoan(Request $request, Loan $loan)
    {
        // Authorization: admin bisa return semua, user hanya bisa return pinjaman sendiri
        if (auth()->user()->role !== 'admin' && $loan->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'return_proof' => 'required|image|max:2048',
        ]);

        // Pastikan status loan adalah 'approved'
        if ($loan->status !== 'approved') {
            return back()->withErrors(['error' => 'Hanya peminjaman yang disetujui yang bisa dikembalikan.']);
        }

        $loan->update([
            'status' => 'returned',
            'return_date' => now(),
            'return_proof' => $request->file('return_proof')->store('returns', 'public'),
        ]);

        // Kembalikan stock item
        $item = $loan->item;
        if ($item) {
            $item->increment('stock', $loan->stock); // Kembalikan sesuai jumlah yang dipinjam
            $item->update(['condition' => 'tersedia']);
        }

        return redirect()
            ->route('loans.index')
            ->with('success', 'Barang dikembalikan dengan bukti foto');
    }

    // 📌 Hapus pinjaman (hanya admin)
    public function destroy(Loan $loan)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        // Kembalikan stock item jika loan dihapus
        if (in_array($loan->status, ['pending', 'approved'])) {
            $item = $loan->item;
            if ($item) {
                $item->increment('stock', $loan->stock); // Kembalikan sesuai jumlah yang dipinjam
                if ($item->stock > 0) {
                    $item->update(['condition' => 'tersedia']);
                }
            }
        }

        $loan->delete();

        return redirect()->route('loans.index')->with('success', 'Data pinjaman dihapus');
    }
    // 📌 Mass Action (admin only)
    public function massAction(Request $request)
    {
        $request->validate([
            'loan_ids' => 'required|array',
            'loan_ids.*' => 'exists:loans,id',
            'action' => 'required|in:approve,reject,delete',
        ]);

        $user = auth()->user();
        if ($user->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        $loans = Loan::with('item')->whereIn('id', $request->loan_ids)->get();

        \Illuminate\Support\Facades\DB::transaction(function () use ($loans, $request, $user) {
            foreach ($loans as $loan) {
                // Enforce institution check per loan
                if ($user->institution_id && $loan->item->institution_id !== $user->institution_id) {
                    continue; // Skip loans not belonging to admin's institution
                }

                switch ($request->action) {
                    case 'approve':
                        if ($loan->status !== 'approved') {
                            $loan->update(['status' => 'approved']);
                        }
                        break;
                    case 'reject':
                        if ($loan->status === 'pending') {
                            $item = $loan->item;
                            if ($item) {
                                $item->increment('stock', $loan->stock);
                                if ($item->stock > 0) {
                                    $item->update(['condition' => 'tersedia']);
                                }
                            }
                        }
                        $loan->update(['status' => 'rejected']);
                        break;
                    case 'delete':
                        if (in_array($loan->status, ['pending', 'approved'])) {
                            $item = $loan->item;
                            if ($item) {
                                $item->increment('stock', $loan->stock);
                                if ($item->stock > 0) {
                                    $item->update(['condition' => 'tersedia']);
                                }
                            }
                        }
                        $loan->delete();
                        break;
                }
            }
        });

        return redirect()->back()->with('success', 'Aksi massal berhasil diproses.');
    }
}
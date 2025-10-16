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
    public function index()
    {
        if(auth()->user()->role === 'admin'){
            $loans = Loan::with(['user','item'])->latest()->get();
        } else {
            $loans = Loan::with(['item','institution'])
                         ->where('user_id', auth()->id())
                         ->latest()
                         ->get();
        }

        return Inertia::render('Loans/Index', [
            'loans' => $loans,
        ]);
    }

    // 📌 Form peminjaman (hanya user)
    public function create()
    {
        if(auth()->user()->role !== 'user') {
            abort(403, 'Unauthorized action.');
        }

        $items = Item::with('institution')
        ->where('condition', 'tersedia')->get();

        return Inertia::render('Loans/Create', [
            'items' => $items,
        ]);
    }

    // 📌 Simpan pinjaman (hanya user)
    public function store(Request $request)
    {
        if(auth()->user()->role !== 'user') {
            abort(403, 'Unauthorized action.');
        }

        \Log::info('Loan store request data:', $request->all());

        $request->validate([
            'item_id'   => 'required|exists:items,id',
            'loan_date' => 'required|date|after_or_equal:today',
            'due_date'  => 'required|date|after:loan_date',
            'stock'     => 'required|integer|min:1', // Tambah validasi stock
            'notes'     => 'nullable|string|max:500',
        ]);

        // Validasi maksimal 30 hari
        $loanDate = Carbon::parse($request->loan_date);
        $dueDate = Carbon::parse($request->due_date);
        $maxDueDate = $loanDate->copy()->addDays(30);
        
        if ($dueDate->gt($maxDueDate)) {
            \Log::warning('Due date exceeds 30 days');
            return back()->withErrors(['due_date' => 'Maksimal peminjaman adalah 30 hari.']);
        }

        // Cek ketersediaan item
        $item = Item::findOrFail($request->item_id);
        
        // Validasi stock cukup
        if ($item->stock < $request->stock) {
            return back()->withErrors(['stock' => 'Stok tidak mencukupi. Stok tersedia: ' . $item->stock]);
        }

        if ($item->condition !== 'tersedia') {
            \Log::warning('Item not available');
            return back()->withErrors(['item' => 'Item tidak tersedia untuk dipinjam.']);
        }

        // Cek duplikasi peminjaman
        $existingLoan = Loan::where('user_id', auth()->id())
            ->where('item_id', $request->item_id)
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existingLoan) {
            \Log::warning('Duplicate loan found');
            return back()->withErrors(['item' => 'Anda sudah meminjam item ini dan belum mengembalikannya.']);
        }

        \Log::info('Creating loan with data:', [
            'user_id' => auth()->id(),
            'item_id' => $request->item_id,
            'loan_date' => $request->loan_date,
            'due_date' => $request->due_date,
            'stock' => $request->stock, // Log stock
            'notes' => $request->notes,
            'status' => 'pending'
        ]);

        try {
            // Create loan
            $loan = Loan::create([
                'user_id'   => auth()->id(),
                'item_id'   => $request->item_id,
                'loan_date' => $request->loan_date,
                'due_date'  => $request->due_date,
                'stock'     => $request->stock, // Simpan jumlah yang dipinjam
                'notes'     => $request->notes,
                'status'    => 'pending',
            ]);

            \Log::info('Loan created successfully:', $loan->toArray());

            // Update stock item (kurangi stock)
            $item->decrement('stock', $request->stock);
            
            // Update kondisi item jika stock habis
            if ($item->stock <= 0) {
                $item->update(['condition' => 'dipinjam']);
            }

            \Log::info('Item stock updated:', [
                'item_id' => $item->id,
                'new_stock' => $item->stock,
                'condition' => $item->condition
            ]);

        } catch (\Exception $e) {
            \Log::error('Error creating loan: ' . $e->getMessage());
            \Log::error('Exception trace:', $e->getTrace());
            return back()->withErrors(['error' => 'Terjadi kesalahan saat membuat peminjaman.']);
        }

        return redirect()->route('history.my')->with('success', 'Peminjaman berhasil diajukan. Menunggu persetujuan admin.');
    }

    // 📌 Setujui pinjaman (hanya admin)
    public function approve(Loan $loan)
    {
        if(auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        if ($loan->status !== 'approved') {
            $loan->update(['status' => 'approved']);

            $item = $loan->item;
            if ($item) {
                // Pastikan stock berkurang hanya jika item memiliki stock
                if ($item->stock > 0) {
                    $item->decrement('stock', 1);
                }
                
                // Update condition berdasarkan stock
                if ($item->stock <= 0) {
                    $item->update(['condition' => 'dipinjam']);
                }
            }
        }
        return redirect()->back()->with('success', 'Peminjaman disetujui');
    }

    // 📌 Tolak pinjaman (hanya admin)
    public function reject(Loan $loan)
    {
        if(auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized action.');
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
        if(auth()->user()->role !== 'admin' && $loan->user_id !== auth()->id()) {
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
            'status'      => 'returned',
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
        if(auth()->user()->role !== 'admin') {
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
}
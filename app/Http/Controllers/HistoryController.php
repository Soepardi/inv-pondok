<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use Inertia\Inertia;

class HistoryController extends Controller
{
    // Admin: lihat semua history
    public function index()
    {
        $loans = Loan::with(['user', 'item'])
            ->whereIn('status', ['returned', 'rejected'])
            ->latest()
            ->get();

        return Inertia::render('History/Index', [
            'loans' => $loans,
        ]);
    }

    // User: lihat riwayatnya sendiri
    public function myHistory(\Illuminate\Http\Request $request)
    {
        $query = Loan::with('item')
            ->where('user_id', auth()->id());

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('item', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('item_code', 'like', "%{$search}%");
            });
        }

        // Filter Status
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $perPage = $request->input('per_page', 10);
        $loans = $query->latest()->paginate($perPage)->withQueryString();

        return Inertia::render('History/MyHistory', [
            'loans' => $loans,
            'filters' => $request->only(['search', 'status']),
            'per_page' => $loans->perPage(),
        ]);
    }
}

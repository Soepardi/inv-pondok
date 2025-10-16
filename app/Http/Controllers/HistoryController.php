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
    public function myHistory()
    {
        $loans = Loan::with('item')
            ->where('user_id', auth()->id())
            ->whereIn('status', ['returned', 'rejected'])
            ->latest()
            ->get();

        return Inertia::render('History/MyHistory', [
            'loans' => $loans,
        ]);
    }
}

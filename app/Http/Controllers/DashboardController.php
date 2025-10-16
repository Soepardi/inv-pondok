<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Loan;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Dashboard/Index', [
            'summary' => [
                // total barang (semua stok)
                'total'     => Item::sum('stock'),

                // barang yang masih tersedia
                'available' => Item::where('condition', 'tersedia')->sum('stock'),

                // barang sedang dipinjam
                'borrowed'  => Loan::where('status', 'approved')
                                    ->whereNull('return_date')
                                    ->count(),

                // barang rusak / diperbaiki (dari kolom status, bukan condition)
                'damaged'   => Item::whereIn('status', ['rusak', 'diperbaiki'])
                                    ->sum('stock'),
            ],

            // barang akan jatuh tempo
            'upcomingDue' => Loan::with(['item:id,name', 'user:id,name'])
                ->where('status', 'approved')
                ->whereDate('return_date', '>', now())
                ->take(5)
                ->get(['id', 'item_id', 'user_id', 'status', 'loan_date', 'return_date']),

            // barang yang sudah overdue
            'overdue' => Loan::with(['item:id,name', 'user:id,name'])
                ->where('status', 'approved')
                ->whereDate('return_date', '<', now())
                ->take(5)
                ->get(['id', 'item_id', 'user_id', 'status', 'loan_date', 'return_date']),

            // aktivitas terbaru
            'recentLoans' => Loan::with(['item:id,name', 'user:id,name'])
                ->latest()
                ->take(5)
                ->get(['id', 'item_id', 'user_id', 'status', 'loan_date', 'return_date']),

            // barang populer
            'popularItems' => Loan::selectRaw('item_id, COUNT(*) as total')
                ->with('item:id,name')
                ->groupBy('item_id')
                ->orderByDesc('total')
                ->take(5)
                ->get(),

            // tren peminjaman bulanan (Postgres friendly)
            'loanTrends' => Loan::selectRaw("TO_CHAR(loan_date, 'YYYY-MM') as bulan, COUNT(*) as total")
                ->groupByRaw("TO_CHAR(loan_date, 'YYYY-MM')")
                ->orderByRaw("TO_CHAR(loan_date, 'YYYY-MM')")
                ->get(),
        ]);
    }
}

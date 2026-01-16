<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Loan;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        if ($user->role !== 'admin') {
            return redirect()->route('history.my');
        }

        // Base queries scoped by institution
        $itemsQuery = Item::query();
        $loansQuery = Loan::query();

        if ($user->role === 'admin' && $user->institution_id) {
            $itemsQuery->where('institution_id', $user->institution_id);
            $loansQuery->whereHas('item', function ($q) use ($user) {
                $q->where('institution_id', $user->institution_id);
            });
        }

        // Summary data
        $activeLoansQuery = (clone $loansQuery)->whereIn('status', ['pending', 'approved'])->whereNull('return_date');
        $borrowedCount = (clone $activeLoansQuery)->sum('stock');

        return Inertia::render('Dashboard/Index', [
            'summary' => [
                // barang yang masih tersedia di gudang (harus kondisi tersedia DAN status baik)
                'available' => (clone $itemsQuery)->where('condition', 'tersedia')->where('status', 'baik')->sum('stock'),

                // barang sedang diproses atau sedang dipinjam
                'borrowed' => $borrowedCount,

                // barang rusak / diperbaiki
                'damaged' => (clone $itemsQuery)->whereIn('status', ['rusak', 'diperbaiki'])
                    ->sum('stock'),

                // total aset = barang di gudang + barang sedang keluar
                'total' => (clone $itemsQuery)->sum('stock') + $borrowedCount,
            ],

            // barang akan jatuh tempo (hanya yang sudah disetujui)
            'upcomingDue' => (clone $loansQuery)->with(['item:id,name', 'user:id,name'])
                ->where('status', 'approved')
                ->whereDate('due_date', '>', now())
                ->take(5)
                ->get(['id', 'item_id', 'user_id', 'status', 'loan_date', 'due_date', 'return_date']),

            // barang yang sudah overdue (hanya yang sudah disetujui)
            'overdue' => (clone $loansQuery)->with(['item:id,name', 'user:id,name'])
                ->where('status', 'approved')
                ->whereDate('due_date', '<', now())
                ->whereNull('return_date')
                ->take(5)
                ->get(['id', 'item_id', 'user_id', 'status', 'loan_date', 'due_date', 'return_date']),

            // aktivitas terbaru
            'recentLoans' => (clone $loansQuery)->with(['item:id,name', 'user:id,name'])
                ->latest()
                ->take(5)
                ->get(['id', 'item_id', 'user_id', 'status', 'loan_date', 'due_date', 'return_date']),

            // barang populer
            'popularItems' => (clone $loansQuery)->selectRaw('item_id, COUNT(*) as total')
                ->with('item:id,name')
                ->groupBy('item_id')
                ->orderByDesc('total')
                ->take(5)
                ->get(),

            // tren peminjaman bulanan
            'loanTrends' => $this->getLoanTrends($loansQuery),
        ]);
    }

    private function getLoanTrends($query)
    {
        $driver = DB::getDriverName();
        $select = "DATE_FORMAT(loan_date, '%Y-%m') as bulan, COUNT(*) as total";
        $group = "DATE_FORMAT(loan_date, '%Y-%m')";

        if ($driver === 'sqlite') {
            $select = "strftime('%Y-%m', loan_date) as bulan, COUNT(*) as total";
            $group = "strftime('%Y-%m', loan_date)";
        } elseif ($driver === 'pgsql') {
            $select = "TO_CHAR(loan_date, 'YYYY-MM') as bulan, COUNT(*) as total";
            $group = "TO_CHAR(loan_date, 'YYYY-MM')";
        }

        return (clone $query)->selectRaw($select)
            ->groupByRaw($group)
            ->orderByRaw($group)
            ->get();
    }
}

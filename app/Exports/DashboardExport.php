<?php

namespace App\Exports;

use App\Models\Item;
use App\Models\Loan;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class DashboardExport implements FromCollection, WithHeadings, WithTitle, WithStyles
{
    public function collection(): Collection
    {
        $data = [];
        
        // Summary Data
        $totalItems = Item::count();
        $availableItems = Item::where('condition', 'tersedia')->where('status', 'baik')->count();
        $borrowedItems = Item::where('condition', 'dipinjam')->count();
        $damagedItems = Item::where('status', '!=', 'baik')->count();
        
        $data[] = ['Ringkasan Inventaris', ''];
        $data[] = ['Total Barang', $totalItems];
        $data[] = ['Barang Tersedia', $availableItems];
        $data[] = ['Barang Dipinjam', $borrowedItems];
        $data[] = ['Barang Rusak/Tidak Tersedia', $damagedItems];
        $data[] = [''];
        
        // Loan Statistics
        $activeLoans = Loan::whereNull('returned_at')->count();
        $overdueLoans = Loan::whereNull('returned_at')
                           ->where('return_date', '<', now())
                           ->count();
        $returnedLoans = Loan::whereNotNull('returned_at')->count();
        
        $data[] = ['Statistik Peminjaman', ''];
        $data[] = ['Peminjaman Aktif', $activeLoans];
        $data[] = ['Peminjaman Terlambat', $overdueLoans];
        $data[] = ['Peminjaman Selesai', $returnedLoans];
        $data[] = [''];
        
        // Popular Items
        $popularItems = \DB::table('loans')
            ->join('items', 'loans.item_id', '=', 'items.id')
            ->select('items.name', \DB::raw('COUNT(loans.id) as total_loans'))
            ->groupBy('items.id', 'items.name')
            ->orderByDesc('total_loans')
            ->limit(10)
            ->get();
            
        $data[] = ['Barang Paling Sering Dipinjam', 'Total Peminjaman'];
        foreach ($popularItems as $item) {
            $data[] = [$item->name, $item->total_loans];
        }
        return collect($data);
    }
    

    public function headings(): array
    {
        return [
            'Data',
            'Nilai'
        ];
    }

    public function title(): string
    {
        return 'Dashboard Summary';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'size' => 14],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'color' => ['argb' => 'FF4F81BD']
                ],
                'font' => ['color' => ['argb' => 'FFFFFFFF']]
            ],
            // Style section headers
            2 => ['font' => ['bold' => true]],
            8 => ['font' => ['bold' => true]],
            14 => ['font' => ['bold' => true]],
        ];
    }
}
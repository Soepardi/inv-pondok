<?php

namespace App\Exports;

use App\Models\Loan;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LoansExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $type;

    public function __construct($type = 'all')
    {
        $this->type = $type;
    }

    public function collection()
    {
        $query = Loan::with(['item', 'user']);
        
        switch ($this->type) {
            case 'active':
                $query->where('returned_at', null);
                break;
            case 'overdue':
                $query->where('returned_at', null)
                      ->where('return_date', '<', now());
                break;
            case 'returned':
                $query->whereNotNull('returned_at');
                break;
        }
        
        return $query->get();
    }

    public function headings(): array
    {
        return [
            'Kode Peminjaman',
            'Nama Barang',
            'Peminjam',
            'Tanggal Pinjam',
            'Tanggal Jatuh Tempo',
            'Tanggal Dikembalikan',
            'Status',
            'Keterlambatan (Hari)'
        ];
    }

    public function map($loan): array
    {
        $status = $loan->returned_at ? 'Dikembalikan' : 
                 ($loan->return_date < now() ? 'Terlambat' : 'Aktif');
        
        $delayDays = $loan->returned_at ? 
                    max(0, $loan->return_date->diffInDays($loan->returned_at, false)) :
                    ($loan->return_date < now() ? now()->diffInDays($loan->return_date) : 0);

        return [
            $loan->loan_code,
            $loan->item->name,
            $loan->user->name,
            $loan->loan_date->format('d/m/Y'),
            $loan->return_date->format('d/m/Y'),
            $loan->returned_at ? $loan->returned_at->format('d/m/Y') : '-',
            $status,
            $delayDays > 0 ? $delayDays . ' hari' : '-'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'color' => ['argb' => 'FFE6E6FA']
                ]
            ],
        ];
    }
}
<?php

namespace App\Exports;

use App\Models\Item;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ItemsExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $type;

    public function __construct($type = 'all')
    {
        $this->type = $type;
    }

    public function collection()
    {
        $query = Item::with('institution');
        
        switch ($this->type) {
            case 'available':
                $query->where('condition', 'tersedia')->where('status', 'baik');
                break;
            case 'borrowed':
                $query->where('condition', 'dipinjam');
                break;
            case 'damaged':
                $query->where('status', '!=', 'baik');
                break;
        }
        
        return $query->get();
    }

    public function headings(): array
    {
        return [
            'Kode Barang',
            'Nama Barang',
            'Deskripsi',
            'Harga',
            'Stok',
            'Lokasi',
            'Status',
            'Kondisi',
            'Institusi',
            'Tanggal Dibuat'
        ];
    }

    public function map($item): array
    {
        return [
            $item->item_code,
            $item->name,
            $item->description,
            'Rp ' . number_format($item->price, 0, ',', '.'),
            $item->stock,
            $item->location,
            ucfirst($item->status),
            ucfirst($item->condition),
            $item->institution->name,
            $item->created_at->format('d/m/Y H:i'),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold text
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
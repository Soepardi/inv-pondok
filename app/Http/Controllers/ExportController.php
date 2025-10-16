<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Loan;
use App\Models\Institution;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

class ExportController extends Controller
{
    public function exportItems()
    {
        $items = Item::with('institution')->get();
        
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // Set document properties
        $spreadsheet->getProperties()
            ->setCreator('Inventory System')
            ->setLastModifiedBy('Inventory System')
            ->setTitle('Data Barang Inventaris')
            ->setSubject('Export Data Barang')
            ->setDescription('Data barang inventaris yang diekspor dari sistem');
        
        // Set page setup
        $sheet->getPageSetup()
            ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
            ->setPaperSize(PageSetup::PAPERSIZE_A4);
        
        // Set title
        $sheet->setCellValue('A1', 'DATA BARANG INVENTARIS');
        $sheet->mergeCells('A1:J1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        
        // Set export info
        $sheet->setCellValue('A2', 'Diekspor pada: ' . date('d/m/Y H:i:s'));
        $sheet->mergeCells('A2:J2');
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('A2')->getFont()->setItalic(true);
        
        // Set headers
        $headers = [
            'NO',
            'KODE BARANG',
            'NAMA BARANG', 
            'DESKRIPSI',
            'HARGA',
            'STOK',
            'LOKASI',
            'STATUS',
            'KONDISI',
            'INSTITUSI',
            'TANGGAL DIBUAT'
        ];
        
        $sheet->fromArray($headers, null, 'A4');
        
        // Style headers
        $headerStyle = [
            'font' => [
                'bold' => true, 
                'color' => ['argb' => Color::COLOR_WHITE]
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'color' => ['argb' => '4F81BD'] // Blue
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['argb' => '000000'],
                ],
            ],
        ];
        $sheet->getStyle('A4:K4')->applyFromArray($headerStyle);
        
        // Add data
        $row = 5;
        $number = 1;
        foreach ($items as $item) {
            $sheet->setCellValue('A' . $row, $number);
            $sheet->setCellValue('B' . $row, $item->item_code);
            $sheet->setCellValue('C' . $row, $item->name);
            $sheet->setCellValue('D' . $row, $item->description);
            $sheet->setCellValue('E' . $row, 'Rp ' . number_format($item->price, 0, ',', '.'));
            $sheet->setCellValue('F' . $row, $item->stock);
            $sheet->setCellValue('G' . $row, $item->location);
            $sheet->setCellValue('H' . $row, ucfirst($item->status));
            $sheet->setCellValue('I' . $row, ucfirst($item->condition));
            $sheet->setCellValue('J' . $row, $item->institution->name);
            $sheet->setCellValue('K' . $row, $item->created_at->format('d/m/Y H:i'));
            
            $row++;
            $number++;
        }
        
        // Style data rows
        $dataStyle = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['argb' => 'D3D3D3'],
                ],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER
            ],
        ];
        $lastRow = $row - 1;
        $sheet->getStyle('A5:K' . $lastRow)->applyFromArray($dataStyle);
        
        // Auto size columns
        foreach (range('A', 'K') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }
        
        // Set column width for description
        $sheet->getColumnDimension('D')->setWidth(30);
        
        // Center align number and stock columns
        $sheet->getStyle('A5:A' . $lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('F5:F' . $lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        
        // Add filters
        $sheet->setAutoFilter('A4:K' . $lastRow);
        
        // Freeze panes (header row)
        $sheet->freezePane('A5');
        
        $filename = 'data_barang_inventaris_' . date('Y-m-d_H-i-s') . '.xlsx';
        
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="' . $filename . '"');
        header('Cache-Control: max-age=0');
        header('Pragma: no-cache');
        header('Expires: 0');
        
        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    }

    public function exportLoans()
    {
    $loans = Loan::with(['item', 'user'])->get();
    
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    
    // Set document properties
    $spreadsheet->getProperties()
        ->setCreator('Inventory System')
        ->setLastModifiedBy('Inventory System')
        ->setTitle('Data Peminjaman')
        ->setSubject('Export Data Peminjaman')
        ->setDescription('Data peminjaman barang yang diekspor dari sistem');
    
    // Set title
    $sheet->setCellValue('A1', 'DATA PEMINJAMAN BARANG');
    $sheet->mergeCells('A1:I1');
    $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
    $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
    
    // Set export info
    $sheet->setCellValue('A2', 'Diekspor pada: ' . date('d/m/Y H:i:s'));
    $sheet->mergeCells('A2:I2');
    $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
    $sheet->getStyle('A2')->getFont()->setItalic(true);
    
    // Set headers
    $headers = [
        'NO',
        'KODE PEMINJAMAN',
        'NAMA BARANG',
        'PEMINJAM', 
        'TANGGAL PINJAM',
        'TANGGAL JATUH TEMPO',
        'TANGGAL DIKEMBALIKAN',
        'STATUS',
        'KETERLAMBATAN (HARI)'
    ];
    
    $sheet->fromArray($headers, null, 'A4');
    
    // Style headers
    $headerStyle = [
        'font' => [
            'bold' => true, 
            'color' => ['argb' => Color::COLOR_WHITE]
        ],
        'fill' => [
            'fillType' => Fill::FILL_SOLID,
            'color' => ['argb' => '2E75B6'] // Darker blue
        ],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical' => Alignment::VERTICAL_CENTER
        ],
        'borders' => [
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
                'color' => ['argb' => '000000'],
            ],
        ],
    ];
    $sheet->getStyle('A4:I4')->applyFromArray($headerStyle);
    
    // Add data
    $row = 5;
    $number = 1;
    foreach ($loans as $loan) {
        // Format dates dengan handling yang aman
        $loanDate = $loan->loan_date ? 
                   (is_string($loan->loan_date) ? \Carbon\Carbon::parse($loan->loan_date) : $loan->loan_date) : 
                   null;
        
        $dueDate = $loan->due_date ? 
                  (is_string($loan->due_date) ? \Carbon\Carbon::parse($loan->due_date) : $loan->due_date) : 
                  null;
        
        $returnDate = $loan->return_date ? 
                     (is_string($loan->return_date) ? \Carbon\Carbon::parse($loan->return_date) : $loan->return_date) : 
                     null;

        // Tentukan status berdasarkan kondisi yang ada
        $status = $loan->status;
        
        // Hitung keterlambatan dengan handling yang aman
        $delayDays = 0;
        if ($loan->status === 'approved' && $dueDate) {
            $dueDateCarbon = is_string($dueDate) ? \Carbon\Carbon::parse($dueDate) : $dueDate;
            if ($dueDateCarbon->isPast() && !$returnDate) {
                $delayDays = now()->diffInDays($dueDateCarbon);
            }
        } elseif ($loan->status === 'returned' && $dueDate && $returnDate) {
            $dueDateCarbon = is_string($dueDate) ? \Carbon\Carbon::parse($dueDate) : $dueDate;
            $returnDateCarbon = is_string($returnDate) ? \Carbon\Carbon::parse($returnDate) : $returnDate;
            $delayDays = max(0, $dueDateCarbon->diffInDays($returnDateCarbon, false));
        }

        $sheet->setCellValue('A' . $row, $number);
        $sheet->setCellValue('B' . $row, 'LOAN-' . str_pad($loan->id, 4, '0', STR_PAD_LEFT));
        $sheet->setCellValue('C' . $row, $loan->item->name);
        $sheet->setCellValue('D' . $row, $loan->user->name);
        $sheet->setCellValue('E' . $row, $loanDate ? $loanDate->format('d/m/Y') : '-');
        $sheet->setCellValue('F' . $row, $dueDate ? $dueDate->format('d/m/Y') : '-');
        $sheet->setCellValue('G' . $row, $returnDate ? $returnDate->format('d/m/Y') : 'BELUM DIKEMBALIKAN');
        $sheet->setCellValue('H' . $row, strtoupper($loan->status));
        $sheet->setCellValue('I' . $row, $delayDays > 0 ? $delayDays : '-');
        
        // Style status cell based on status
        $statusCell = 'H' . $row;
        $statusStyle = $spreadsheet->getActiveSheet()->getStyle($statusCell);
        
        if ($loan->status === 'rejected') {
            $statusStyle->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FF0000');
            $statusStyle->getFont()->getColor()->setARGB(Color::COLOR_WHITE);
        } elseif ($loan->status === 'approved') {
            $statusStyle->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('00B050');
            $statusStyle->getFont()->getColor()->setARGB(Color::COLOR_WHITE);
        } elseif ($loan->status === 'returned') {
            $statusStyle->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('0070C0');
            $statusStyle->getFont()->getColor()->setARGB(Color::COLOR_WHITE);
        } else {
            $statusStyle->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFC000');
            $statusStyle->getFont()->getColor()->setARGB(Color::COLOR_BLACK);
        }
        
        $statusStyle->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        
        $row++;
        $number++;
    }
        
        // Style data rows
        $dataStyle = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['argb' => 'D3D3D3'],
                ],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER
            ],
        ];
        $lastRow = $row - 1;
        $sheet->getStyle('A5:I' . $lastRow)->applyFromArray($dataStyle);
        
        // Auto size columns
        foreach (range('A', 'I') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }
        
        // Center align number and date columns
        $sheet->getStyle('A5:A' . $lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('E5:G' . $lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('I5:I' . $lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        
        // Add filters
        $sheet->setAutoFilter('A4:I' . $lastRow);
        
        // Freeze panes
        $sheet->freezePane('A5');
        
        $filename = 'data_peminjaman_' . date('Y-m-d_H-i-s') . '.xlsx';
        
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="' . $filename . '"');
        header('Cache-Control: max-age=0');
        header('Pragma: no-cache');
        header('Expires: 0');
        
        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    }

    public function exportDashboard()
    {
    // Get summary data - SESUAIKAN DENGAN STRUKTUR TABEL
    $totalItems = Item::count();
    $availableItems = Item::where('condition', 'tersedia')->where('status', 'baik')->count();
    $borrowedItems = Item::where('condition', 'dipinjam')->count();
    $damagedItems = Item::where('status', '!=', 'baik')->count();
    
    // Statistik peminjaman berdasarkan status
    $pendingLoans = Loan::where('status', 'pending')->count();
    $approvedLoans = Loan::where('status', 'approved')->count();
    $returnedLoans = Loan::where('status', 'returned')->count();
    $rejectedLoans = Loan::where('status', 'rejected')->count();
    
    // Peminjaman aktif (approved dan belum dikembalikan)
    $activeLoans = Loan::where('status', 'approved')->whereNull('return_date')->count();
    
    // Peminjaman terlambat (approved, belum dikembalikan, dan due_date sudah lewat)
    $overdueLoans = Loan::where('status', 'approved')
                       ->whereNull('return_date')
                       ->where('due_date', '<', now()->format('Y-m-d'))
                       ->count();

    // Get popular items
    $popularItems = \DB::table('loans')
        ->join('items', 'loans.item_id', '=', 'items.id')
        ->select('items.name', \DB::raw('COUNT(loans.id) as total_loans'))
        ->groupBy('items.id', 'items.name')
        ->orderByDesc('total_loans')
        ->limit(10)
        ->get();

    // Get recent loans dengan handling date yang aman
    $recentLoans = Loan::with(['item', 'user'])
        ->orderBy('created_at', 'desc')
        ->limit(10)
        ->get()
        ->map(function ($loan) {
            // Ensure dates are properly formatted
            $loan->formatted_loan_date = $loan->loan_date ? 
                (is_string($loan->loan_date) ? \Carbon\Carbon::parse($loan->loan_date)->format('d/m/Y') : $loan->loan_date->format('d/m/Y')) 
                : '-';
            return $loan;
        });

    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    
    // Set document properties
    $spreadsheet->getProperties()
        ->setCreator('Inventory System')
        ->setLastModifiedBy('Inventory System')
        ->setTitle('Dashboard Summary')
        ->setSubject('Export Dashboard Summary')
        ->setDescription('Ringkasan dashboard inventaris yang diekspor dari sistem');
    
    // Set title
    $sheet->setCellValue('A1', 'LAPORAN DASHBOARD INVENTARIS');
    $sheet->mergeCells('A1:D1');
    $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
    $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
    $sheet->getStyle('A1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('4F81BD');
    $sheet->getStyle('A1')->getFont()->getColor()->setARGB(Color::COLOR_WHITE);
    
    // Set export info
    $sheet->setCellValue('A2', 'Diekspor pada: ' . date('d/m/Y H:i:s'));
    $sheet->mergeCells('A2:D2');
    $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
    $sheet->getStyle('A2')->getFont()->setItalic(true);
    
    $currentRow = 4;
    
    // Ringkasan Inventaris
    $sheet->setCellValue('A' . $currentRow, 'RINGKASAN INVENTARIS');
    $sheet->mergeCells('A' . $currentRow . ':D' . $currentRow);
    $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true)->setSize(12);
    $sheet->getStyle('A' . $currentRow)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('D9E1F2');
    $currentRow++;
    
    $summaryData = [
        ['Total Barang', $totalItems, 'Semua item dalam sistem'],
        ['Barang Tersedia', $availableItems, 'Siap dipinjam, kondisi baik'],
        ['Barang Dipinjam', $borrowedItems, 'Sedang dipinjam oleh user'],
        ['Barang Tidak Tersedia', $damagedItems, 'Rusak atau dalam perbaikan'],
    ];
    
    $sheet->setCellValue('A' . $currentRow, 'ITEM');
    $sheet->setCellValue('B' . $currentRow, 'JUMLAH');
    $sheet->setCellValue('C' . $currentRow, 'PERSENTASE');
    $sheet->setCellValue('D' . $currentRow, 'KETERANGAN');
    $sheet->getStyle('A' . $currentRow . ':D' . $currentRow)->getFont()->setBold(true);
    $currentRow++;
    
    foreach ($summaryData as $data) {
        $percentage = $totalItems > 0 ? round(($data[1] / $totalItems) * 100, 1) : 0;
        $sheet->setCellValue('A' . $currentRow, $data[0]);
        $sheet->setCellValue('B' . $currentRow, $data[1]);
        $sheet->setCellValue('C' . $currentRow, $percentage . '%');
        $sheet->setCellValue('D' . $currentRow, $data[2]);
        $currentRow++;
    }
    
    $currentRow++; // Empty row
    
    // Statistik Peminjaman
    $sheet->setCellValue('A' . $currentRow, 'STATISTIK PEMINJAMAN');
    $sheet->mergeCells('A' . $currentRow . ':D' . $currentRow);
    $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true)->setSize(12);
    $sheet->getStyle('A' . $currentRow)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('E2EFDA');
    $currentRow++;
    
    $totalLoans = $pendingLoans + $approvedLoans + $returnedLoans + $rejectedLoans;
    $loanData = [
        ['Pending', $pendingLoans, 'Menunggu persetujuan'],
        ['Disetujui', $approvedLoans, 'Sudah disetujui'],
        ['Dikembalikan', $returnedLoans, 'Sudah dikembalikan'],
        ['Ditolak', $rejectedLoans, 'Permohonan ditolak'],
        ['Aktif', $activeLoans, 'Sedang dipinjam'],
        ['Terlambat', $overdueLoans, 'Melebihi tanggal jatuh tempo'],
    ];
    
    $sheet->setCellValue('A' . $currentRow, 'STATUS');
    $sheet->setCellValue('B' . $currentRow, 'JUMLAH');
    $sheet->setCellValue('C' . $currentRow, 'PERSENTASE');
    $sheet->setCellValue('D' . $currentRow, 'KETERANGAN');
    $sheet->getStyle('A' . $currentRow . ':D' . $currentRow)->getFont()->setBold(true);
    $currentRow++;
    
    foreach ($loanData as $data) {
        $percentage = $totalLoans > 0 ? round(($data[1] / $totalLoans) * 100, 1) : 0;
        $sheet->setCellValue('A' . $currentRow, $data[0]);
        $sheet->setCellValue('B' . $currentRow, $data[1]);
        $sheet->setCellValue('C' . $currentRow, $percentage . '%');
        $sheet->setCellValue('D' . $currentRow, $data[2]);
        $currentRow++;
    }
    
    $currentRow++; // Empty row
    
    // Barang Populer
    $sheet->setCellValue('A' . $currentRow, '10 BARANG PALING SERING DIPINJAM');
    $sheet->mergeCells('A' . $currentRow . ':D' . $currentRow);
    $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true)->setSize(12);
    $sheet->getStyle('A' . $currentRow)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFF2CC');
    $currentRow++;
    
    // Headers for popular items
    $sheet->setCellValue('A' . $currentRow, 'NO');
    $sheet->setCellValue('B' . $currentRow, 'NAMA BARANG');
    $sheet->setCellValue('C' . $currentRow, 'TOTAL PEMINJAMAN');
    $sheet->setCellValue('D' . $currentRow, 'RATA-RATA/BULAN');
    $sheet->getStyle('A' . $currentRow . ':D' . $currentRow)->getFont()->setBold(true);
    $currentRow++;
    
    $popularNumber = 1;
    foreach ($popularItems as $item) {
        $monthlyAvg = $item->total_loans > 0 ? round($item->total_loans / 12, 1) : 0;
        $sheet->setCellValue('A' . $currentRow, $popularNumber);
        $sheet->setCellValue('B' . $currentRow, $item->name);
        $sheet->setCellValue('C' . $currentRow, $item->total_loans);
        $sheet->setCellValue('D' . $currentRow, $monthlyAvg);
        $currentRow++;
        $popularNumber++;
    }
    
    $currentRow++; // Empty row
    
    // Peminjaman Terbaru
    $sheet->setCellValue('A' . $currentRow, '10 PEMINJAMAN TERBARU');
    $sheet->mergeCells('A' . $currentRow . ':D' . $currentRow);
    $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true)->setSize(12);
    $sheet->getStyle('A' . $currentRow)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FCE4D6');
    $currentRow++;
    
    $sheet->setCellValue('A' . $currentRow, 'NO');
    $sheet->setCellValue('B' . $currentRow, 'BARANG');
    $sheet->setCellValue('C' . $currentRow, 'PEMINJAM');
    $sheet->setCellValue('D' . $currentRow, 'TANGGAL PINJAM');
    $sheet->getStyle('A' . $currentRow . ':D' . $currentRow)->getFont()->setBold(true);
    $currentRow++;
    
    $recentNumber = 1;
    foreach ($recentLoans as $loan) {
        $sheet->setCellValue('A' . $currentRow, $recentNumber);
        $sheet->setCellValue('B' . $currentRow, $loan->item->name);
        $sheet->setCellValue('C' . $currentRow, $loan->user->name);
        $sheet->setCellValue('D' . $currentRow, $loan->formatted_loan_date);
        $currentRow++;
        $recentNumber++;
    }
        
        // Auto size columns
        foreach (range('A', 'D') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }
        
        // Style borders for all data
        $styleArray = [
            'borders' => [
                'outline' => [
                    'borderStyle' => Border::BORDER_MEDIUM,
                    'color' => ['argb' => '000000'],
                ],
                'inside' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['argb' => 'D3D3D3'],
                ],
            ],
        ];
        $sheet->getStyle('A4:D' . ($currentRow-1))->applyFromArray($styleArray);
        
        // Center align numbers and percentages
        $sheet->getStyle('B6:B9')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('C6:C9')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('B13:B22')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('C13:C22')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('D13:D22')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('A' . ($currentRow - $recentLoans->count() - 2) . ':A' . ($currentRow-1))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('D' . ($currentRow - $recentLoans->count() - 2) . ':D' . ($currentRow-1))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        
        $filename = 'laporan_dashboard_' . date('Y-m-d_H-i-s') . '.xlsx';
        
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="' . $filename . '"');
        header('Cache-Control: max-age=0');
        header('Pragma: no-cache');
        header('Expires: 0');
        
        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    }
}
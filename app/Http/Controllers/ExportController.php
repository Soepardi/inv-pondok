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
        $user = auth()->user();
        $query = Item::with('institution');

        // Filter by institution if admin has one
        if ($user->role === 'admin' && $user->institution_id) {
            $query->where('institution_id', $user->institution_id);
        }

        $items = $query->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // ... (rest of exportItems setup)

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
        $user = auth()->user();
        $query = Loan::with(['item', 'user']);

        // Filter by institution if admin has one
        if ($user->role === 'admin' && $user->institution_id) {
            $query->whereHas('item', function ($q) use ($user) {
                $q->where('institution_id', $user->institution_id);
            });
        }

        $loans = $query->get();

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
        $user = auth()->user();
        $stats = $this->getDashboardStats($user);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $this->setupDashboardSheet($spreadsheet, $sheet);

        $row = 4;
        $row = $this->writeInventorySummary($sheet, $row, $stats);
        $row++; // Empty row
        $row = $this->writeLoanStatistics($sheet, $row, $stats);
        $row++; // Empty row
        $row = $this->writePopularItems($sheet, $row, $stats['popularItems']);
        $row++; // Empty row
        $row = $this->writeRecentLoans($sheet, $row, $stats['recentLoans']);

        // Final styling
        $this->finalizeDashboardSheet($sheet, $row, $stats['recentLoans']->count());

        $this->downloadExcel($spreadsheet, 'laporan_dashboard');
    }

    private function getDashboardStats($user)
    {
        // Base queries scoped by institution
        $itemsQuery = Item::query();
        $loansQuery = Loan::query();

        if ($user->role === 'admin' && $user->institution_id) {
            $itemsQuery->where('institution_id', $user->institution_id);
            $loansQuery->whereHas('item', function ($q) use ($user) {
                $q->where('institution_id', $user->institution_id);
            });
        }

        return [
            'totalItems' => (clone $itemsQuery)->count(),
            'availableItems' => (clone $itemsQuery)->where('condition', 'tersedia')->where('status', 'baik')->count(),
            'borrowedItems' => (clone $itemsQuery)->where('condition', 'dipinjam')->count(),
            'damagedItems' => (clone $itemsQuery)->where('status', '!=', 'baik')->count(),

            'loans' => [
                'pending' => (clone $loansQuery)->where('status', 'pending')->count(),
                'approved' => (clone $loansQuery)->where('status', 'approved')->count(),
                'returned' => (clone $loansQuery)->where('status', 'returned')->count(),
                'rejected' => (clone $loansQuery)->where('status', 'rejected')->count(),
                'active' => (clone $loansQuery)->where('status', 'approved')->whereNull('return_date')->count(),
                'overdue' => (clone $loansQuery)->where('status', 'approved')
                    ->whereNull('return_date')
                    ->where('due_date', '<', now()->format('Y-m-d'))
                    ->count(),
            ],

            'popularItems' => \DB::table('loans')
                ->join('items', 'loans.item_id', '=', 'items.id')
                ->select('items.name', \DB::raw('COUNT(loans.id) as total_loans'))
                ->when($user->role === 'admin' && $user->institution_id, function ($q) use ($user) {
                    return $q->where('items.institution_id', $user->institution_id);
                })
                ->groupBy('items.id', 'items.name')
                ->orderByDesc('total_loans')
                ->limit(10)
                ->get(),

            'recentLoans' => $loansQuery->with(['item', 'user'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($loan) {
                    $loan->formatted_loan_date = $loan->loan_date ?
                        (is_string($loan->loan_date) ? \Carbon\Carbon::parse($loan->loan_date)->format('d/m/Y') : $loan->loan_date->format('d/m/Y'))
                        : '-';
                    return $loan;
                }),
        ];
    }

    private function setupDashboardSheet(Spreadsheet $spreadsheet, $sheet)
    {
        $spreadsheet->getProperties()
            ->setCreator('Inventory System')
            ->setLastModifiedBy('Inventory System')
            ->setTitle('Dashboard Summary')
            ->setSubject('Export Dashboard Summary')
            ->setDescription('Ringkasan dashboard inventaris yang diekspor dari sistem');

        $sheet->setCellValue('A1', 'LAPORAN DASHBOARD INVENTARIS');
        $sheet->mergeCells('A1:D1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('A1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('4F81BD');
        $sheet->getStyle('A1')->getFont()->getColor()->setARGB(Color::COLOR_WHITE);

        $sheet->setCellValue('A2', 'Diekspor pada: ' . date('d/m/Y H:i:s'));
        $sheet->mergeCells('A2:D2');
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('A2')->getFont()->setItalic(true);
    }

    private function writeInventorySummary($sheet, $row, $stats)
    {
        $sheet->setCellValue('A' . $row, 'RINGKASAN INVENTARIS');
        $sheet->mergeCells('A' . $row . ':D' . $row);
        $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(12);
        $sheet->getStyle('A' . $row)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('D9E1F2');
        $row++;

        $summaryData = [
            ['Total Barang', $stats['totalItems'], 'Semua item dalam sistem'],
            ['Barang Tersedia', $stats['availableItems'], 'Siap dipinjam, kondisi baik'],
            ['Barang Dipinjam', $stats['borrowedItems'], 'Sedang dipinjam oleh user'],
            ['Barang Tidak Tersedia', $stats['damagedItems'], 'Rusak atau dalam perbaikan'],
        ];

        $sheet->setCellValue('A' . $row, 'ITEM');
        $sheet->setCellValue('B' . $row, 'JUMLAH');
        $sheet->setCellValue('C' . $row, 'PERSENTASE');
        $sheet->setCellValue('D' . $row, 'KETERANGAN');
        $sheet->getStyle('A' . $row . ':D' . $row)->getFont()->setBold(true);
        $row++;

        foreach ($summaryData as $data) {
            $percentage = $stats['totalItems'] > 0 ? round(($data[1] / $stats['totalItems']) * 100, 1) : 0;
            $sheet->setCellValue('A' . $row, $data[0]);
            $sheet->setCellValue('B' . $row, $data[1]);
            $sheet->setCellValue('C' . $row, $percentage . '%');
            $sheet->setCellValue('D' . $row, $data[2]);

            // Center align numbers
            $sheet->getStyle('B' . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('C' . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $row++;
        }

        return $row;
    }

    private function writeLoanStatistics($sheet, $row, $stats)
    {
        $sheet->setCellValue('A' . $row, 'STATISTIK PEMINJAMAN');
        $sheet->mergeCells('A' . $row . ':D' . $row);
        $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(12);
        $sheet->getStyle('A' . $row)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('E2EFDA');
        $row++;

        $loans = $stats['loans'];
        $totalLoans = $loans['pending'] + $loans['approved'] + $loans['returned'] + $loans['rejected'];

        $loanData = [
            ['Pending', $loans['pending'], 'Menunggu persetujuan'],
            ['Disetujui', $loans['approved'], 'Sudah disetujui'],
            ['Dikembalikan', $loans['returned'], 'Sudah dikembalikan'],
            ['Ditolak', $loans['rejected'], 'Permohonan ditolak'],
            ['Aktif', $loans['active'], 'Sedang dipinjam'],
            ['Terlambat', $loans['overdue'], 'Melebihi tanggal jatuh tempo'],
        ];

        $sheet->setCellValue('A' . $row, 'STATUS');
        $sheet->setCellValue('B' . $row, 'JUMLAH');
        $sheet->setCellValue('C' . $row, 'PERSENTASE');
        $sheet->setCellValue('D' . $row, 'KETERANGAN');
        $sheet->getStyle('A' . $row . ':D' . $row)->getFont()->setBold(true);
        $row++;

        foreach ($loanData as $data) {
            $percentage = $totalLoans > 0 ? round(($data[1] / $totalLoans) * 100, 1) : 0;
            $sheet->setCellValue('A' . $row, $data[0]);
            $sheet->setCellValue('B' . $row, $data[1]);
            $sheet->setCellValue('C' . $row, $percentage . '%');
            $sheet->setCellValue('D' . $row, $data[2]);

            // Center align numbers
            $sheet->getStyle('B' . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('C' . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('D' . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $row++;
        }

        return $row;
    }

    private function writePopularItems($sheet, $row, $popularItems)
    {
        $sheet->setCellValue('A' . $row, '10 BARANG PALING SERING DIPINJAM');
        $sheet->mergeCells('A' . $row . ':D' . $row);
        $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(12);
        $sheet->getStyle('A' . $row)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFF2CC');
        $row++;

        $sheet->setCellValue('A' . $row, 'NO');
        $sheet->setCellValue('B' . $row, 'NAMA BARANG');
        $sheet->setCellValue('C' . $row, 'TOTAL PEMINJAMAN');
        $sheet->setCellValue('D' . $row, 'RATA-RATA/BULAN');
        $sheet->getStyle('A' . $row . ':D' . $row)->getFont()->setBold(true);
        $row++;

        $popularNumber = 1;
        foreach ($popularItems as $item) {
            $monthlyAvg = $item->total_loans > 0 ? round($item->total_loans / 12, 1) : 0;
            $sheet->setCellValue('A' . $row, $popularNumber);
            $sheet->setCellValue('B' . $row, $item->name);
            $sheet->setCellValue('C' . $row, $item->total_loans);
            $sheet->setCellValue('D' . $row, $monthlyAvg);
            $row++;
            $popularNumber++;
        }

        return $row;
    }

    private function writeRecentLoans($sheet, $row, $recentLoans)
    {
        $sheet->setCellValue('A' . $row, '10 PEMINJAMAN TERBARU');
        $sheet->mergeCells('A' . $row . ':D' . $row);
        $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(12);
        $sheet->getStyle('A' . $row)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FCE4D6');
        $row++;

        $sheet->setCellValue('A' . $row, 'NO');
        $sheet->setCellValue('B' . $row, 'BARANG');
        $sheet->setCellValue('C' . $row, 'PEMINJAM');
        $sheet->setCellValue('D' . $row, 'TANGGAL PINJAM');
        $sheet->getStyle('A' . $row . ':D' . $row)->getFont()->setBold(true);
        $row++;

        $recentNumber = 1;
        foreach ($recentLoans as $loan) {
            $sheet->setCellValue('A' . $row, $recentNumber);
            $sheet->setCellValue('B' . $row, $loan->item->name);
            $sheet->setCellValue('C' . $row, $loan->user->name);
            $sheet->setCellValue('D' . $row, $loan->formatted_loan_date);

            // Center align numbers
            $sheet->getStyle('A' . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('D' . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $row++;
            $recentNumber++;
        }

        return $row;
    }

    private function finalizeDashboardSheet($sheet, $lastRow, $recentLoansCount)
    {
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
        $sheet->getStyle('A4:D' . ($lastRow - 1))->applyFromArray($styleArray);
    }

    private function downloadExcel($spreadsheet, $filenamePrefix)
    {
        $filename = $filenamePrefix . '_' . date('Y-m-d_H-i-s') . '.xlsx';

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
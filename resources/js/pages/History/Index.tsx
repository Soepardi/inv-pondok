import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import history from '@/routes/history';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  User, 
  Calendar, 
  CalendarCheck, 
  History as HistoryIcon,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Loan {
  id: number;
  item: {
    name: string;
    item_code: string;
  };
  user?: {
    name: string;
    email: string;
  };
  loan_date: string;
  due_date: string;
  return_date?: string | null;
  status: string;
  notes?: string;
}

interface HistoryProps {
  loans: Loan[];
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Riwayat Peminjaman',
    href: history.index().url,
  },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'returned', label: 'Dikembalikan' },
  { value: 'rejected', label: 'Ditolak' },
  { value: 'approved', label: 'Disetujui' },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'approved': return 'secondary';
    case 'returned': return 'default';
    case 'rejected': return 'destructive';
    default: return 'outline';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'approved': return 'Disetujui';
    case 'returned': return 'Dikembalikan';
    case 'rejected': return 'Ditolak';
    default: return status;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export default function History({ loans }: HistoryProps) {
  const totalLoans = loans.length;
  const returnedLoans = loans.filter(loan => loan.status === 'returned').length;
  const activeLoans = loans.filter(loan => loan.status === 'approved').length;

  const exportToExcel = () => {
    const url = new URL(window.location.href);
    url.pathname = '/export/history';
    window.location.href = url.toString();
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Riwayat Peminjaman" />
      
      <div className="container mx-auto py-6 space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <HistoryIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Riwayat Peminjaman</h1>
              <p className="text-muted-foreground">
                Melacak semua aktivitas peminjaman barang di PTM
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{totalLoans}</p>
                  <p className="text-sm text-muted-foreground">Total Peminjaman</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <HistoryIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{returnedLoans}</p>
                  <p className="text-sm text-muted-foreground">Sudah Dikembalikan</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CalendarCheck className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">{activeLoans}</p>
                  <p className="text-sm text-muted-foreground">Sedang Dipinjam</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4 flex-1">
                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari barang atau user..."
                    className="pl-9"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex gap-2 items-center">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Export Button */}
              <Button variant="outline" onClick={exportToExcel} className="gap-2">
                <Download className="h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table Card */}
        <Card>
          <CardHeader className="px-6 py-4">
            <CardTitle className="text-lg">Data Riwayat Peminjaman</CardTitle>
            <CardDescription>
              {totalLoans} entri ditemukan dalam sistem
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="min-w-[200px]">Barang</TableHead>
                  <TableHead className="min-w-[180px]">User</TableHead>
                  <TableHead className="min-w-[120px]">Tanggal Pinjam</TableHead>
                  <TableHead className="min-w-[120px]">Jatuh Tempo</TableHead>
                  <TableHead className="min-w-[120px]">Tanggal Kembali</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.length > 0 ? (
                  loans.map((loan, index) => (
                    <TableRow key={loan.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Package className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{loan.item?.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {loan.item?.item_code}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                            <User className="h-3 w-3 text-secondary-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">{loan.user?.name ?? '-'}</div>
                            <div className="text-xs text-muted-foreground">
                              {loan.user?.email ?? ''}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(loan.loan_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(loan.due_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {loan.return_date ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CalendarCheck className="h-3 w-3" />
                            {formatDate(loan.return_date)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusVariant(loan.status)} 
                          className="capitalize"
                        >
                          {getStatusText(loan.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <HistoryIcon className="h-12 w-12 opacity-50" />
                        <div className="text-lg font-medium">Belum ada riwayat peminjaman</div>
                        <div className="text-sm">
                          Semua riwayat peminjaman akan muncul di sini
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Empty State Illustration */}
        {loans.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="h-20 w-20 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Package className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Tidak ada riwayat</h3>
                  <p className="text-muted-foreground">
                    Saat ini belum ada riwayat peminjaman barang. Semua aktivitas peminjaman 
                    akan tercatat di halaman ini.
                  </p>
                </div>
                <Button className="mt-4">
                  Lihat Peminjaman Aktif
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
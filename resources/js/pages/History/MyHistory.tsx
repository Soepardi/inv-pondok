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
  Calendar, 
  CalendarCheck, 
  History as HistoryIcon,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck
} from 'lucide-react';
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
  loan_date: string;
  due_date: string;
  return_date?: string | null;
  status: string;
  notes?: string;
}

interface MyHistoryProps {
  loans: Loan[];
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Riwayat Saya',
    href: history.my().url,
  },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'returned', label: 'Dikembalikan' },
  { value: 'approved', label: 'Sedang Dipinjam' },
  { value: 'rejected', label: 'Ditolak' },
  { value: 'pending', label: 'Menunggu' },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'approved': return 'default';
    case 'pending': return 'secondary';
    case 'returned': return 'outline';
    case 'rejected': return 'destructive';
    default: return 'outline';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'approved': return 'Sedang Dipinjam';
    case 'pending': return 'Menunggu Persetujuan';
    case 'returned': return 'Dikembalikan';
    case 'rejected': return 'Ditolak';
    default: return status;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved': return <Package className="h-3 w-3" />;
    case 'pending': return <Clock className="h-3 w-3" />;
    case 'returned': return <CheckCircle2 className="h-3 w-3" />;
    case 'rejected': return <XCircle className="h-3 w-3" />;
    default: return <Clock className="h-3 w-3" />;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getDaysRemaining = (dueDate: string) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function MyHistory({ loans }: MyHistoryProps) {
  const totalLoans = loans.length;
  const returnedLoans = loans.filter(loan => loan.status === 'returned').length;
  const activeLoans = loans.filter(loan => loan.status === 'approved').length;
  const pendingLoans = loans.filter(loan => loan.status === 'pending').length;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Riwayat Peminjaman Saya" />
      
      <div className="container mx-auto py-6 space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Riwayat Peminjaman Saya</h1>
              <p className="text-muted-foreground">
                Melacak semua peminjaman barang yang Anda lakukan
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{totalLoans}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
                </div>
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <HistoryIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{returnedLoans}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Dikembalikan</p>
                </div>
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-orange-600">{activeLoans}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Aktif</p>
                </div>
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">{pendingLoans}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Menunggu</p>
                </div>
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="space-y-2">
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
          </CardContent>
        </Card>

        {/* Table Card */}
        <Card>
          <CardHeader className="px-6 py-4">
            <CardTitle className="text-lg">Riwayat Peminjaman Anda</CardTitle>
            <CardDescription>
              {totalLoans} peminjaman ditemukan dalam riwayat Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="min-w-[200px]">Barang</TableHead>
                  <TableHead className="min-w-[120px]">Tanggal Pinjam</TableHead>
                  <TableHead className="min-w-[120px]">Jatuh Tempo</TableHead>
                  <TableHead className="min-w-[120px]">Tanggal Kembali</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.length > 0 ? (
                  loans.map((loan, index) => {
                    const daysRemaining = getDaysRemaining(loan.due_date);
                    const isOverdue = daysRemaining < 0 && loan.status === 'approved';
                    
                    return (
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
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {formatDate(loan.loan_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-2 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                            <CalendarCheck className="h-3 w-3" />
                            <div>
                              {formatDate(loan.due_date)}
                              {isOverdue && (
                                <div className="text-xs text-destructive font-medium">
                                  Terlambat {Math.abs(daysRemaining)} hari
                                </div>
                              )}
                              {loan.status === 'approved' && daysRemaining >= 0 && (
                                <div className="text-xs text-orange-600 font-medium">
                                  {daysRemaining} hari lagi
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {loan.return_date ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <PackageCheck className="h-3 w-3" />
                              {formatDate(loan.return_date)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={getStatusVariant(loan.status)} 
                            className="capitalize gap-1"
                          >
                            {getStatusIcon(loan.status)}
                            {getStatusText(loan.status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Package className="h-12 w-12 opacity-50" />
                        <div className="text-lg font-medium">Belum ada riwayat peminjaman</div>
                        <div className="text-sm text-center max-w-md">
                          Anda belum melakukan peminjaman barang. Mulai pinjam barang untuk melihat riwayat di sini.
                        </div>
                        <Button className="mt-2">
                          Pinjam Barang Sekarang
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {activeLoans > 0 && (
          <Card>
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-lg">Peminjaman Aktif</CardTitle>
              <CardDescription>
                Anda memiliki {activeLoans} barang yang sedang dipinjam
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Pastikan untuk mengembalikan barang sebelum jatuh tempo untuk menghindari denda.
                  </p>
                </div>
                <Button variant="outline">
                  Lihat Detail Peminjaman Aktif
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
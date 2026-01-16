import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import loansRoute from '@/routes/loans';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { usePage } from "@inertiajs/react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Clipboard,
  Download,
  Upload,
  X,
  CheckCircle2,
  Clock,
  PackageCheck,
  Ban
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";



interface Loan {
  id: number;
  item: { name: string; item_code: string };
  user?: { name: string; email: string };
  loan_date: string;
  due_date: string;
  return_date?: string | null;
  status: string;
  notes?: string;
}

interface LoanIndexProps {
  loans: Loan[];
  current_page: number;
  last_page: number;
  total: number;
  from: number;
  to: number;
  per_page: number;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Daftar Peminjaman', href: loansRoute.index().url },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'returned', label: 'Dikembalikan' },
  { value: 'rejected', label: 'Ditolak' },
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
    case 'approved': return 'Disetujui';
    case 'pending': return 'Pending';
    case 'returned': return 'Dikembalikan';
    case 'rejected': return 'Ditolak';
    default: return status;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved': return <CheckCircle2 className="h-4 w-4" />;
    case 'pending': return <Clock className="h-4 w-4" />;
    case 'returned': return <PackageCheck className="h-4 w-4" />;
    case 'rejected': return <Ban className="h-4 w-4" />;
    default: return null;
  }
};

interface PageProps {
  [key: string]: unknown;
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
  };
  flash: {
    success?: string;
  };
}

export default function LoanIndex({
  loans,
  current_page,
  last_page,
  total,
  from,
  to,
  per_page
}: LoanIndexProps) {
  const [fileUploads, setFileUploads] = useState<Record<number, File | null>>({});
  const [processingLoan, setProcessingLoan] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [perPage, setPerPage] = useState(String(per_page ?? 10));
  const [selectedLoans, setSelectedLoans] = useState<number[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | 'delete' | null>(null);

  const { props } = usePage<PageProps>();
  const flash = props.flash;
  const user = props.auth.user;



  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 500);

    return () => clearTimeout(timer);
  }, [statusFilter, perPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    const url = new URL(window.location.href);

    if (searchTerm) {
      url.searchParams.set('search', searchTerm);
    } else {
      url.searchParams.delete('search');
    }

    if (statusFilter !== 'all') {
      url.searchParams.set('status', statusFilter);
    } else {
      url.searchParams.delete('status');
    }

    if (perPage !== '10') {
      url.searchParams.set('per_page', perPage);
    } else {
      url.searchParams.delete('per_page');
    }

    url.searchParams.set('page', '1');

    router.visit(url.toString(), { preserveState: true });
  };

  const handlePageChange = (page: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    router.visit(url.toString(), { preserveState: true });
  };

  const handleApprove = (id: number) => {
    setProcessingLoan(id);
    router.put(`/loans/${id}/approve`, {}, {
      preserveState: true,
      onFinish: () => setProcessingLoan(null),
    });
  };

  const handleReject = (id: number) => {
    setProcessingLoan(id);
    router.put(`/loans/${id}/reject`, {}, {
      preserveState: true,
      onFinish: () => setProcessingLoan(null),
    });
  };

  const handleReturn = (id: number) => {
    const file = fileUploads[id];
    if (!file) {
      toast.error("Upload bukti foto dulu!");
      return;
    }

    setProcessingLoan(id);

    const formData = new FormData();
    formData.append("return_proof", file);
    formData.append("_method", "PUT");

    router.post(`/loans/${id}/return`, formData, {
      forceFormData: true,
      preserveState: true,
      onSuccess: () => {
        setFileUploads((prev) => ({ ...prev, [id]: null }));
      },
      onError: (errors) => {
        console.error(errors);
        toast.error("Gagal memproses pengembalian.");
      },
      onFinish: () => setProcessingLoan(null),
    });
  };

  const handleFileChange = (id: number, file: File | null) => {
    setFileUploads(prev => ({ ...prev, [id]: file }));
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLoans(loans.map(l => l.id));
    } else {
      setSelectedLoans([]);
    }
  };

  const toggleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedLoans(prev => [...prev, id]);
    } else {
      setSelectedLoans(prev => prev.filter(loanId => loanId !== id));
    }
  };

  const handleMassAction = (action: 'approve' | 'reject' | 'delete') => {
    if (selectedLoans.length === 0) return;
    setPendingAction(action);
    setIsConfirmOpen(true);
  };

  const confirmMassAction = () => {
    if (!pendingAction) return;

    router.post(loansRoute.mass_action().url, {
      loan_ids: selectedLoans,
      action: pendingAction
    }, {
      preserveState: true,
      onSuccess: () => {
        setSelectedLoans([]);
        toast.success(`Berhasil melakukan aksi massal (${pendingAction})`);
      },
      onFinish: () => {
        setSelectedLoans([]);
        setIsConfirmOpen(false);
        setPendingAction(null);
      },
      onError: () => {
        toast.error("Gagal melakukan aksi massal.");
        setIsConfirmOpen(false);
      }
    });
  };


  const exportToExcel = () => {
    const url = new URL(window.location.href);
    url.pathname = '/export/loans';
    window.location.href = url.toString();
  };

  const generatePagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (last_page <= maxVisiblePages) {
      for (let i = 1; i <= last_page; i++) {
        pages.push(i);
      }
    } else {
      if (current_page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(last_page);
      } else if (current_page >= last_page - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = last_page - 3; i <= last_page; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = current_page - 1; i <= current_page + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(last_page);
      }
    }

    return pages;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Daftar Peminjaman" />

      <div className="container mx-auto py-6 space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clipboard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Persetujuan dan Pengembalian</h3>
              <p className="text-muted-foreground">
                Kelola semua pengajuan dan pengembalian peminjaman
              </p>
            </div>
          </div>
        </div>

        {/* Flash Message */}
        {flash.success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {flash.success}
            </AlertDescription>
          </Alert>
        )}

        {/* Streamlined Filters Toolbar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Left Side: Search & Primary Action */}
              <div className="flex flex-1 items-center gap-2 w-full md:max-w-md">
                <form onSubmit={handleSearch} className="flex flex-1 gap-2 items-center w-full">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Cari barang atau user..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button type="submit" className="gap-2 shrink-0">
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline">Cari</span>
                  </Button>
                </form>
              </div>

              {/* Right Side: Filters & Actions */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
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

                {/* Per Page Selector */}
                <Select value={perPage} onValueChange={setPerPage}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                  </SelectContent>
                </Select>

                {/* Export Button */}
                <Button variant="outline" onClick={exportToExcel} className="gap-2 shrink-0" title="Export Excel">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{total}</p>
                  <p className="text-sm text-muted-foreground">Total Peminjaman</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <PackageCheck className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {loans.filter(loan => loan.status === 'pending').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {loans.filter(loan => loan.status === 'approved').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Sedang Dipinjam</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-600">
                    {loans.filter(loan => loan.status === 'returned').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Sudah Dikembalikan</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <PackageCheck className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Card */}
        <Card>
          <CardHeader className="px-6 py-4">
            <CardTitle className="text-lg">Data Peminjaman</CardTitle>
            <CardDescription>
              Menampilkan {from} sampai {to} dari {total} peminjaman
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {/* Checkbox Column for Admin */}
                  {user.role === 'admin' && (
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={loans.length > 0 && selectedLoans.length === loans.length}
                        onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                        aria-label="Select all"
                      />
                    </TableHead>
                  )}
                  <TableHead>Barang</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Tanggal Pinjam</TableHead>
                  <TableHead>Jatuh Tempo</TableHead>
                  <TableHead>Tanggal Kembali</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-48 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.length > 0 ? loans.map((loan, index) => {
                  const file = fileUploads[loan.id];
                  const rowNumber = (current_page - 1) * parseInt(perPage) + index + 1;

                  return (
                    <TableRow key={loan.id}>
                      {/* Checkbox Cell for Admin */}
                      {user.role === 'admin' && (
                        <TableCell>
                          <Checkbox
                            checked={selectedLoans.includes(loan.id)}
                            onCheckedChange={(checked) => toggleSelectOne(loan.id, !!checked)}
                            aria-label={`Select loan ${loan.id}`}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <div>
                          <div className="font-medium">{loan.item?.name}</div>
                          <div className="text-xs text-muted-foreground">{loan.item?.item_code}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={loan.notes}>
                          {loan.notes ?? '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{loan.user?.name ?? '-'}</div>
                          <div className="text-xs text-muted-foreground">{loan.user?.email ?? ''}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(loan.loan_date).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>
                        {new Date(loan.due_date).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>
                        {loan.return_date ? new Date(loan.return_date).toLocaleDateString('id-ID') : '-'}
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
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          {loan.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(loan.id)}
                                disabled={processingLoan === loan.id}
                                className="flex-1"
                              >
                                {processingLoan === loan.id ? "..." : "Approve"}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(loan.id)}
                                disabled={processingLoan === loan.id}
                                className="flex-1"
                              >
                                {processingLoan === loan.id ? "..." : "Reject"}
                              </Button>
                            </div>
                          )}
                          {loan.status === 'approved' && (
                            <div className="space-y-2">
                              <div className="flex gap-2 items-center">
                                <Label htmlFor={`file-${loan.id}`} className="cursor-pointer flex-1">
                                  <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                                    <span>
                                      <Upload className="h-3 w-3" />
                                      {file ? file.name : 'Upload Bukti'}
                                    </span>
                                  </Button>
                                </Label>
                                <Input
                                  id={`file-${loan.id}`}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => handleFileChange(loan.id, e.target.files?.[0] || null)}
                                />
                                {file && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFileChange(loan.id, null)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              {file && (
                                <div className="flex justify-center">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt="Preview"
                                    className="w-16 h-16 object-cover rounded border"
                                  />
                                </div>
                              )}
                              <Button
                                size="sm"
                                onClick={() => handleReturn(loan.id)}
                                disabled={processingLoan === loan.id || !file}
                                className="w-full"
                              >
                                {processingLoan === loan.id ? "Memproses..." : "Konfirmasi Pengembalian"}
                              </Button>
                            </div>
                          )}
                          {(loan.status === 'returned' || loan.status === 'rejected') && (
                            <Badge variant="outline" className="w-full justify-center">
                              Selesai
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <PackageCheck className="h-8 w-8" />
                        <div>Tidak ada data peminjaman</div>
                        <div className="text-sm">
                          {searchTerm || statusFilter !== 'all'
                            ? 'Coba ubah pencarian atau filter'
                            : 'Semua peminjaman telah diproses'
                          }
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Mass Action Floating Bar */}
        {selectedLoans.length > 0 && user.role === 'admin' && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-zinc-900 border shadow-lg rounded-full px-6 py-3 flex items-center gap-4 z-50">
            <span className="text-sm font-medium">{selectedLoans.length} dipilih</span>
            <div className="h-4 w-[1px] bg-border" />
            <Button size="sm" onClick={() => handleMassAction('approve')} className="rounded-full bg-green-600 hover:bg-green-700 text-white">
              Approve
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleMassAction('reject')} className="rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200">
              Reject
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleMassAction('delete')} className="rounded-full">
              Delete
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setSelectedLoans([])} className="rounded-full ml-2 h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Pagination & Limit */}
        <div className="flex flex-col items-center gap-3 mt-4">
          {last_page > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault();
                      if (current_page > 1) handlePageChange(current_page - 1);
                    }}
                    className={current_page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    size={undefined}
                  />
                </PaginationItem>

                {generatePagination().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page as number);
                        }}
                        isActive={page === current_page}
                        className="cursor-pointer"
                        size={undefined}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault();
                      if (current_page < last_page) handlePageChange(current_page + 1);
                    }}
                    className={current_page === last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    size={undefined}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}


        </div>

        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Aksi Massal</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin melakukan aksi <strong>{pendingAction}</strong> pada <strong>{selectedLoans.length}</strong> item yang dipilih?
                Tindakan ini tidak dapat dibatalkan (kecuali reject).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={confirmMassAction} className={pendingAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}>
                Lanjutkan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </AppLayout >
  );
}
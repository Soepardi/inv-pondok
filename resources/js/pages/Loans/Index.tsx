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
  Check,
  CheckCircle2,
  Clock,
  PackageCheck,
  Ban,
  RotateCcw,
  Eye,
  AlertTriangle,
  ImageIcon,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { compressImage, formatFileSize, isAllowedImageType } from "@/lib/image-compressor";



interface Loan {
  id: number;
  item: { name: string; item_code: string };
  user?: { name: string; email: string };
  stock?: number;
  loan_date: string;
  due_date: string;
  return_date?: string | null;
  status: string;
  notes?: string;
  return_proof?: string | null;
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

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const isOverdue = (dueDate: string, status: string) => {
  if (status !== 'approved') return false;
  try {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  } catch {
    return false;
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
  const [processingLoan, setProcessingLoan] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [perPage, setPerPage] = useState(String(per_page ?? 10));
  const [selectedLoans, setSelectedLoans] = useState<number[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | 'delete' | null>(null);

  // Return & Proof dialog states
  const [returnModalLoan, setReturnModalLoan] = useState<Loan | null>(null);
  const [returnProofFile, setReturnProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [viewProofModal, setViewProofModal] = useState<{ url: string; itemName: string } | null>(null);
  const [isCompressingProof, setIsCompressingProof] = useState(false);

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

  const openReturnModal = (loan: Loan) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setReturnModalLoan(loan);
    setReturnProofFile(null);
    setPreviewUrl(null);
  };

  const closeReturnModal = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setReturnModalLoan(null);
    setReturnProofFile(null);
    setPreviewUrl(null);
  };

  const handleReturnFileChange = async (file: File | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (!file) {
      setReturnProofFile(null);
      setPreviewUrl(null);
      return;
    }

    if (!isAllowedImageType(file)) {
      toast.error("Format file tidak didukung! Hanya gambar JPG, PNG, atau WEBP yang diperbolehkan (GIF dan SVG tidak diizinkan demi keamanan).");
      setReturnProofFile(null);
      setPreviewUrl(null);
      return;
    }

    setIsCompressingProof(true);
    try {
      const compressed = await compressImage(file);
      setReturnProofFile(compressed);
      setPreviewUrl(URL.createObjectURL(compressed));
    } catch {
      setReturnProofFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } finally {
      setIsCompressingProof(false);
    }
  };

  const handleConfirmReturn = () => {
    if (!returnModalLoan) return;

    setProcessingLoan(returnModalLoan.id);

    const formData = new FormData();
    if (returnProofFile) {
      formData.append("return_proof", returnProofFile);
    }
    formData.append("_method", "PUT");

    router.post(`/loans/${returnModalLoan.id}/return`, formData, {
      forceFormData: true,
      preserveState: true,
      onSuccess: () => {
        closeReturnModal();
        toast.success(returnProofFile ? "Barang dikembalikan dengan bukti foto!" : "Barang berhasil dikembalikan!");
      },
      onError: (errors) => {
        console.error(errors);
        toast.error("Gagal memproses pengembalian.");
      },
      onFinish: () => setProcessingLoan(null),
    });
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    {/* Checkbox Column for Admin */}
                    {user.role === 'admin' && (
                      <TableHead className="w-[48px] text-center">
                        <Checkbox
                          checked={loans.length > 0 && selectedLoans.length === loans.length}
                          onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                          aria-label="Select all"
                        />
                      </TableHead>
                    )}
                    <TableHead className="min-w-[180px]">Barang</TableHead>
                    <TableHead className="min-w-[150px]">Peminjam</TableHead>
                    <TableHead className="min-w-[120px]">Tgl Pinjam</TableHead>
                    <TableHead className="min-w-[130px]">Jatuh Tempo</TableHead>
                    <TableHead className="min-w-[120px]">Tgl Kembali</TableHead>
                    <TableHead className="min-w-[140px]">Catatan</TableHead>
                    <TableHead className="min-w-[120px]">Status</TableHead>
                    <TableHead className="min-w-[140px] text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.length > 0 ? loans.map((loan) => {
                    const overdue = isOverdue(loan.due_date, loan.status);

                    return (
                      <TableRow key={loan.id} className="hover:bg-muted/40 transition-colors">
                        {/* Checkbox Cell for Admin */}
                        {user.role === 'admin' && (
                          <TableCell className="text-center">
                            <Checkbox
                              checked={selectedLoans.includes(loan.id)}
                              onCheckedChange={(checked) => toggleSelectOne(loan.id, !!checked)}
                              aria-label={`Select loan ${loan.id}`}
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="font-medium text-sm text-foreground flex items-center gap-1.5 flex-wrap">
                              <span>{loan.item?.name ?? 'Barang tidak ditemukan'}</span>
                              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 font-normal">
                                {loan.stock ?? 1} unit
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">{loan.item?.item_code}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="font-medium text-sm text-foreground">{loan.user?.name ?? '-'}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[140px]" title={loan.user?.email}>
                              {loan.user?.email ?? ''}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(loan.loan_date)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className={`text-sm ${overdue ? 'font-semibold text-rose-600 dark:text-rose-400' : 'text-muted-foreground'}`}>
                              {formatDate(loan.due_date)}
                            </div>
                            {overdue && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-1.5 py-0.2 rounded">
                                <AlertTriangle className="h-2.5 w-2.5" />
                                Terlambat
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(loan.return_date)}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[140px] truncate text-xs text-muted-foreground" title={loan.notes || 'Tidak ada catatan'}>
                            {loan.notes || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusVariant(loan.status)}
                            className="capitalize gap-1 text-xs font-normal"
                          >
                            {getStatusIcon(loan.status)}
                            {getStatusText(loan.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {loan.status === 'pending' && (
                            <div className="flex items-center justify-center gap-1.5">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(loan.id)}
                                disabled={processingLoan === loan.id}
                                className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 shadow-sm"
                              >
                                <Check className="h-3.5 w-3.5" />
                                {processingLoan === loan.id ? "..." : "Setujui"}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(loan.id)}
                                disabled={processingLoan === loan.id}
                                className="h-8 px-2.5 text-xs gap-1 shadow-sm"
                              >
                                <X className="h-3.5 w-3.5" />
                                {processingLoan === loan.id ? "..." : "Tolak"}
                              </Button>
                            </div>
                          )}

                          {loan.status === 'approved' && (
                            <div className="flex items-center justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openReturnModal(loan)}
                                className="h-8 px-3 text-xs gap-1.5 border-emerald-500/50 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40 shadow-sm"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Kembalikan
                              </Button>
                            </div>
                          )}

                          {loan.status === 'returned' && (
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="text-xs text-muted-foreground">Selesai</span>
                              {loan.return_proof && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setViewProofModal({
                                    url: `/storage/${loan.return_proof}`,
                                    itemName: loan.item?.name || 'Barang'
                                  })}
                                  className="h-7 px-2 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                                  title="Lihat Foto Bukti"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  Bukti
                                </Button>
                              )}
                            </div>
                          )}

                          {loan.status === 'rejected' && (
                            <div className="flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">Ditolak</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={user.role === 'admin' ? 9 : 8} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                          <PackageCheck className="h-8 w-8 text-muted-foreground/60" />
                          <div className="font-medium text-sm">Tidak ada data peminjaman</div>
                          <div className="text-xs">
                            {searchTerm || statusFilter !== 'all'
                              ? 'Coba ubah pencarian atau filter yang diterapkan'
                              : 'Semua peminjaman telah diproses'
                            }
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>          </CardContent>
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

        {/* Modal Konfirmasi Pengembalian Barang (Opsional Foto Bukti) */}
        <Dialog open={!!returnModalLoan} onOpenChange={(open) => { if (!open) closeReturnModal(); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-emerald-600" />
                Pengembalian Barang
              </DialogTitle>
              <DialogDescription>
                Konfirmasi penerimaan barang pinjaman. Anda dapat mengunggah foto bukti serah terima (opsional).
              </DialogDescription>
            </DialogHeader>

            {returnModalLoan && (
              <div className="space-y-4 py-2">
                {/* Ringkasan Pinjaman */}
                <div className="bg-muted/50 rounded-lg p-3.5 text-sm space-y-2.5 border">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-semibold text-foreground">{returnModalLoan.item?.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{returnModalLoan.item?.item_code}</div>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs shrink-0">
                      {returnModalLoan.stock ?? 1} unit
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
                    <div>
                      <span className="text-muted-foreground">Peminjam:</span>
                      <p className="font-medium text-foreground">{returnModalLoan.user?.name ?? '-'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Batas Kembali:</span>
                      <p className="font-medium text-foreground">{formatDate(returnModalLoan.due_date)}</p>
                    </div>
                  </div>
                  {returnModalLoan.notes && (
                    <div className="text-xs pt-2 border-t">
                      <span className="text-muted-foreground">Catatan Pinjam:</span>
                      <p className="italic text-muted-foreground">{returnModalLoan.notes}</p>
                    </div>
                  )}
                </div>

                {/* Upload Foto Bukti (Opsional) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Foto Bukti Terima / Pengembalian</Label>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded font-normal">Opsional</span>
                  </div>

                  {previewUrl ? (
                    <div className="relative border rounded-lg p-3 flex items-center gap-3 bg-muted/20">
                      <img
                        src={previewUrl}
                        alt="Preview bukti"
                        className="h-16 w-16 object-cover rounded-md border shadow-sm"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <p className="font-medium truncate text-foreground">{returnProofFile?.name}</p>
                        <p className="text-muted-foreground">
                          {returnProofFile ? (returnProofFile.size / 1024).toFixed(1) + ' KB' : ''}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReturnFileChange(null)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        title="Hapus foto"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <label
                        htmlFor="return-proof-modal-input"
                        className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-muted/10 hover:bg-muted/20 text-center"
                      >
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          <Upload className="h-5 w-5" />
                        </div>
                        <div className="text-xs">
                          <span className="font-semibold text-primary">Pilih foto</span> atau klik di sini
                          <p className="text-[11px] text-muted-foreground mt-0.5">JPG, PNG, WEBP (Maksimal 2MB, tanpa GIF/SVG)</p>
                        </div>
                      </label>
                      <Input
                        id="return-proof-modal-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleReturnFileChange(e.target.files?.[0] || null)}
                      />
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    Bisa langsung klik konfirmasi tanpa melampirkan foto jika tidak ada bukti fisik.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={closeReturnModal}
                disabled={processingLoan !== null || isCompressingProof}
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleConfirmReturn}
                disabled={processingLoan !== null || isCompressingProof}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <Check className="h-4 w-4" />
                {processingLoan !== null ? "Menyimpan..." : isCompressingProof ? "Mengompres..." : "Konfirmasi Pengembalian"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Tampilan Foto Bukti Pengembalian */}
        <Dialog open={!!viewProofModal} onOpenChange={(open) => { if (!open) setViewProofModal(null); }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Foto Bukti Pengembalian
              </DialogTitle>
              <DialogDescription>
                Bukti serah terima untuk {viewProofModal?.itemName}
              </DialogDescription>
            </DialogHeader>

            {viewProofModal && (
              <div className="py-2 flex flex-col items-center justify-center">
                <div className="overflow-hidden rounded-lg border bg-black/5 dark:bg-black/20 flex items-center justify-center max-h-[60vh] w-full">
                  <img
                    src={viewProofModal.url}
                    alt="Bukti Pengembalian"
                    className="max-h-[60vh] w-auto max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.png';
                    }}
                  />
                </div>
              </div>
            )}

            <DialogFooter className="flex justify-between sm:justify-between items-center w-full">
              {viewProofModal && (
                <a
                  href={viewProofModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  <Eye className="h-3.5 w-3.5" /> Buka ukuran penuh
                </a>
              )}
              <Button variant="outline" size="sm" onClick={() => setViewProofModal(null)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </AppLayout >
  );
}
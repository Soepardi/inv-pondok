import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react'; // Add router
import history from '@/routes/history';
import { useState, useEffect } from 'react';
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
  Search,
  Filter,
  Download,
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
import { Input } from "@/components/ui/input";
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
  loans: {
    data: Loan[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
  };
  filters: {
    search?: string;
    status?: string;
  };
  per_page: number;
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

export default function MyHistory({ loans, filters, per_page = 10 }: MyHistoryProps) {
  // We can't easily calculate accurate totals for returned/active/pending from just the paginated slice
  // So we might hide these specific summary cards or ask backend for stats separately.
  // For now, let's use the `total` from paginator as generic total.
  // The backend could pass extra stats props if we really want "Active Loans count" etc.

  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState<string>(filters.status || 'all');
  const [perPage, setPerPage] = useState(per_page.toString());

  const applyFilters = (overrideParams: Record<string, string> = {}) => {
    const currentSearch = 'search' in overrideParams ? overrideParams.search : searchTerm;
    const currentStatus = 'status' in overrideParams ? overrideParams.status : statusFilter;
    const currentPerPage = 'per_page' in overrideParams ? overrideParams.per_page : perPage;

    router.get(window.location.pathname, {
      search: currentSearch,
      status: currentStatus === 'all' ? undefined : currentStatus,
      per_page: currentPerPage,
    }, {
      preserveState: true,
      replace: true,
      preserveScroll: true,
    });
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    applyFilters();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    applyFilters({ status: val });
  };

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
        {/* Stats Grid - Simplified as we only have total from paginator */}
        {/* If we want detailed stats, we need to pass them from controller separately. 
            For now, I'll remove the detailed breakdown to avoid showing wrong numbers based on just current page data.
            Or just show Total Peminjaman.
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        </div>

        {/* Streamlined Toolbar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Left Side: Search & Primary Action */}
              <div className="flex flex-1 items-center gap-2 w-full md:max-w-md">
                <form onSubmit={handleSearch} className="flex flex-1 gap-2 items-center w-full">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Cari barang..."
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

              {/* Right Side: Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
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
                <Select value={perPage} onValueChange={(val) => {
                  setPerPage(val);
                  applyFilters({ per_page: val });
                }}>
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
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Table Card */}
        <Card>
          <CardHeader className="px-6 py-4">
            <CardTitle className="text-lg">Riwayat Peminjaman Anda</CardTitle>
            <CardDescription>
              Menampilkan {loans.from} - {loans.to} dari {loans.total} peminjaman
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
                {loans.data.length > 0 ? (
                  loans.data.map((loan, index) => {
                    const daysRemaining = getDaysRemaining(loan.due_date);
                    const isOverdue = daysRemaining < 0 && loan.status === 'approved';
                    const rowNumber = (loans.current_page - 1) * parseInt(perPage) + index + 1;

                    return (
                      <TableRow key={loan.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{rowNumber}</TableCell>
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

        {/* Pagination Controls */}
        {loans.last_page > 1 && (
          <div className="flex justify-center mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (loans.current_page > 1) {
                        router.visit(loans.links[0].url || window.location.href, { preserveScroll: true, preserveState: true, data: { page: loans.current_page - 1 } });
                      }
                    }}
                    className={loans.current_page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {loans.links.filter(link => !link.label.includes('&laquo;') && !link.label.includes('&raquo;')).map((link, i) => {
                  const pageNum = parseInt(link.label);
                  // Show first, last, current, and surrounding pages
                  if (
                    isNaN(pageNum) ||
                    pageNum === 1 ||
                    pageNum === loans.last_page ||
                    (pageNum >= loans.current_page - 1 && pageNum <= loans.current_page + 1)
                  ) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href={link.url || '#'}
                          isActive={link.active}
                          onClick={(e) => {
                            e.preventDefault();
                            if (link.url) router.visit(link.url, { preserveScroll: true, preserveState: true });
                          }}
                        >
                          {link.label}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    (pageNum === loans.current_page - 2 && pageNum > 1) ||
                    (pageNum === loans.current_page + 2 && pageNum < loans.last_page)
                  ) {
                    return <PaginationItem key={i}><PaginationEllipsis /></PaginationItem>;
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (loans.current_page < loans.last_page) {
                        router.visit(loans.links[loans.links.length - 1].url || window.location.href, { preserveScroll: true, preserveState: true, data: { page: loans.current_page + 1 } });
                      }
                    }}
                    className={loans.current_page === loans.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </AppLayout >
  );
}
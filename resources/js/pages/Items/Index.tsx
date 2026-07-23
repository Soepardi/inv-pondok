import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import items from '@/routes/items';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Package,
  Building,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin
} from 'lucide-react';
import { useState, useEffect } from 'react';
import CreateItemDialog from './CreateItemDialog';
import EditItemDialog from './EditItemDialog';
import HeadingSmall from '@/components/heading-small';
import { Item, Institution, ItemForm } from "@/types/item";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ItemsProps {
  items: Item[];
  flash: { success?: string; error?: string };
  institutions: Institution[];
  current_page: number;
  last_page: number;
  total: number;
  from: number;
  to: number;
  per_page: number;
  stats: {
    totalItems: number;
    availableItems: number;
    borrowedItems: number;
    damagedItems: number;
    totalValue: number;
    itemsByStatus: {
      baik: number;
      rusak: number;
      diperbaiki: number;
    };
    itemsByCondition: {
      tersedia: number;
      dipinjam: number;
      hilang: number;
    };
    itemsByInstitution: Array<{
      name: string;
      count: number;
    }>;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Manajemen Barang',
    href: items.index().url,
  },
];

// Konversi Item dari backend ke ItemForm untuk EditItemDialog
function toItemForm(item: Item): ItemForm {
  return {
    id: item.id,
    item_code: item.item_code || "",
    name: item.name,
    description: item.description,
    price: item.price,
    stock: item.stock,
    location: item.location,
    status: item.status,
    condition: item.condition,
    institution_id: item.institution_id,
    photo: item.photo || null,
    purchase_year: item.purchase_year || "",
    source_of_funds: item.source_of_funds || "",
  };
}

export default function Items({
  items: data,
  flash,
  institutions,
  current_page,
  last_page,
  total,
  from,
  to,
  per_page,
  stats // Receive stats from backend
}: ItemsProps) {
  /* 
   * LOGIC FIX: 
   * Previously, this component was doing client-side filtering on `data`. 
   * However, `data` is paginated (e.g. only 10 items). 
   * So searching for an item on Page 2 would fail if you were on Page 1.
   * 
   * NEW LOGIC:
   * We will trigger a router visit for search and filters, 
   * letting the backend handle the query/filtering on the full database.
   */

  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);

  // Initialize state from URL params so they persist on refresh
  const { url } = usePage();
  const searchParams = new URLSearchParams(url.split('?')[1]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedInstitution, setSelectedInstitution] = useState<string>(searchParams.get('institution') || 'all');

  // Debounce search/filter to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedInstitution]);

  // Prevent double-firing on initial mount if not needed, 
  // but usually safe with Inertia's preserveState
  const applyFilters = () => {
    const params = new URLSearchParams();

    if (searchTerm) params.set('search', searchTerm);
    if (selectedInstitution !== 'all') params.set('institution', selectedInstitution);
    if (per_page !== 10) params.set('per_page', String(per_page));

    // Always reset to page 1 when filter changes, 
    // unless we are just navigating pages (which is handled by handlePageChange)
    // Note: The dependency array includes searchTerm/selectedInst, so this runs on their change.

    router.visit(items.index().url + '?' + params.toString(), {
      preserveState: true,
      replace: true,
      preserveScroll: true,
      only: ['items', 'current_page', 'last_page', 'total', 'from', 'to', 'stats', 'per_page']
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedInstitution !== 'all') params.set('institution', selectedInstitution);
    params.set('page', page.toString());

    router.visit(items.index().url + '?' + params.toString(), { preserveState: true });
  };

  /* 
   * Stats are now passed from the backend, so we don't need to calculate them here anymore.
   * This fixes the "NaN" issue and ensures stats reflect the full dataset/query.
   */

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'baik': return 'default';
      case 'rusak': return 'destructive';
      case 'diperbaiki': return 'secondary';
      default: return 'outline';
    }
  };

  const getConditionVariant = (condition: string) => {
    switch (condition) {
      case 'tersedia': return 'default';
      case 'dipinjam': return 'secondary';
      case 'hilang': return 'destructive';
      default: return 'outline';
    }
  };

  const getTrendIcon = (value: number, total: number) => {
    const percentage = (value / total) * 100;
    if (percentage > 70) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (percentage > 30) return <BarChart3 className="h-4 w-4 text-blue-600" />;
    return <TrendingDown className="h-4 w-4 text-orange-600" />;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manajemen Barang" />

      {/* Header */}
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight">Manajemen Barang</h3>
            <p className="text-muted-foreground">
              Kelola semua barang inventaris dan lihat statistik lengkap
            </p>
          </div>
        </div>
      </div>

      {/* Flash messages */}
      {flash?.success && (
        <div className="mx-4 mb-4 rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
          {flash.success}
        </div>
      )}
      {flash?.error && (
        <div className="mx-4 mb-4 rounded-lg bg-red-50 p-4 text-red-800 border border-red-200">
          {flash.error}
        </div>
      )}

      <div className="flex h-full flex-1 flex-col gap-6 p-4">
        {/* Combined Statistics Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Summary Card */}
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Ringkasan Inventaris
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {/* Total */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>Total Barang</span>
                </div>
                <span className="font-semibold text-sm">{stats.totalItems}</span>
              </div>

              {/* Available */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Tersedia</span>
                </div>
                <span className="font-semibold text-sm text-green-600">{stats.availableItems}</span>
              </div>

              {/* Borrowed */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span>Dipinjam</span>
                </div>
                <span className="font-semibold text-sm text-orange-600">{stats.borrowedItems}</span>
              </div>

              {/* Damaged */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span>Rusak</span>
                </div>
                <span className="font-semibold text-sm text-red-600">{stats.damagedItems}</span>
              </div>

              {/* Value */}
              <div className="pt-2 mt-2 border-t flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                  <span>Total Nilai</span>
                </div>
                <span className="font-bold text-purple-600 text-sm">Rp {stats.totalValue.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Distribusi Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {Object.entries(stats.itemsByStatus).map(([status, count]) => {
                const percentage = stats.totalItems > 0 ? (count / stats.totalItems) * 100 : 0;
                let colorClass = "bg-primary";
                if (status === 'rusak') colorClass = "bg-red-500";
                if (status === 'diperbaiki') colorClass = "bg-yellow-500";
                if (status === 'baik') colorClass = "bg-green-500";

                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize text-muted-foreground">{status}</span>
                      <span className="font-medium text-xs">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colorClass}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Condition Distribution */}
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Distribusi Kondisi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {Object.entries(stats.itemsByCondition).map(([condition, count]) => {
                const percentage = stats.totalItems > 0 ? (count / stats.totalItems) * 100 : 0;
                let colorClass = "bg-primary";
                if (condition === 'hilang') colorClass = "bg-red-500";
                if (condition === 'dipinjam') colorClass = "bg-orange-500";
                if (condition === 'tersedia') colorClass = "bg-green-500";

                return (
                  <div key={condition} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize text-muted-foreground">{condition}</span>
                      <span className="font-medium text-xs">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colorClass}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Institution Distribution */}
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                Per Institusi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0 max-h-64 overflow-y-auto pr-2">
              {stats.itemsByInstitution
                .sort((a, b) => b.count - a.count)
                .map((institution) => {
                  const percentage = stats.totalItems > 0 ? (institution.count / stats.totalItems) * 100 : 0;
                  return (
                    <div key={institution.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground truncate max-w-[150px]">{institution.name}</span>
                        <span className="font-medium text-xs">{institution.count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        </div>

        {/* Header dengan Search dan Filter */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setShowCreate(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Barang
            </Button>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center w-full md:w-auto">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Cari barang..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
              <Button type="submit" className="gap-2 shrink-0">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Cari</span>
              </Button>
            </form>
            <div className="hidden md:block w-[1px] h-8 bg-border mx-2"></div>

            <div className="flex gap-2 w-full md:w-auto">
              {/* Per Page */}
              <Select
                value={String(per_page)}
                onValueChange={(value) => {
                  router.get(route('items.index'), {
                    search: searchTerm,
                    institution: selectedInstitution,
                    per_page: value,
                    page: 1
                  }, { preserveState: true, preserveScroll: true });
                }}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder={String(per_page)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                </SelectContent>
              </Select>

              {/* Institution Filter */}
              <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter Institusi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Institusi</SelectItem>
                  {institutions.map((institution) => (
                    <SelectItem key={institution.id} value={institution.id.toString()}>
                      {institution.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Daftar Barang</h2>
            <p className="text-sm text-muted-foreground">
              {data.length} dari {total} barang ditemukan
            </p>
          </div>
          {data.length > 0 && (
            <Badge variant="outline" className="gap-1">
              <MapPin className="h-3 w-3" />
              {new Set(data.map(item => item.location)).size} lokasi berbeda
            </Badge>
          )}
        </div>

        {/* List Items - Table Layout */}
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Barang</TableHead>
                <TableHead>Status & Kondisi</TableHead>
                <TableHead>Stok & Harga</TableHead>
                <TableHead>Lokasi & Instansi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">Tidak ada barang ditemukan</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id} className="group">
                    {/* INFO BARANG */}
                    <TableCell>
                      <div className="flex items-start gap-4">
                        {/* Image Thumbnail */}
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                          {item.photo ? (
                            <img
                              src={`/storage/${item.photo}`}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-secondary">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Text Details */}
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold leading-tight line-clamp-2">{item.name}</span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono bg-muted px-1 py-0.5 rounded">{item.item_code}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* STATUS & KONDISI */}
                    <TableCell>
                      <div className="flex flex-col gap-2 items-start">
                        <Badge variant={getStatusVariant(item.status)} className="capitalize min-w-[80px] justify-center">
                          {item.status}
                        </Badge>
                        <Badge variant={getConditionVariant(item.condition)} className="capitalize min-w-[80px] justify-center">
                          {item.condition}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* STOK & HARGA */}
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground w-10">Stok:</span>
                          <span className="font-semibold">{item.stock ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground w-10">Harga:</span>
                          <span>Rp {item.price?.toLocaleString()}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* LOKASI & INSTANSI */}
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="text-foreground">{item.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                          <Building className="h-3 w-3" />
                          <span>{item.institution?.name || '-'}</span>
                        </div>
                        {(item.purchase_year || item.source_of_funds) && (
                          <div className="flex flex-wrap gap-1 mt-1 text-[10px]">
                            {item.purchase_year && (
                              <Badge variant="outline" className="px-1 py-0 text-zinc-500 font-medium border-zinc-200">
                                Thn: {item.purchase_year}
                              </Badge>
                            )}
                            {item.source_of_funds && (
                              <Badge variant="outline" className="px-1.5 py-0 text-zinc-500 font-medium border-zinc-200 truncate max-w-[120px]" title={item.source_of_funds}>
                                Dana: {item.source_of_funds}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* AKSI */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditItem(item)}
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Yakin hapus item ini?')) {
                              router.delete(items.destroy(item.id).url);
                            }
                          }}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination & Limit */}
        <div className="flex flex-col items-center gap-3 mt-4">
          {last_page > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e: { preventDefault: () => void; }) => {
                      e.preventDefault();
                      if (current_page > 1) handlePageChange(current_page - 1);
                    }}
                    className={current_page === 1 ? 'pointer-events-none opacity-50' : ''} />
                </PaginationItem>

                {Array.from({ length: last_page }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e: { preventDefault: () => void; }) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                      isActive={page === current_page} >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e: { preventDefault: () => void; }) => {
                      e.preventDefault();
                      if (current_page < last_page) handlePageChange(current_page + 1);
                    }}
                    className={current_page === last_page ? 'pointer-events-none opacity-50' : ''} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
          <p className="text-sm text-gray-600">
            Menampilkan {from ?? 0} sampai {to ?? 0} dari {total} barang
          </p>
        </div>
      </div>

      {/* Dialogs */}
      <CreateItemDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        institutions={institutions}
      />

      {editItem && (
        <EditItemDialog
          open={true}
          onClose={() => setEditItem(null)}
          item={toItemForm(editItem)}
          institutions={institutions}
        />
      )}
    </AppLayout>
  );
}
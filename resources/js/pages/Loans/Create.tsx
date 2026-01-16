import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Item } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Package,
  CalendarClock,
  Building,
  MapPin,
  Search,
  Filter,
  SlidersHorizontal
} from 'lucide-react';
import { ReactNode, useState, useMemo, useEffect } from 'react';
import HeadingSmall from '@/components/heading-small';
import LoanItemDialog from './CreateLoanDialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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



interface LoanProps {
  items: {
    data: Item[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
  };
  institutions: Array<{ id: number; name: string; }>;
  filters: {
    search?: string;
    institution?: string;
  };
  per_page: number;
  flash: { success?: string; error?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Barang Tersedia',
    href: '#',
  },
];

export default function Loan({ items, institutions, filters, flash, per_page = 10 }: LoanProps) {
  const [loanItem, setLoanItem] = useState<Item | null>(null);

  // Initialize filter state from URL params
  // Use filters prop values as defaults if available, otherwise 'all'
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [institutionFilter, setInstitutionFilter] = useState<string>(filters.institution || 'all');
  const [perPage, setPerPage] = useState(per_page.toString());
  const [statusFilter, setStatusFilter] = useState<string>('all'); // Backend handles status=baik default, we can keep frontend filter if backend supports it. Note: Controller enforces status=baik in query, so filtering 'rusak' returns nothing. Better validation?
  // Actually Controller enforces where('status', 'baik'). So status filter is useless. I will remove it.
  // Wait, step 595 shows: ->where('status', 'baik'). So only 'baik' items are returned.
  // So "Status" filter in UI is misleading if it offers "Bad".
  // I will leave it empty/hidden or static.


  // No location filter support in backend yet

  // No location filter support in backend yet
  const handleSearch = () => {
    applyFilters();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  const applyFilters = (overrideParams: Record<string, string> = {}) => {
    // Current values (or overrides)
    const currentSearch = 'search' in overrideParams ? overrideParams.search : searchTerm;
    const currentInst = 'institution' in overrideParams ? overrideParams.institution : institutionFilter;
    const currentPerPage = 'per_page' in overrideParams ? overrideParams.per_page : perPage;

    router.get(window.location.pathname, {
      search: currentSearch,
      institution: currentInst === 'all' ? undefined : currentInst,
      per_page: currentPerPage,
    }, {
      preserveState: true,
      replace: true,
      preserveScroll: true,
    });
  };

  const handleInstitutionChange = (val: string) => {
    setInstitutionFilter(val);
    applyFilters({ institution: val });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setInstitutionFilter('all');
    router.visit(route('loans.create'));
  };

  const hasActiveFilters = (filters.search) || (filters.institution);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Barang Tersedia" />

      <div className="container mx-auto py-6 space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Barang Tersedia</h1>
              <p className="text-muted-foreground">
                List barang yang bisa dipinjam di PTM
              </p>
            </div>
          </div>
        </div>

        {/* Flash messages */}
        {flash?.success && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-green-800 text-sm">{flash.success}</p>
          </div>
        )}
        {flash?.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-red-800 text-sm">{flash.error}</p>
          </div>
        )}

        {/* Streamlined Search and Filters Toolbar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Left Side: Search & Primary Action */}
              <div className="flex flex-1 items-center gap-2 w-full md:max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama, kode, atau deskripsi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-9"
                  />
                </div>
                <Button onClick={handleSearch} className="gap-2 shrink-0">
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Cari</span>
                </Button>
              </div>

              {/* Right Side: Filters & Settings */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
                {/* Institution Filter */}
                <Select value={institutionFilter} onValueChange={handleInstitutionChange}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Semua Institusi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Institusi</SelectItem>
                    {institutions.map(inst => (
                      <SelectItem key={inst.id} value={inst.id.toString()}>
                        {inst.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Per Page Selector */}
                <Select
                  value={perPage}
                  onValueChange={(value) => {
                    setPerPage(value);
                    applyFilters({ per_page: value });
                  }}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder={perPage} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                  </SelectContent>
                </Select>

                {/* Reset */}
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetFilters}
                    title="Reset Filter"
                    className="text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Active Filter Badges */}
            {hasActiveFilters && (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-3 w-3" />
                <span>Filter aktif:</span>
                {filters.search && <Badge variant="secondary">Search: {filters.search}</Badge>}
                {filters.institution && <Badge variant="outline">Institusi: {institutions.find(i => i.id.toString() === filters.institution)?.name || 'Custom'}</Badge>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Daftar Barang</h2>
            <p className="text-sm text-muted-foreground">
              {items.data.length} dari {items.total} barang ditemukan (Halaman {items.current_page})
            </p>
          </div>
        </div>

        {/* Items Grid */}
        {items.data.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="h-20 w-20 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Package className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Tidak ada barang ditemukan</h3>
                  <p className="text-muted-foreground">
                    {hasActiveFilters
                      ? 'Coba ubah pencarian atau filter yang digunakan'
                      : 'Tidak ada barang yang tersedia untuk dipinjam'
                    }
                  </p>
                </div>
                {hasActiveFilters && (
                  <Button onClick={resetFilters} variant="outline">
                    Reset Semua Filter
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Foto</TableHead>
                      <TableHead>Nama Barang</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Institusi</TableHead>
                      <TableHead className="text-center">Stok</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="h-10 w-10 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
                            {item.photo ? (
                              <img
                                src={`/storage/${item.photo}`}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {item.description || "Tidak ada deskripsi"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs">{item.item_code}</code>
                        </TableCell>
                        <TableCell>{item.institution?.name || '---'}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{item.stock ?? 0}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => setLoanItem(item)}
                            disabled={item.condition !== 'tersedia' || item.status !== 'baik' || (item.stock ?? 0) <= 0}
                            className="gap-2"
                          >
                            <CalendarClock className="w-4 h-4" />
                            Pinjam
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Pagination Controls */}
            {items.last_page > 1 && (
              <div className="flex items-center justify-center gap-2 py-4">
                <div className="flex gap-1">
                  {items.links.map((link, i) => (
                    <Button
                      key={i}
                      variant={link.active ? "default" : "outline"}
                      size="sm"
                      className={`${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                      onClick={() => link.url && router.visit(link.url, { preserveScroll: true, preserveState: true })}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Loan Dialog */}
        <LoanItemDialog
          open={loanItem !== null}
          onClose={() => setLoanItem(null)}
          item={loanItem}
        />
      </div>
    </AppLayout>
  );
}
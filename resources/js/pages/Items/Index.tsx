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

interface ItemsProps {
  items: Item[];
  flash: { success?: string; error?: string };
  institutions: Institution[];
  current_page: number;
  last_page: number;
  total: number;
  from: number;
  to: number;
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
  to
}: ItemsProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [filteredItems, setFilteredItems] = useState<Item[]>(data);

  // Calculate statistics
  const stats = {
    totalItems: data.length,
    availableItems: data.filter(item => item.condition === 'tersedia').length,
    borrowedItems: data.filter(item => item.condition === 'dipinjam').length,
    damagedItems: data.filter(item => item.status === 'rusak').length,
    totalValue: data.reduce((sum, item) => sum + (item.price * (item.stock || 1)), 0),
    averagePrice: data.length > 0 ? data.reduce((sum, item) => sum + item.price, 0) / data.length : 0,
    itemsByInstitution: institutions.map(inst => ({
      name: inst.name,
      count: data.filter(item => item.institution_id === inst.id).length
    })),
    itemsByStatus: {
      baik: data.filter(item => item.status === 'baik').length,
      rusak: data.filter(item => item.status === 'rusak').length,
      diperbaiki: data.filter(item => item.status === 'diperbaiki').length,
    },
    itemsByCondition: {
      tersedia: data.filter(item => item.condition === 'tersedia').length,
      dipinjam: data.filter(item => item.condition === 'dipinjam').length,
      hilang: data.filter(item => item.condition === 'hilang').length,
    }
  };

  // Filter items berdasarkan search dan institusi
  useEffect(() => {
    let filtered = data;
    
    // Filter berdasarkan search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter berdasarkan institusi
    if (selectedInstitution !== 'all') {
      filtered = filtered.filter(item =>
        item.institution_id === parseInt(selectedInstitution)
      );
    }
    
    setFilteredItems(filtered);
  }, [searchTerm, selectedInstitution, data]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Trigger filter melalui useEffect
  };

  const handlePageChange = (page: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    if (searchTerm) url.searchParams.set('search', searchTerm);
    if (selectedInstitution !== 'all') url.searchParams.set('institution', selectedInstitution);
    
    router.visit(url.toString());
  };

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
        {/* Statistics Overview */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          {/* Total Items */}
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.totalItems}</p>
                  <p className="text-xs text-muted-foreground">Total Barang</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Items */}
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.availableItems}</p>
                  <p className="text-xs text-muted-foreground">Tersedia</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Borrowed Items */}
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">{stats.borrowedItems}</p>
                  <p className="text-xs text-muted-foreground">Dipinjam</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Damaged Items */}
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.damagedItems}</p>
                  <p className="text-xs text-muted-foreground">Rusak</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Value */}
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-purple-600">
                    Rp {stats.totalValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Nilai</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Status Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Distribusi Status
              </CardTitle>
              <CardDescription>
                Kondisi barang berdasarkan status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(stats.itemsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(status)} className="capitalize">
                      {status}
                    </Badge>
                    {getTrendIcon(count, stats.totalItems)}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{count}</p>
                    <p className="text-xs text-muted-foreground">
                      {((count / stats.totalItems) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Condition Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Distribusi Kondisi
              </CardTitle>
              <CardDescription>
                Ketersediaan barang saat ini
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(stats.itemsByCondition).map(([condition, count]) => (
                <div key={condition} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getConditionVariant(condition)} className="capitalize">
                      {condition}
                    </Badge>
                    {getTrendIcon(count, stats.totalItems)}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{count}</p>
                    <p className="text-xs text-muted-foreground">
                      {((count / stats.totalItems) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Institution Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                Per Institusi
              </CardTitle>
              <CardDescription>
                Jumlah barang per institusi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-64 overflow-y-auto">
              {stats.itemsByInstitution
                .sort((a, b) => b.count - a.count)
                .map((institution) => (
                  <div key={institution.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium truncate max-w-32">
                        {institution.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{institution.count}</p>
                      <p className="text-xs text-muted-foreground">
                        {((institution.count / stats.totalItems) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        {/* Header dengan Search dan Filter */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setShowCreate(true)} className="gap-2">
              <Plus className="h-4 w-4" /> 
              Tambah Barang
            </Button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Cari barang..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
            </form>

            {/* Institution Filter */}
            <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
              <SelectTrigger className="w-full sm:w-48">
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

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Daftar Barang</h2>
            <p className="text-sm text-muted-foreground">
              {filteredItems.length} dari {data.length} barang ditemukan
            </p>
          </div>
          {filteredItems.length > 0 && (
            <Badge variant="outline" className="gap-1">
              <MapPin className="h-3 w-3" />
              {new Set(filteredItems.map(item => item.location)).size} lokasi berbeda
            </Badge>
          )}
        </div>
        
        {/* List Items */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Tidak ada barang ditemukan</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm || selectedInstitution !== 'all' 
                  ? 'Coba ubah pencarian atau filter' 
                  : 'Mulai dengan menambahkan barang baru'
                }
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Header dengan Gambar/Icon */}
                <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 relative">
                  {item.photo ? (
                    <img 
                      src={`/storage/${item.photo}`} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-1">
                    <Badge variant={getStatusVariant(item.status)} className="text-xs">
                      {item.status}
                    </Badge>
                    <Badge variant={getConditionVariant(item.condition)} className="text-xs">
                      {item.condition}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {item.institution?.name || 'Tidak ada institusi'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Kode:</span>
                      <span className="font-medium">{item.item_code}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Harga:</span>
                      <span className="font-medium">Rp {item.price.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Stok:</span>
                      <span className="font-medium">{item.stock ?? 0}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Lokasi:</span>
                      <span className="font-medium line-clamp-1">{item.location}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditItem(item)}
                      className="flex-1 gap-1"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm('Yakin hapus item ini?')) {
                          router.delete(items.destroy(item.id).url);
                        }
                      }}
                      className="flex-1 gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Hapus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Menampilkan {from} sampai {to} dari {total} barang
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e: { preventDefault: () => void; }) => {
                      e.preventDefault();
                      if (current_page > 1) handlePageChange(current_page - 1);
                    } }
                    className={current_page === 1 ? 'pointer-events-none opacity-50' : ''} size={undefined}                  />
                </PaginationItem>
                
                {Array.from({ length: last_page }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e: { preventDefault: () => void; }) => {
                        e.preventDefault();
                        handlePageChange(page);
                      } }
                      isActive={page === current_page} size={undefined}                    >
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
                    } }
                    className={current_page === last_page ? 'pointer-events-none opacity-50' : ''} size={undefined}                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
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
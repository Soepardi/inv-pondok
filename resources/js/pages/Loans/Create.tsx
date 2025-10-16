import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
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
import { ReactNode, useState, useMemo } from 'react';
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

interface Item {
  item_code: string;
  id: number;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  location: string;
  status: string;
  condition: string;
  institution?: { id: number; name: string };
  photo: null;
}

interface LoanProps {
  items: Item[];
  flash: { success?: string; error?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Barang Tersedia',
    href: '#',
  },
];

export default function Loan({ items: data, flash }: LoanProps) {
  const [loanItem, setLoanItem] = useState<Item | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [institutionFilter, setInstitutionFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  // Get unique values for filters
  const institutions = useMemo(() => {
    const uniqueInstitutions = Array.from(new Set(
      data
        .filter(item => item.institution?.name)
        .map(item => item.institution!.name)
    ));
    return uniqueInstitutions.sort();
  }, [data]);

  const locations = useMemo(() => {
    const uniqueLocations = Array.from(new Set(
      data.map(item => item.location)
    ));
    return uniqueLocations.sort();
  }, [data]);

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    return data.filter(item => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

      // Condition filter
      const matchesCondition = conditionFilter === 'all' || item.condition === conditionFilter;

      // Institution filter
      const matchesInstitution = institutionFilter === 'all' || 
        item.institution?.name === institutionFilter;

      // Location filter
      const matchesLocation = locationFilter === 'all' || 
        item.location === locationFilter;

      return matchesSearch && matchesStatus && matchesCondition && 
             matchesInstitution && matchesLocation;
    });
  }, [data, searchTerm, statusFilter, conditionFilter, institutionFilter, locationFilter]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setConditionFilter('all');
    setInstitutionFilter('all');
    setLocationFilter('all');
  };

  // Check if any filter is active
  const hasActiveFilters = searchTerm !== '' || 
    statusFilter !== 'all' || 
    conditionFilter !== 'all' || 
    institutionFilter !== 'all' || 
    locationFilter !== 'all';

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

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari barang berdasarkan nama, kode, atau deskripsi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filter Controls */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="baik">Baik</SelectItem>
                      <SelectItem value="rusak">Rusak</SelectItem>
                      <SelectItem value="perbaikan">Perbaikan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Condition Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Kondisi
                  </label>
                  <Select value={conditionFilter} onValueChange={setConditionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Kondisi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kondisi</SelectItem>
                      <SelectItem value="tersedia">Tersedia</SelectItem>
                      <SelectItem value="dipinjam">Dipinjam</SelectItem>
                      <SelectItem value="tidak tersedia">Tidak Tersedia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Institution Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Institusi
                  </label>
                  <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Institusi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Institusi</SelectItem>
                      {institutions.map(institution => (
                        <SelectItem key={institution} value={institution}>
                          {institution}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Lokasi
                  </label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Lokasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Lokasi</SelectItem>
                      {locations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reset Filters Button */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground opacity-0">
                    Reset
                  </label>
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    disabled={!hasActiveFilters}
                    className="w-full gap-2"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Reset Filter
                  </Button>
                </div>
              </div>

              {/* Active Filters Badge */}
              {hasActiveFilters && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Menampilkan {filteredItems.length} dari {data.length} barang
                  </span>
                  {searchTerm && (
                    <Badge variant="secondary" className="gap-1">
                      Pencarian: "{searchTerm}"
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Daftar Barang</h2>
            <p className="text-sm text-muted-foreground">
              {filteredItems.length} barang ditemukan
            </p>
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {/* Item Image/Placeholder */}
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 relative">
                  {item.photo ? (
                    <img 
                      src={`/storage/${item.photo}`} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge 
                      variant={
                        item.condition === 'tersedia' ? 'default' :
                        item.condition === 'dipinjam' ? 'secondary' : 'destructive'
                      }
                    >
                      {item.condition}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {item.institution?.name || 'Tidak ada institusi'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Item Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Kode:</span>
                      <div className="font-medium">{item.item_code}</div>
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Harga:</span>
                      <div className="font-medium">Rp {item.price.toLocaleString()}</div>
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Stok:</span>
                      <div className="font-medium">{item.stock ?? 0}</div>
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Status:</span>
                      <div className="font-medium capitalize">{item.status}</div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground line-clamp-1">{item.location}</span>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2">
                    <Button
                      size="sm"
                      onClick={() => setLoanItem(item)}
                      disabled={item.condition !== 'tersedia' || item.status !== 'baik'}
                      className="w-full gap-2"
                    >
                      <CalendarClock className="w-4 h-4" />
                      {item.condition === 'tersedia' ? 'Pinjam Barang' : 'Tidak Tersedia'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
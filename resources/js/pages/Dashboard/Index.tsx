"use client"

import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package,
  PackageCheck,
  PackageX,
  TrendingUp,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  BarChart3,
  Download,
  CheckCircle2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts"

type PopularItem = {
  item: {
    name: string;
  };
  total: number;
};

type LoanTrend = {
  bulan: string;
  total: number;
};

type LoanItem = {
  id: number;
  item: {
    name: string;
  };
  user: {
    name: string;
  };
  loan_date: string;
  due_date?: string;
  return_date?: string | null;
  status?: string;
};

type DashboardProps = {
  summary: {
    total: number;
    available: number;
    borrowed: number;
    damaged: number;
  };
  upcomingDue: LoanItem[];
  overdue: LoanItem[];
  recentLoans: LoanItem[];
  popularItems: PopularItem[];
  loanTrends: LoanTrend[];
};

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: dashboard().url,
  },
];

// Helper to format "YYYY-MM" to readable Indonesian month string
function formatMonth(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 2) return dateStr;
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const year = parts[0];
  if (monthIdx >= 0 && monthIdx < 12) {
    return `${monthNames[monthIdx]} ${year}`;
  }
  return dateStr;
}

export default function Dashboard() {
  const [exportLoading, setExportLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<"all" | "6m" | "3m">("all");

  const {
    summary = { total: 0, available: 0, borrowed: 0, damaged: 0 },
    upcomingDue = [],
    overdue = [],
    recentLoans = [],
    popularItems = [],
    loanTrends = [],
  } = usePage().props as unknown as DashboardProps;

  // Total metrics
  const totalItems = summary.total || (summary.available + summary.borrowed + summary.damaged) || 0;
  const availablePct = totalItems > 0 ? Math.round((summary.available / totalItems) * 100) : 0;
  const borrowedPct = totalItems > 0 ? Math.round((summary.borrowed / totalItems) * 100) : 0;
  const damagedPct = totalItems > 0 ? Math.round((summary.damaged / totalItems) * 100) : 0;

  // Format loan trends data
  const formattedTrends = useMemo(() => {
    if (!loanTrends || loanTrends.length === 0) {
      return [
        { rawDate: '2026-06', date: 'Jun 2026', Peminjaman: 0 },
        { rawDate: '2026-07', date: 'Jul 2026', Peminjaman: 2 },
      ];
    }

    const mapped = loanTrends.map(item => ({
      rawDate: item.bulan,
      date: formatMonth(item.bulan),
      Peminjaman: Number(item.total) || 0
    }));

    if (timeRange === "3m") {
      return mapped.slice(-3);
    } else if (timeRange === "6m") {
      return mapped.slice(-6);
    }
    return mapped;
  }, [loanTrends, timeRange]);

  const totalLoansInPeriod = useMemo(() => {
    return formattedTrends.reduce((acc, curr) => acc + curr.Peminjaman, 0);
  }, [formattedTrends]);

  // Donut chart status data
  const statusData = useMemo(() => [
    { name: 'Tersedia', value: summary.available, color: '#10b981', pct: availablePct },
    { name: 'Dipinjam', value: summary.borrowed, color: '#f59e0b', pct: borrowedPct },
    { name: 'Rusak / Perbaikan', value: summary.damaged, color: '#f43f5e', pct: damagedPct },
  ], [summary, availablePct, borrowedPct, damagedPct]);

  // Top popular items
  const topItems = useMemo(() => {
    return popularItems.slice(0, 5);
  }, [popularItems]);

  const maxPopularTotal = useMemo(() => {
    if (topItems.length === 0) return 1;
    return Math.max(...topItems.map(i => i.total), 1);
  }, [topItems]);

  const handleExport = (type: 'items' | 'loans' | 'dashboard') => {
    setExportLoading(true);
    try {
      let url = '';
      switch (type) {
        case 'items': url = '/export/items'; break;
        case 'loans': url = '/export/loans'; break;
        case 'dashboard': url = '/export/dashboard'; break;
      }
      window.location.href = url;
    } catch (error) {
      console.error('Export failed:', error);
      alert('Gagal mengekspor data. Silakan coba lagi.');
    } finally {
      setTimeout(() => setExportLoading(false), 2000);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard - Sistem Inventaris PTM" />

      <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
              Dashboard Inventaris
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Ringkasan data inventaris dan aktivitas peminjaman aset
            </p>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg gap-2 text-xs font-medium h-9"
                  disabled={exportLoading}
                >
                  <Download className="h-3.5 w-3.5" />
                  {exportLoading ? 'Mengekspor...' : 'Export Data'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-lg text-xs">
                <DropdownMenuItem onClick={() => handleExport('dashboard')} className="gap-2 py-2 cursor-pointer">
                  <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" /> Export Ringkasan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport('items')} className="gap-2 py-2 cursor-pointer">
                  <Package className="h-3.5 w-3.5 text-muted-foreground" /> Export Data Barang
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('loans')} className="gap-2 py-2 cursor-pointer">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" /> Export Data Peminjaman
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 4 Minimalist Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Barang */}
          <Card className="rounded-xl border border-border/60 bg-card p-4 py-4 gap-2 shadow-none">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Aset</span>
              <Package className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {totalItems.toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Semua unit terdata
              </p>
            </div>
          </Card>

          {/* Card 2: Tersedia */}
          <Card className="rounded-xl border border-border/60 bg-card p-4 py-4 gap-2 shadow-none">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Barang Tersedia</span>
              <PackageCheck className="h-4 w-4 text-emerald-600/70" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold tracking-tight text-foreground flex items-baseline gap-2">
                <span>{summary.available.toLocaleString()}</span>
                <span className="text-xs font-normal text-muted-foreground">({availablePct}%)</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Siap untuk dipinjam
              </p>
            </div>
          </Card>

          {/* Card 3: Dipinjam */}
          <Card className="rounded-xl border border-border/60 bg-card p-4 py-4 gap-2 shadow-none">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Sedang Dipinjam</span>
              <Clock className="h-4 w-4 text-amber-600/70" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold tracking-tight text-foreground flex items-baseline gap-2">
                <span>{summary.borrowed.toLocaleString()}</span>
                <span className="text-xs font-normal text-muted-foreground">({borrowedPct}%)</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Dalam sirkulasi aktif
              </p>
            </div>
          </Card>

          {/* Card 4: Rusak / Perbaikan */}
          <Card className="rounded-xl border border-border/60 bg-card p-4 py-4 gap-2 shadow-none">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Rusak / Perbaikan</span>
              <PackageX className="h-4 w-4 text-rose-600/70" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold tracking-tight text-foreground flex items-baseline gap-2">
                <span>{summary.damaged.toLocaleString()}</span>
                <span className="text-xs font-normal text-muted-foreground">({damagedPct}%)</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Perlu perbaikan aset
              </p>
            </div>
          </Card>
        </div>

        {/* Section: Minimalist Charts (Area Trend & Donut Status) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Area Chart: Tren Peminjaman (8 Cols) */}
          <Card className="lg:col-span-7 xl:col-span-8 rounded-xl border border-border/60 bg-card shadow-none gap-0 py-0">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/40">
              <div className="space-y-0.5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span>Tren Peminjaman Barang</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Frekuensi transaksi peminjaman per periode
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Total: {totalLoansInPeriod} transaksi
                </span>
                <Select value={timeRange} onValueChange={(val: any) => setTimeRange(val)}>
                  <SelectTrigger className="w-32 h-8 rounded-lg text-xs">
                    <SelectValue placeholder="Periode" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg text-xs">
                    <SelectItem value="all">Semua Waktu</SelectItem>
                    <SelectItem value="6m">6 Bulan</SelectItem>
                    <SelectItem value="3m">3 Bulan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="pt-5 pb-3">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formattedTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="minimalEmerald" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/30" />

                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fill: 'currentColor', fontSize: 11 }}
                      className="text-muted-foreground font-normal"
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={6}
                      allowDecimals={false}
                      tick={{ fill: 'currentColor', fontSize: 11 }}
                      className="text-muted-foreground font-normal"
                    />

                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-border bg-popover p-2.5 shadow-sm text-xs space-y-0.5">
                              <p className="font-medium text-popover-foreground">{data.date}</p>
                              <p className="text-emerald-600 font-semibold">{data.Peminjaman} Peminjaman</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="Peminjaman"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#minimalEmerald)"
                      dot={{ r: 3, fill: '#10b981', stroke: '#fff', strokeWidth: 1.5 }}
                      activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Minimalist Donut Chart: Status Barang (4 Cols) */}
          <Card className="lg:col-span-5 xl:col-span-4 rounded-xl border border-border/60 bg-card shadow-none flex flex-col justify-between gap-0 py-0">
            <CardHeader className="pb-2 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span>Distribusi Status Aset</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Rasio ketersediaan barang inventaris
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 pb-4 flex flex-col items-center justify-center flex-1">
              {/* Donut with Minimal Center Metric */}
              <div className="relative w-full max-w-[200px] aspect-square mx-auto flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const p = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-border bg-popover p-2 shadow-sm text-xs space-y-0.5">
                              <p className="font-medium text-popover-foreground">{p.name}</p>
                              <p className="text-muted-foreground">{p.value} Unit ({p.pct}%)</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Minimal Center Counter */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-2xl font-bold tracking-tight text-foreground">
                    {totalItems}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Total Unit
                  </span>
                </div>
              </div>

              {/* Minimal Breakdown Legend */}
              <div className="w-full space-y-2 pt-4 mt-2 border-t border-border/40">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-foreground">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground font-mono text-[11px]">
                      <span>{item.value} unit</span>
                      <span className="text-foreground font-semibold w-8 text-right">{item.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section: Barang Populer & Aktivitas Terbaru */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Barang Populer (5 Cols) */}
          <Card className="lg:col-span-5 rounded-xl border border-border/60 bg-card shadow-none gap-0 py-0">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span>Barang Paling Sering Dipinjam</span>
                </CardTitle>
                <span className="text-xs text-muted-foreground">Top 5</span>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              {topItems.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-xs">
                  Belum ada riwayat peminjaman barang.
                </div>
              ) : (
                topItems.map((popular, index) => {
                  const pct = Math.round((popular.total / maxPopularTotal) * 100);
                  const rankNumber = String(index + 1).padStart(2, '0');
                  return (
                    <div key={popular.item?.name || index} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5 truncate max-w-[240px]">
                          <span className="font-mono text-[11px] font-semibold text-muted-foreground w-5 shrink-0">
                            {rankNumber}
                          </span>
                          <span className="font-medium text-foreground truncate">
                            {popular.item?.name || 'Barang'}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                          {popular.total}x dipinjam
                        </span>
                      </div>

                      {/* Minimal progress line */}
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Aktivitas Terbaru (7 Cols) */}
          <Card className="lg:col-span-7 rounded-xl border border-border/60 bg-card shadow-none gap-0 py-0">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Aktivitas Peminjaman Terbaru</span>
                </CardTitle>
                <span className="text-xs text-muted-foreground">{recentLoans.length} aktivitas</span>
              </div>
            </CardHeader>

            <CardContent className="pt-3 space-y-2">
              {recentLoans.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-xs">
                  Belum ada aktivitas transaksi.
                </div>
              ) : (
                recentLoans.slice(0, 5).map((loan) => (
                  <div
                    key={loan.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="truncate">
                        <p className="font-medium text-foreground truncate">
                          {loan.item?.name || 'Barang'}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Oleh: {loan.user?.name || 'Peminjam'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-0.5">
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                        {loan.status === 'approved' ? 'Disetujui' :
                         loan.status === 'returned' ? 'Dikembalikan' :
                         loan.status === 'pending' ? 'Pending' : (loan.status || 'Aktif')}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {loan.due_date ? `Tempo: ${loan.due_date}` : loan.loan_date}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Section: Pengingat Jatuh Tempo & Keterlambatan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Akan Jatuh Tempo */}
          <Card className="rounded-xl border border-border/60 bg-card shadow-none gap-0 py-0">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-foreground uppercase tracking-wider">
                  <Calendar className="h-3.5 w-3.5 text-amber-600" />
                  <span>Akan Jatuh Tempo</span>
                </CardTitle>
                <span className="text-xs text-muted-foreground font-mono">{upcomingDue.length} item</span>
              </div>
            </CardHeader>
            <CardContent className="pt-3 space-y-2">
              {upcomingDue.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-xs">
                  Tidak ada barang yang mendekati jatuh tempo.
                </div>
              ) : (
                upcomingDue.slice(0, 4).map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 text-xs">
                    <div>
                      <p className="font-medium text-foreground">{loan.item?.name}</p>
                      <p className="text-[11px] text-muted-foreground">Peminjam: {loan.user?.name}</p>
                    </div>
                    <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      {loan.due_date || loan.return_date || '-'}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Keterlambatan (Overdue) */}
          <Card className="rounded-xl border border-border/60 bg-card shadow-none gap-0 py-0">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-foreground uppercase tracking-wider">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                  <span>Keterlambatan Pengembalian</span>
                </CardTitle>
                <span className="text-xs text-muted-foreground font-mono">{overdue.length} item</span>
              </div>
            </CardHeader>
            <CardContent className="pt-3 space-y-2">
              {overdue.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-xs">
                  Semua peminjaman tepat waktu.
                </div>
              ) : (
                overdue.slice(0, 4).map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 text-xs">
                    <div>
                      <p className="font-medium text-foreground">{loan.item?.name}</p>
                      <p className="text-[11px] text-muted-foreground">Peminjam: {loan.user?.name}</p>
                    </div>
                    <span className="font-mono text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                      Lewat: {loan.due_date || loan.return_date || '-'}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
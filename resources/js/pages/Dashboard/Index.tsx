"use client"

import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
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
  UserPlus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from "recharts"

// Type definitions
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
  return_date: string;
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

// Chart configurations
const loanTrendsConfig = {
  Peminjaman: {
    label: "Total Peminjaman",
    color: "var(--chart-1)",
  },
} as const

const popularItemsConfig = {
  value: {
    label: "Total Dipinjam",
    color: "var(--chart-2)",
  },
} as const

const statusConfig = {
  Tersedia: {
    label: "Tersedia",
    color: "var(--chart-2)",
  },
  Dipinjam: {
    label: "Dipinjam",
    color: "var(--chart-3)",
  },
  Tidak_Tersedia: {
    label: "Tidak Tersedia",
    color: "var(--chart-4)",
  },
} as const

export default function Dashboard() {
  const [exportLoading, setExportLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<"90d" | "30d" | "7d">("30d");
  const [popularItemsRange, setPopularItemsRange] = useState<"all" | "month" | "week">("month");
  
  const {
    summary = { total: 0, available: 0, borrowed: 0, damaged: 0 },
    upcomingDue = [],
    overdue = [],
    recentLoans = [],
    popularItems = [],
    loanTrends = [],
  } = usePage().props as unknown as DashboardProps;

  // Prepare chart data with date filtering
  const loanTrendsData = loanTrends.map(item => ({
    date: item.bulan,
    Peminjaman: item.total
  }));

  // Filter loan trends based on time range
  const filteredLoanTrends = loanTrendsData.filter((item: { date: string | number | Date; }, idx: number, arr: typeof loanTrendsData) => {
    const date = new Date(item.date);
    const referenceDate = new Date();
    let monthsToSubtract = 3;
    
    if (timeRange === "30d") {
      monthsToSubtract = 1;
    } else if (timeRange === "7d") {
      // Only include the last 7 entries
      return idx >= arr.length - 7;
    }
    
    const startDate = new Date(referenceDate);
    startDate.setMonth(startDate.getMonth() - monthsToSubtract);
    return date >= startDate;
  });

  // Prepare popular items data
  const popularItemsData = popularItems.slice(0, 6).map((item, index) => ({
    name: item.item.name.length > 15 
      ? item.item.name.substring(0, 15) + '...' 
      : item.item.name,
    fullName: item.item.name,
    value: item.total,
    fill: `var(--chart-${(index % 5) + 1})`
  }));

  // Status distribution data
  const statusData = [
    { name: 'Tersedia', value: summary.available, color: 'var(--chart-2)' },
    { name: 'Dipinjam', value: summary.borrowed, color: 'var(--chart-3)' },
    { name: 'Tidak_Tersedia', value: summary.damaged, color: 'var(--chart-4)' },
  ];

  const handleExport = (type: 'items' | 'loans' | 'dashboard') => {
    setExportLoading(true);
    
    try {
      let url = '';
      
      switch (type) {
        case 'items':
          url = '/export/items';
          break;
        case 'loans':
          url = '/export/loans';
          break;
        case 'dashboard':
          url = '/export/dashboard';
          break;
      }
      
      window.location.href = url;
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Gagal mengekspor data. Silakan coba lagi.');
    } finally {
      setTimeout(() => setExportLoading(false), 2000);
    }
  };

  const statsCards = [
    {
      title: "Total Barang",
      value: summary.total.toLocaleString(),
      icon: Package,
      description: "Semua item inventaris",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30"
    },
    {
      title: "Tersedia",
      value: summary.available.toLocaleString(),
      icon: PackageCheck,
      description: "Barang siap dipinjam",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30"
    },
    {
      title: "Dipinjam",
      value: summary.borrowed.toLocaleString(),
      icon: Users,
      description: "Sedang dipinjam",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30"
    },
    {
      title: "Tidak Tersedia",
      value: summary.damaged.toLocaleString(),
      icon: PackageX,
      description: "Rusak atau dalam perbaikan",
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/30"
    }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Inventaris</h1>
              <p className="text-muted-foreground mt-1">
                Ringkasan statistik dan aktivitas inventaris terbaru
              </p>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="gap-2" 
                    disabled={exportLoading}
                  >
                    <Download className="h-4 w-4" />
                    {exportLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                        Mengekspor...
                      </>
                    ) : (
                      'Export Data'
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem 
                    onClick={() => handleExport('dashboard')}
                    className="gap-2 cursor-pointer"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Export Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleExport('items')}
                    className="gap-2 cursor-pointer"
                  >
                    <Package className="h-4 w-4" />
                    Export Data Barang
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleExport('loans')}
                    className="gap-2 cursor-pointer"
                  >
                    <Users className="h-4 w-4" />
                    Export Data Peminjaman
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat, index) => (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Loan Trends - Interactive Area Chart */}
          <Card>
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
              <div className="grid flex-1 gap-1">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Tren Peminjaman
                </CardTitle>
                <CardDescription>
                  Aktivitas peminjaman dalam periode tertentu
                </CardDescription>
              </div>
              <Select value={timeRange} onValueChange={(value: "90d" | "30d" | "7d") => setTimeRange(value)}>
                <SelectTrigger
                  className="w-[160px] rounded-lg sm:ml-auto"
                  aria-label="Select time range"
                >
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="90d" className="rounded-lg">
                    3 Bulan Terakhir
                  </SelectItem>
                  <SelectItem value="30d" className="rounded-lg">
                    30 Hari Terakhir
                  </SelectItem>
                  <SelectItem value="7d" className="rounded-lg">
                    7 Hari Terakhir
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              {filteredLoanTrends.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                  <PlaceholderPattern />
                </div>
              ) : (
                <ChartContainer
                  config={loanTrendsConfig}
                  className="aspect-auto h-64 w-full"
                >
                  <AreaChart data={filteredLoanTrends}>
                    <defs>
                      <linearGradient id="fillPeminjaman" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-Peminjaman)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-Peminjaman)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                      tickFormatter={(value) => {
                        return value
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) => {
                            return value
                          }}
                          indicator="dot"
                        />
                      }
                    />
                    <Area
                      dataKey="Peminjaman"
                      type="natural"
                      fill="url(#fillPeminjaman)"
                      stroke="var(--color-Peminjaman)"
                      strokeWidth={2}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Popular Items - Interactive Bar Chart */}
          <Card>
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
              <div className="grid flex-1 gap-1">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Barang Populer
                </CardTitle>
                <CardDescription>
                  Barang paling sering dipinjam
                </CardDescription>
              </div>
              <Select value={popularItemsRange} onValueChange={(value: "all" | "month" | "week") => setPopularItemsRange(value)}>
                <SelectTrigger
                  className="w-[160px] rounded-lg sm:ml-auto"
                  aria-label="Select time range"
                >
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="rounded-lg">
                    Semua Waktu
                  </SelectItem>
                  <SelectItem value="month" className="rounded-lg">
                    Bulan Ini
                  </SelectItem>
                  <SelectItem value="week" className="rounded-lg">
                    Minggu Ini
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              {popularItemsData.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                  <PlaceholderPattern />
                </div>
              ) : (
                <ChartContainer
                  config={popularItemsConfig}
                  className="aspect-auto h-64 w-full"
                >
                  <BarChart
                    data={popularItemsData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
                  >
                    <CartesianGrid horizontal={true} vertical={false} />
                    <XAxis 
                      type="number" 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      width={90}
                    />
                    <ChartTooltip
                      cursor={{ fill: 'transparent' }}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value, payload) => {
                            const item = payload?.[0]?.payload;
                            return item?.fullName || value;
                          }}
                        />
                      }
                    />
                    <Bar 
                      dataKey="value" 
                      fill="var(--color-value)"
                      radius={[0, 4, 4, 0]}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Distribution and Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Status Distribution - Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Package className="h-5 w-5 text-muted-foreground" />
                Status Barang
              </CardTitle>
              <CardDescription>
                Distribusi status inventaris
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ChartContainer
                  config={statusConfig}
                  className="h-full w-full"
                >
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="var(--background)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          hideLabel
                        />
                      }
                    />
                    <ChartLegend 
                      content={<ChartLegendContent />}
                      verticalAlign="bottom"
                      height={36}
                    />
                  </PieChart>
                </ChartContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mt-4">
                {statusData.map((item, index) => (
                  <div key={item.name} className="text-center">
                    <div 
                      className="w-3 h-3 rounded-full mx-auto mb-1"
                      style={{ backgroundColor: item.color }}
                    />
                    <p className="text-xs font-medium text-muted-foreground">
                      {item.name.replace('_', ' ')}
                    </p>
                    <p className="text-lg font-bold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Loans */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Aktivitas Terbaru
              </CardTitle>
              <CardDescription>
                Riwayat peminjaman terbaru
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLoans.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Tidak ada data peminjaman</p>
                  </div>
                ) : (
                  recentLoans.slice(0, 6).map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center">
                          <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            {loan.item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Dipinjam oleh {loan.user.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">
                          {loan.loan_date}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Jatuh tempo: {loan.return_date}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming Due */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Akan Jatuh Tempo
                <Badge variant="secondary" className="ml-2">
                  {upcomingDue.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                Barang yang akan segera dikembalikan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingDue.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Tidak ada barang jatuh tempo</p>
                  </div>
                ) : (
                  upcomingDue.slice(0, 4).map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between p-3 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {loan.item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {loan.user.name}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-background text-orange-700 dark:text-orange-300">
                        {loan.return_date}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Overdue Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                Keterlambatan
                <Badge variant="destructive" className="ml-2">
                  {overdue.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                Barang yang terlambat dikembalikan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overdue.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Tidak ada barang terlambat</p>
                  </div>
                ) : (
                  overdue.slice(0, 4).map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {loan.item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {loan.user.name}
                        </p>
                      </div>
                      <Badge variant="destructive">
                        {loan.return_date}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
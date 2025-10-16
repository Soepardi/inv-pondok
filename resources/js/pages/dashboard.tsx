import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PageProps } from "@/types";

type DashboardProps = PageProps<{
  summary: {
    total: number;
    available: number;
    borrowed: number;
    damaged: number;
  };
  upcomingDue: any[];
  overdue: any[];
  recentLoans: any[];
  popularItems: { item: { name: string }; total: number }[];
  loanTrends: { bulan: string; total: number }[];
}>;

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: dashboard().url,
  },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard() {
  const {
    summary = { total: 0, available: 0, borrowed: 0, damaged: 0 },
    upcomingDue = [],
    overdue = [],
    recentLoans = [],
    popularItems = [],
    loanTrends = [],
  } = usePage<DashboardProps>().props;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">

        {/* Ringkasan Inventaris */}
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
          <Card>
            <CardHeader><CardTitle>Total Barang</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{summary.total}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Barang Tersedia</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold text-green-600">{summary.available}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Barang Dipinjam</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold text-blue-600">{summary.borrowed}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Rusak / Tidak Tersedia</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold text-red-600">{summary.damaged}</CardContent>
          </Card>
        </div>

        {/* Informasi Peminjaman */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Barang Akan Jatuh Tempo</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barang</TableHead>
                    <TableHead>Peminjam</TableHead>
                    <TableHead>Jatuh Tempo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingDue.length === 0 ? (
                    <TableRow><TableCell colSpan={3}></TableCell></TableRow>
                  ) : (
                    upcomingDue.map((loan: any) => (
                      <TableRow key={loan.id}>
                        <TableCell>{loan.item?.name}</TableCell>
                        <TableCell>{loan.user?.name}</TableCell>
                        <TableCell><Badge variant="outline">{loan.return_date}</Badge></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Barang Melebihi Batas Waktu</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barang</TableHead>
                    <TableHead>Peminjam</TableHead>
                    <TableHead>Jatuh Tempo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdue.length === 0 ? (
                    <TableRow><TableCell colSpan={3}><PlaceholderPattern /></TableCell></TableRow>
                  ) : (
                    overdue.map((loan: any) => (
                      <TableRow key={loan.id}>
                        <TableCell>{loan.item?.name}</TableCell>
                        <TableCell>{loan.user?.name}</TableCell>
                        <TableCell><Badge className="bg-red-500 text-white">{loan.return_date}</Badge></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Aktivitas Terbaru */}
        <Card>
          <CardHeader><CardTitle>Aktivitas Peminjaman Terbaru</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barang</TableHead>
                  <TableHead>Peminjam</TableHead>
                  <TableHead>Tanggal Pinjam</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLoans.length === 0 ? (
                  <TableRow><TableCell colSpan={3}></TableCell></TableRow>
                ) : (
                  recentLoans.map((loan: any) => (
                    <TableRow key={loan.id}>
                      <TableCell>{loan.item?.name}</TableCell>
                      <TableCell>{loan.user?.name}</TableCell>
                      <TableCell>{loan.loan_date}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Statistik */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Grafik Barang Populer</CardTitle></CardHeader>
            <CardContent className="h-64">
              {popularItems.length === 0 ? (
                <PlaceholderPattern />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={popularItems} cx="50%" cy="50%" outerRadius={80} dataKey="total" label>
                      {popularItems.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Grafik Tren Peminjaman</CardTitle></CardHeader>
            <CardContent className="h-64">
              {loanTrends.length === 0 ? (
                <PlaceholderPattern />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={loanTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bulan" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" stroke="#0088FE" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

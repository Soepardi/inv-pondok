import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  QrCode, 
  Settings, 
  CheckCircle, 
  ArrowRight, 
  Shield,
  Activity,
  Package,
  Clock,
  Users
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Sistem Inventaris - Pesantren Teknologi Majapahit">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700" rel="stylesheet" />
            </Head>
            
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-1/2 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-emerald-50/30 dark:from-background dark:via-blue-950/10 dark:to-emerald-950/10">
                {/* Header Navigation */}
                <header className="relative z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-16 items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <AppLogoIcon className="h-10 w-10" />
                            <div className="flex flex-col">
                                <span className="font-bold text-lg bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                                    Pesantren Teknologi Majapahit
                                </span>
                                <span className="text-xs text-muted-foreground">Kanigoro-Jatirejo-Mojokerto</span>
                            </div>
                        </div>
                        
                        <nav className="flex items-center gap-3">
                            {auth.user ? (
                                <Button asChild className="rounded-lg gap-2">
                                    <Link href={dashboard()}>
                                        <Activity className="h-4 w-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                </Button>
                            ) : (
                                <Button asChild size="lg" className="rounded-lg bg-gradient-to-br from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 gap-2">
                                    <Link href={login()}>
                                        <Shield className="h-4 w-4" />
                                        <span>Masuk ke Sistem</span>
                                    </Link>
                                </Button>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative container px-4 py-16 lg:py-24">
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                        {/* Left Content */}
                        <div className="flex flex-col gap-8">
                            <Badge variant="secondary" className="w-fit px-4 py-1.5 text-sm border-2 gap-2">
                                <Package className="h-3 w-3" />
                                Sistem Inventaris Terintegrasi
                            </Badge>
                            
                            <div className="flex flex-col gap-6">
                                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                                    Kelola{' '}
                                    <span className="bg-gradient-to-br from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                                        Inventaris
                                    </span>{' '}
                                    <br />
                                    Pesantren Dengan{' '}
                                    <span className="bg-gradient-to-br from-amber-500 to-orange-600 bg-clip-text text-transparent">
                                        Teknologi
                                    </span>
                                </h1>
                                <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl leading-relaxed">
                                    Sistem manajemen inventaris modern yang dirancang khusus untuk 
                                    <span className="font-semibold text-foreground"> Pesantren Teknologi Majapahit</span>. 
                                    Pantau, kelola, dan optimalkan semua aset dengan mudah dan efisien.
                                </p>
                            </div>

                            {/* Feature List */}
                            <div className="grid gap-3 py-2">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400 border-2 border-green-200 dark:border-green-800">
                                        <CheckCircle className="h-4 w-4" />
                                    </div>
                                    <span className="text-base font-medium">Tracking aset real-time</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-2 border-blue-200 dark:border-blue-800">
                                        <CheckCircle className="h-4 w-4" />
                                    </div>
                                    <span className="text-base font-medium">Dashboard analytics lengkap</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 border-2 border-purple-200 dark:border-purple-800">
                                        <CheckCircle className="h-4 w-4" />
                                    </div>
                                    <span className="text-base font-medium">Laporan otomatis</span>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                {auth.user ? (
                                    <Button size="lg" asChild className="rounded-xl px-8 py-4 text-lg h-auto bg-gradient-to-br from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 gap-3">
                                        <Link href={dashboard()}>
                                            <Activity className="h-5 w-5" />
                                            <span>Buka Dashboard</span>
                                            <ArrowRight className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button size="lg" asChild className="rounded-xl px-8 py-4 text-lg h-auto bg-gradient-to-br from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all gap-3">
                                        <Link href={login()}>
                                            <Shield className="h-5 w-5" />
                                            <span>Masuk ke Sistem</span>
                                            <ArrowRight className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                )}
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span>Sistem aktif 24/7 • Aman • Terpercaya</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Visual Dashboard */}
                        <div className="relative">
                            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 border-slate-200 dark:bg-slate-900/80 dark:border-slate-700">
                                {/* Mock Dashboard Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <AppLogoIcon className="h-6 w-6" />
                                        <span className="font-semibold text-sm">Dashboard Inventaris</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    {/* Stats Row */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-center border border-blue-200 dark:border-blue-800">
                                            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">485</div>
                                            <div className="text-xs text-blue-600 dark:text-blue-400">Total Aset</div>
                                        </div>
                                        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 text-center border border-green-200 dark:border-green-800">
                                            <div className="text-xl font-bold text-green-600 dark:text-green-400">98%</div>
                                            <div className="text-xs text-green-600 dark:text-green-400">Kondisi Baik</div>
                                        </div>
                                        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 text-center border border-amber-200 dark:border-amber-800">
                                            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">12</div>
                                            <div className="text-xs text-amber-600 dark:text-amber-400">Perlu Perbaikan</div>
                                        </div>
                                    </div>
                                    
                                    {/* Chart Mock */}
                                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm font-medium">Distribusi Aset</span>
                                            <span className="text-xs text-muted-foreground">Bulan Ini</span>
                                        </div>
                                        <div className="flex items-end gap-1 h-16">
                                            <div className="flex-1 bg-blue-500 rounded-t-lg h-12"></div>
                                            <div className="flex-1 bg-emerald-500 rounded-t-lg h-16"></div>
                                            <div className="flex-1 bg-amber-500 rounded-t-lg h-8"></div>
                                            <div className="flex-1 bg-purple-500 rounded-t-lg h-10"></div>
                                            <div className="flex-1 bg-blue-500 rounded-t-lg h-14"></div>
                                        </div>
                                    </div>
                                    
                                    {/* Recent Activity */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-medium">Aktivitas Terbaru</span>
                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span>Laptop Lab - Dipinjam</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                <span>Proyektor - Kembali</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Floating Elements */}
                            <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500 rounded-2xl rotate-12 opacity-20 animate-float"></div>
                            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-emerald-500 rounded-2xl -rotate-12 opacity-20 animate-float animation-delay-2000"></div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="relative container px-4 py-16">
                    <div className="text-center mb-12">
                        <Badge variant="outline" className="mb-4 px-4 py-1.5 gap-2">
                            <Package className="h-3 w-3" />
                            Fitur Unggulan
                        </Badge>
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mb-4">
                            Semua yang dibutuhkan untuk{' '}
                            <span className="bg-gradient-to-br from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                                Manajemen Inventaris
                            </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        <Card className="border-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-lg">
                            <CardHeader className="text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 mb-4">
                                    <BarChart3 className="h-8 w-8" />
                                </div>
                                <CardTitle>Dashboard Real-time</CardTitle>
                                <CardDescription>
                                    Pantau semua aset dengan dashboard interaktif dan update real-time
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-2 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 hover:shadow-lg">
                            <CardHeader className="text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 mb-4">
                                    <QrCode className="h-8 w-8" />
                                </div>
                                <CardTitle>Asset Tracking</CardTitle>
                                <CardDescription>
                                    Lacak aset dengan sistem yang terintegrasi dan mudah digunakan
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-2 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300 hover:shadow-lg">
                            <CardHeader className="text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 mb-4">
                                    <Settings className="h-8 w-8" />
                                </div>
                                <CardTitle>Smart Maintenance</CardTitle>
                                <CardDescription>
                                    Sistem perawatan dan maintenance aset secara berkala
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="relative container px-4 py-16 bg-muted/50 rounded-3xl mx-4 md:mx-auto max-w-6xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div className="flex flex-col items-center gap-2">
                            <Package className="h-8 w-8 text-blue-600" />
                            <div className="text-2xl font-bold">500+</div>
                            <div className="text-sm text-muted-foreground">Aset Terkelola</div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Users className="h-8 w-8 text-emerald-600" />
                            <div className="text-2xl font-bold">50+</div>
                            <div className="text-sm text-muted-foreground">Pengguna Aktif</div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                            <div className="text-2xl font-bold">100%</div>
                            <div className="text-sm text-muted-foreground">Optimisasi</div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Clock className="h-8 w-8 text-amber-600" />
                            <div className="text-2xl font-bold">24/7</div>
                            <div className="text-sm text-muted-foreground">System Uptime</div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="relative container px-4 py-16 text-center">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mb-4">
                            Siap Mengoptimalkan{' '}
                            <span className="bg-gradient-to-br from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                                Manajemen Inventaris
                            </span>{' '}
                            PTM
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            Masuk untuk memulai menggunakan sistem inventaris Pesantren Teknologi Majapahit
                        </p>
                        {!auth.user && (
                            <Button size="lg" asChild className="rounded-xl px-8 py-4 text-lg h-auto bg-gradient-to-br from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 shadow-lg hover:shadow-xl gap-3">
                                <Link href={login()}>
                                    <Shield className="h-5 w-5" />
                                    <span>Masuk Sekarang</span>
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="relative border-t bg-background/80 backdrop-blur">
                    <div className="container flex flex-col gap-6 px-4 py-8 md:py-12">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="flex items-center gap-3">
                                <AppLogoIcon className="h-10 w-10" />
                                <div className="flex flex-col">
                                    <span className="font-bold text-lg">Pesantren Teknologi Majapahit</span>
                                    <span className="text-xs text-muted-foreground">Kanigoro-Jatirejo-Mojokerto</span>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Sistem Inventaris Modern untuk mendukung kemajuan pendidikan di pesantren Teknologi Majapahit.
                            </p>
                        </div>
                        
                        <div className="flex flex-col items-center gap-4 border-t pt-8">
                            <p className="text-xs text-muted-foreground">
                                © 2025 Pesantren Teknologi Majapahit. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>

            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(12deg); }
                    50% { transform: translateY(-20px) rotate(12deg); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </>
    );
}
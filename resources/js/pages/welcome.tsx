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
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-32 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-1/2 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 min-h-screen bg-gradient-to-br from-background via-green-50/30 to-emerald-50/30 dark:from-background dark:via-green-950/10 dark:to-emerald-950/10">
                {/* Header Navigation */}
                <header className="relative z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-yellow-500"></div>
                    <div className="w-full max-w-[1600px] mx-auto flex h-16 items-center justify-between px-6 lg:px-16">
                        <div className="flex items-center gap-3">
                            <AppLogoIcon className="h-10 w-10 object-contain" />
                            <div className="flex flex-col">
                                <span className="font-bold text-lg tracking-tight">
                                    Pesantren Teknologi Majapahit
                                </span>
                                <span className="text-xs text-muted-foreground">Kanigoro-Jatirejo-Mojokerto</span>
                            </div>
                        </div>

                        <nav className="flex items-center gap-3">
                            {auth.user ? (
                                <Button asChild className="rounded-lg gap-2 bg-green-600 hover:bg-green-700">
                                    <Link href={auth.user.role === 'admin' ? dashboard().url : '/loans'}>
                                        <Activity className="h-4 w-4" />
                                        <span>{auth.user.role === 'admin' ? 'Dashboard' : 'Inventaris'}</span>
                                    </Link>
                                </Button>
                            ) : (
                                <Button asChild size="lg" className="rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 gap-2 font-bold transition-all hover:scale-105 active:scale-95">
                                    <Link href={login().url}>
                                        <Shield className="h-4 w-4" />
                                        <span>Masuk ke Sistem</span>
                                    </Link>
                                </Button>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative w-full max-w-[1600px] mx-auto px-6 lg:px-16 py-16 lg:py-24">
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                        {/* Left Content */}
                        <div className="flex flex-col gap-8 text-left">
                            <Badge variant="secondary" className="w-fit px-4 py-1.5 text-sm border-2 gap-2 bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                                <Package className="h-3.5 w-3.5" />
                                Sistem Inventaris Terintegrasi
                            </Badge>

                            <div className="flex flex-col gap-6">
                                <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl xl:text-7xl/none">
                                    Kelola{' '}
                                    <span className="bg-gradient-to-br from-green-500 to-emerald-600 bg-clip-text text-transparent">
                                        Inventaris
                                    </span>{' '}
                                    <br />
                                    Pesantren Dengan{' '}
                                    <span className="bg-gradient-to-br from-yellow-500 to-orange-600 bg-clip-text text-transparent">
                                        Teknologi
                                    </span>
                                </h1>
                                <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl leading-relaxed">
                                    Sistem manajemen inventaris modern yang dirancang khusus untuk
                                    <span className="font-semibold text-foreground"> Pesantren Teknologi Majapahit</span>.
                                    Pantau, kelola, dan optimalkan semua aset dengan mudah dan efisien.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                {auth.user ? (
                                    <Button asChild size="lg" className="h-12 px-8 rounded-xl bg-green-600 hover:bg-green-700 gap-2 shadow-xl shadow-green-200 dark:shadow-none transition-all">
                                        <Link href={dashboard().url}>
                                            Buka Dashboard
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button asChild size="lg" className="h-12 px-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 gap-2 transition-all">
                                            <Link href={login().url}>
                                                Mulai Sekarang
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-8 pt-4">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold">100%</span>
                                    <span className="text-xs text-muted-foreground">Digitalized</span>
                                </div>
                                <div className="border-l h-8 border-zinc-200" />
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold">24/7</span>
                                    <span className="text-xs text-muted-foreground">Monitoring</span>
                                </div>
                                <div className="border-l h-8 border-zinc-200" />
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold">Real-time</span>
                                    <span className="text-xs text-muted-foreground">Updates</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Visual Mockup */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                            <Card className="relative rounded-2xl border-2 border-zinc-100 bg-background/50 backdrop-blur overflow-hidden shadow-2xl transition-all duration-500 group-hover:scale-[1.01]">
                                <CardHeader className="border-b bg-muted/50 p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-rose-400" />
                                            <div className="w-3 h-3 rounded-full bg-amber-400" />
                                            <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                        </div>
                                        <div className="ml-4 h-6 w-48 bg-background/50 rounded-md border text-[10px] flex items-center px-2 text-muted-foreground">
                                            peminjaman-terbaru.ptm.id
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="p-8 space-y-6">
                                        <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl border border-green-100 dark:bg-green-950/20 dark:border-green-900/30">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                                                    <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-zinc-900 dark:text-zinc-100">Proyektor EPSON</p>
                                                    <p className="text-xs text-green-600 font-medium">Tersedia untuk dipinjam</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-green-500 hover:bg-green-600 border-none px-3">Baru</Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border rounded-xl space-y-3">
                                                <Activity className="h-5 w-5 text-emerald-500" />
                                                <div>
                                                    <p className="text-sm font-bold">1.2k+ Unit</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Total Aset</p>
                                                </div>
                                            </div>
                                            <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border rounded-xl space-y-3">
                                                <Clock className="h-5 w-5 text-yellow-500" />
                                                <div>
                                                    <p className="text-sm font-bold">85 Unit</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Aktif Dipinjam</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-xl border space-y-4">
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Riwayat Terakhir</p>
                                                <Users className="h-4 w-4 text-zinc-400" />
                                            </div>
                                            <div className="space-y-3">
                                                {[1, 2].map(i => (
                                                    <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full ${i === 1 ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'} flex items-center justify-center text-[10px] font-bold`}>
                                                                {i === 1 ? 'SO' : 'AK'}
                                                            </div>
                                                            <p className="text-xs font-medium">{i === 1 ? ' Ust. Soepardi' : 'Ust. Akhiyat'}</p>
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground">{i === 1 ? '2 Menit Lalu' : '15 Menit Lalu'}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="w-full max-w-[1600px] mx-auto px-6 lg:px-16 py-20 border-t border-zinc-100">
                    <div className="flex flex-col gap-12">
                        <div className="text-center max-w-3xl mx-auto space-y-4">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-zinc-900">
                                Fitur Utama <span className="bg-gradient-to-br from-green-500 to-emerald-600 bg-clip-text text-transparent">Inventaris PTM</span>
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Dirancang untuk memberikan kemudahan dan transparansi penuh dalam pengelolaan aset pesantren.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <FeatureCard
                                icon={QrCode}
                                title="Loan Management"
                                description="Setiap barang terdata dengan sistem untuk proses peminjaman dan pengembalian yang instan."
                                color="bg-green-50 text-green-600 dark:bg-green-950/20"
                            />
                            <FeatureCard
                                icon={BarChart3}
                                title="Real-time report"
                                description="Pantau status barang, kerusakan, dan tren peminjaman melalui dashboard analitik yang komprehensif."
                                color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20"
                            />
                            <FeatureCard
                                icon={Shield}
                                title="Data Security"
                                description="Sistem otentikasi berlapis memastikan hanya pihak yang berwenang yang dapat melakukan perubahan data."
                                color="bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20"
                            />
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="w-full border-t bg-background/50 backdrop-blur py-12">
                    <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-16 flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="flex flex-col gap-4 max-w-sm">
                            <div className="flex items-center gap-2">
                                <AppLogoIcon className="h-8 w-8 object-contain" />
                                <span className="font-bold text-xl tracking-tight">Inventaris PTM</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Solusi pengelolaan aset terpadu untuk lingkungan Pesantren Teknologi Majapahit.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-sm uppercase tracking-widest text-zinc-400">Navigasi</h4>
                                <nav className="flex flex-col gap-2 text-sm font-medium">
                                    <Link href="/" className="hover:text-green-600 transition-colors">Beranda</Link>
                                    <Link href={login().url} className="hover:text-green-600 transition-colors">Masuk</Link>
                                    <Link href="#" className="hover:text-green-600 transition-colors">Bantuan</Link>
                                </nav>
                            </div>
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-sm uppercase tracking-widest text-zinc-400">Kontak</h4>
                                <nav className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
                                    <span>Kanigoro-Jatirejo</span>
                                    <span>Mojokerto, Jatim</span>
                                    <span className="text-foreground">0812-5139-4584</span>
                                </nav>
                            </div>
                        </div>
                    </div>
                    <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-16 mt-12 pt-8 border-t border-zinc-100 flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                            © 2024 Pesantren Teknologi Majapahit. All rights reserved.
                        </p>
                        <div className="flex gap-4">
                            <Settings className="h-4 w-4 text-zinc-300" />
                            <Shield className="h-4 w-4 text-zinc-300" />
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

function FeatureCard({ icon: Icon, title, description, color }: any) {
    return (
        <Card className="rounded-2xl border-2 border-zinc-100 hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 group">
            <CardHeader className="space-y-4">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold">{title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground font-medium">
                    {description}
                </CardDescription>
            </CardHeader>
        </Card>
    );
}
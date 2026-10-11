import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowRight,
    Package,
    Clock,
    QrCode,
    FileSpreadsheet,
    Layers,
    CheckCircle2,
    Search,
    ChevronRight,
    Laptop,
    SlidersHorizontal,
    BellRing,
    CalendarCheck,
    ShieldCheck
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { useEffect } from 'react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    // Enforce permanent light mode on the landing page
    useEffect(() => {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
    }, []);

    return (
        <div className="min-h-screen bg-[#fafbfc] text-zinc-900 selection:bg-emerald-100 selection:text-emerald-900 font-sans">
            <Head title="Sistem Inventaris - Pesantren Teknologi Majapahit">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            {/* Subtle Google-style background grid pattern */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-70"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute top-48 left-10 w-80 h-80 bg-green-100/30 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* Header / Navbar - Google Workspace Style */}
            <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-zinc-200/80 transition-colors">
                <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 p-1 shadow-xs">
                            <AppLogoIcon className="h-7 w-7 object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-base sm:text-lg tracking-tight text-zinc-900">
                                Inventaris PTM
                            </span>
                            <span className="text-[11px] text-zinc-500 hidden sm:block">
                                Pesantren Teknologi Majapahit
                            </span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-zinc-600">
                        <a href="#fitur" className="px-3.5 py-1.5 rounded-full hover:bg-zinc-100 transition-colors">
                            Fitur
                        </a>
                        <a href="#alur" className="px-3.5 py-1.5 rounded-full hover:bg-zinc-100 transition-colors">
                            Alur Peminjaman
                        </a>
                        <a href="#keamanan" className="px-3.5 py-1.5 rounded-full hover:bg-zinc-100 transition-colors">
                            Keamanan
                        </a>
                    </nav>

                    {/* Right CTA */}
                    <div className="flex items-center gap-3">
                        {auth.user ? (
                            <Button
                                asChild
                                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-sm px-5 text-sm font-medium transition-all"
                            >
                                <Link href={auth.user.role === 'admin' ? dashboard().url : '/loans'}>
                                    <span>{auth.user.role === 'admin' ? 'Buka Dashboard' : 'Inventaris Saya'}</span>
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                asChild
                                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-sm px-5 text-sm font-medium transition-all"
                            >
                                <Link href={login().url}>
                                    <span>Masuk ke Akun</span>
                                    <ArrowRight className="h-4 w-4 ml-1.5" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10">
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                        {/* Left Column: Headlines & CTA */}
                        <div className="lg:col-span-6 flex flex-col items-start text-left pt-2">
                            {/* Headline */}
                            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight text-zinc-900 leading-[1.15] mb-5">
                                Kelola inventaris pesantren dengan{' '}
                                <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy decoration-2">
                                    mudah & terukur
                                </span>
                            </h1>

                            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed mb-8 max-w-xl font-normal">
                                Solusi digital terpadu untuk pendataan barang, peminjaman operasional, dan pelacakan riwayat aset di lingkungan Pesantren Teknologi Majapahit.
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mb-10">
                                {auth.user ? (
                                    <Button
                                        asChild
                                        size="lg"
                                        className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-7 h-12 shadow-xs hover:shadow-sm transition-all gap-2 text-sm"
                                    >
                                        <Link href={dashboard().url}>
                                            <span>Masuk Dashboard</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            asChild
                                            size="lg"
                                            className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-7 h-12 shadow-xs hover:shadow-sm transition-all gap-2 text-sm"
                                        >
                                            <Link href={login().url}>
                                                <span>Mulai Sekarang</span>
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="lg"
                                            className="rounded-full border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-medium px-6 h-12 text-sm"
                                        >
                                            <a href="#alur">
                                                Pelajari Alur
                                            </a>
                                        </Button>
                                    </>
                                )}
                            </div>

                            {/* Trust Highlights */}
                            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-zinc-200/80 w-full max-w-lg">
                                <div>
                                    <p className="text-2xl font-bold text-zinc-900">100%</p>
                                    <p className="text-xs text-zinc-500 font-medium mt-0.5">Tercatat Digital</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-zinc-900">Real-time</p>
                                    <p className="text-xs text-zinc-500 font-medium mt-0.5">Cek Ketersediaan</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-zinc-900">Akurat</p>
                                    <p className="text-xs text-zinc-500 font-medium mt-0.5">Log Pengembalian</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Google Workspace Style Interactive Mockup */}
                        <div className="lg:col-span-6">
                            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                                {/* Ambient Glow */}
                                <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500/15 to-teal-400/15 rounded-3xl blur-xl opacity-75"></div>

                                {/* Main Workspace Card */}
                                <div className="relative rounded-2xl bg-white border border-zinc-200/80 shadow-xl overflow-hidden">
                                    {/* Google Console Window Header */}
                                    <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/70 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                                            </div>
                                            <span className="text-xs text-zinc-500 ml-2 font-medium">
                                                ptm.workspace/inventaris
                                            </span>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] bg-white text-emerald-700 border-emerald-200 font-medium">
                                            Live Sistem
                                        </Badge>
                                    </div>

                                    {/* Google-Style Search Pill in Mockup */}
                                    <div className="p-4 sm:p-5 border-b border-zinc-100">
                                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-zinc-100/80 text-zinc-500 text-xs">
                                            <Search className="h-3.5 w-3.5 text-zinc-400" />
                                            <span className="flex-1 truncate">Cari proyektor, kabel HDMI, laptop santri...</span>
                                            <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
                                        </div>

                                        {/* Filter Chips */}
                                        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 text-xs">
                                            <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-medium text-[11px]">
                                                Semua (1.2k)
                                            </span>
                                            <span className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[11px] font-medium">
                                                Tersedia (94%)
                                            </span>
                                            <span className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[11px] font-medium">
                                                Dipinjam (85)
                                            </span>
                                        </div>
                                    </div>

                                    {/* Mockup Dashboard Content */}
                                    <div className="p-4 sm:p-5 space-y-4">
                                        {/* Metric Chips */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-[11px] font-medium text-emerald-800">Total Aset Aktif</span>
                                                    <Package className="h-4 w-4 text-emerald-600" />
                                                </div>
                                                <p className="text-xl font-bold text-zinc-900">1.240 <span className="text-xs font-normal text-zinc-500">Unit</span></p>
                                            </div>

                                            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-[11px] font-medium text-amber-800">Peminjaman Aktif</span>
                                                    <Clock className="h-4 w-4 text-amber-600" />
                                                </div>
                                                <p className="text-xl font-bold text-zinc-900">85 <span className="text-xs font-normal text-zinc-500">Sedang Pakai</span></p>
                                            </div>
                                        </div>

                                        {/* Sample Items List */}
                                        <div className="rounded-xl border border-zinc-100 bg-zinc-50/40 p-3 space-y-2.5">
                                            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-1">
                                                Aktivitas Terbaru
                                            </p>

                                            {/* Item 1 */}
                                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white shadow-2xs border border-zinc-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                                                        <Laptop className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-zinc-800">Proyektor Epson EB-X500</p>
                                                        <p className="text-[11px] text-zinc-500">Dipinjam • Kelas Multimedia</p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                                    Disetujui
                                                </span>
                                            </div>

                                            {/* Item 2 */}
                                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white shadow-2xs border border-zinc-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                                                        <Package className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-zinc-800">Sound Portable Wireless</p>
                                                        <p className="text-[11px] text-zinc-500">Dikembalikan • Masjid Utama</p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                                                    Selesai
                                                </span>
                                            </div>
                                        </div>

                                        {/* Bottom Status Strip */}
                                        <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-zinc-500">
                                            <div className="flex items-center gap-1.5">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                                <span>Audit log sinkronisasi otomatis</span>
                                            </div>
                                            <span className="font-mono text-[10px]">v12.28</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: Workflow / Alur Peminjaman (Google Stepper Style) */}
                <section id="alur" className="w-full py-16 bg-white border-y border-zinc-200/70">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                                Sederhana & Cepat
                            </span>
                            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mt-2">
                                Alur Peminjaman Transparan
                            </h2>
                            <p className="text-zinc-600 text-sm sm:text-base mt-2.5">
                                Dirancang agar seluruh santri, ustadz, dan pengurus dapat memproses peminjaman tanpa birokrasi manual yang rumit.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Step 1 */}
                            <div className="relative flex flex-col p-6 rounded-2xl bg-[#fafbfc] border border-zinc-200/70 hover:border-emerald-300 transition-all shadow-xs">
                                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-4 shadow-sm">
                                    01
                                </div>
                                <h3 className="text-base font-semibold text-zinc-900 mb-2">
                                    Cari & Ajukan Barang
                                </h3>
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                    Pilih barang dari katalog, periksa stok yang siap digunakan, dan ajukan peminjaman lengkap dengan durasi keperluan.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="relative flex flex-col p-6 rounded-2xl bg-[#fafbfc] border border-zinc-200/70 hover:border-emerald-300 transition-all shadow-xs">
                                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-4 shadow-sm">
                                    02
                                </div>
                                <h3 className="text-base font-semibold text-zinc-900 mb-2">
                                    Verifikasi Pengurus
                                </h3>
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                    Admin dan pengurus memverifikasi permohonan melalui dashboard, menyetujui, atau menjadwalkan pengambilan barang.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="relative flex flex-col p-6 rounded-2xl bg-[#fafbfc] border border-zinc-200/70 hover:border-emerald-300 transition-all shadow-xs">
                                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-4 shadow-sm">
                                    03
                                </div>
                                <h3 className="text-base font-semibold text-zinc-900 mb-2">
                                    Pengembalian & Audit
                                </h3>
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                    Barang dikembalikan dengan pemeriksaan kondisi fisik. Riwayat langsung tercatat rapi ke dalam laporan berkala.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: Features (Material 3 Cards) */}
                <section id="fitur" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                            Fitur Lengkap
                        </span>
                        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mt-2">
                            Kemudahan Pengelolaan Aset
                        </h2>
                        <p className="text-zinc-600 text-sm sm:text-base mt-2.5">
                            Semua fitur yang dibutuhkan untuk memastikan aset pesantren terjaga, transparan, dan awet.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Feature 1 */}
                        <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 hover:border-emerald-200 hover:shadow-md transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 mb-4 transition-transform group-hover:scale-105">
                                <QrCode className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                                Kode & Katalog Barang
                            </h3>
                            <p className="text-sm text-zinc-600 leading-relaxed">
                                Setiap unit barang memiliki kode unik, kategori jelas, foto fisik, dan informasi institusi pemilik aset.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 hover:border-emerald-200 hover:shadow-md transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 mb-4 transition-transform group-hover:scale-105">
                                <FileSpreadsheet className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                                Ekspor Laporan Excel
                            </h3>
                            <p className="text-sm text-zinc-600 leading-relaxed">
                                Unduh laporan aset dan rekap peminjaman secara instan dalam format spreadsheet resmi untuk pertanggungjawaban.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 hover:border-emerald-200 hover:shadow-md transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 mb-4 transition-transform group-hover:scale-105">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                                Keamanan & Hak Akses
                            </h3>
                            <p className="text-sm text-zinc-600 leading-relaxed">
                                Pembagian peran terproteksi antara administrator inventaris, pengurus lembaga, dan peminjam umum.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 hover:border-emerald-200 hover:shadow-md transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 mb-4 transition-transform group-hover:scale-105">
                                <BellRing className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                                Peringatan Jatuh Tempo
                            </h3>
                            <p className="text-sm text-zinc-600 leading-relaxed">
                                Pelacakan batas waktu peminjaman untuk mencegah barang tertinggal, lupa dikembalikan, atau hilang.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 hover:border-emerald-200 hover:shadow-md transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4 transition-transform group-hover:scale-105">
                                <Layers className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                                Multi-Institusi / Unit
                            </h3>
                            <p className="text-sm text-zinc-600 leading-relaxed">
                                Dukungan pengelolaan aset lintas lembaga, mulai dari SMP, SMK, Asrama, hingga kantor yayasan.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 hover:border-emerald-200 hover:shadow-md transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700 mb-4 transition-transform group-hover:scale-105">
                                <CalendarCheck className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                                Riwayat Log Lengkap
                            </h3>
                            <p className="text-sm text-zinc-600 leading-relaxed">
                                Setiap transaksi terekam utuh untuk audit jejak aset wakaf dan pemeliharaan barang secara berkala.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section: CTA Box (Google Workspace Banner Style) */}
                <section id="keamanan" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                    <div className="relative rounded-3xl bg-gradient-to-br from-emerald-700 to-teal-800 text-white p-8 sm:p-12 overflow-hidden shadow-lg">
                        {/* Background subtle rings */}
                        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none"></div>
                        <div className="absolute right-40 -top-20 w-60 h-60 rounded-full bg-emerald-400/10 pointer-events-none"></div>

                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                                Siap Kelola Aset Pesantren Secara Profesional?
                            </h2>
                            <p className="text-emerald-50/80 text-sm sm:text-base leading-relaxed mb-8">
                                Masuk menggunakan akun terdaftar Anda untuk melihat daftar inventaris yang tersedia atau mengelola data aset pesantren.
                            </p>

                            <div className="flex flex-wrap items-center gap-3">
                                {auth.user ? (
                                    <Button
                                        asChild
                                        size="lg"
                                        className="rounded-full bg-white hover:bg-emerald-50 text-emerald-800 font-semibold px-7 text-sm shadow-xs transition-all"
                                    >
                                        <Link href={dashboard().url}>
                                            Buka Dashboard
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button
                                        asChild
                                        size="lg"
                                        className="rounded-full bg-white hover:bg-emerald-50 text-emerald-800 font-semibold px-7 text-sm shadow-xs transition-all"
                                    >
                                        <Link href={login().url}>
                                            Masuk ke Sistem Sekarang
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer - Google Style Clean & Structured */}
            <footer className="border-t border-zinc-200/80 bg-white py-12 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 pb-10 border-b border-zinc-100">
                        {/* Brand Column */}
                        <div className="max-w-sm space-y-3">
                            <div className="flex items-center gap-2.5">
                                <AppLogoIcon className="h-6 w-6 object-contain" />
                                <span className="font-semibold text-base tracking-tight text-zinc-900">
                                    Pesantren Teknologi Majapahit
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500 leading-relaxed">
                                Sistem Informasi Manajemen Inventaris & Peminjaman Aset. Kanigoro, Jatirejo, Kabupaten Mojokerto, Jawa Timur.
                            </p>
                        </div>

                        {/* Navigation Columns */}
                        <div className="flex gap-12 text-xs">
                            <div className="space-y-2.5">
                                <p className="font-semibold text-zinc-800 uppercase tracking-wider text-[11px]">
                                    Aplikasi
                                </p>
                                <ul className="space-y-2 text-zinc-500 font-medium">
                                    <li>
                                        <a href="#fitur" className="hover:text-emerald-600 transition-colors">Fitur Sistem</a>
                                    </li>
                                    <li>
                                        <a href="#alur" className="hover:text-emerald-600 transition-colors">Alur Peminjaman</a>
                                    </li>
                                    <li>
                                        <Link href={login().url} className="hover:text-emerald-600 transition-colors">Login Akun</Link>
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-2.5">
                                <p className="font-semibold text-zinc-800 uppercase tracking-wider text-[11px]">
                                    Kontak & Info
                                </p>
                                <ul className="space-y-2 text-zinc-500 font-medium">
                                    <li>Kanigoro - Jatirejo</li>
                                    <li>Mojokerto, Jawa Timur</li>
                                    <li className="text-zinc-700">0812-5139-4584</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-400">
                        <p>© {new Date().getFullYear()} Pesantren Teknologi Majapahit. Hak Cipta Dilindungi.</p>
                        <div className="flex items-center gap-4 text-zinc-400">
                            <span>Sistem Inventaris</span>
                            <span>•</span>
                            <span>Privasi & Akses Internal</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
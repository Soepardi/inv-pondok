import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLogoIcon from '@/components/app-logo-icon';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    LoaderCircle,
    Eye,
    EyeOff,
    CheckCircle2,
    ArrowLeft,
    ShieldCheck,
    Laptop,
    Clock,
    FileCheck
} from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword?: boolean }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // Enforce permanent light mode for the login page
    useEffect(() => {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="relative min-h-screen text-zinc-900 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between overflow-x-hidden">
            <Head title="Masuk Akun - Sistem Inventaris PTM">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            {/* Background Image with Dark & Glass Gradient Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <img
                    src="/images/login.jpg"
                    alt="Background Pesantren Teknologi Majapahit"
                    className="w-full h-full object-cover object-center scale-105 transform motion-safe:animate-fade-in"
                />
                {/* Multi-layer gradient overlay for perfect contrast & readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/85 to-zinc-950/70" />
                <div className="absolute inset-0 bg-emerald-950/20 mix-blend-multiply" />
            </div>

            {/* Top Navigation Bar */}
            <header className="relative z-20 w-full px-4 sm:px-8 py-5 flex items-center justify-between border-b border-white/10 bg-zinc-950/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 border border-white/20 p-1 shadow-2xs backdrop-blur-sm">
                        <AppLogoIcon className="h-6 w-6 object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-base tracking-tight text-white">
                            Inventaris PTM
                        </span>
                        <span className="text-[11px] text-zinc-400 hidden sm:block">
                            Pesantren Teknologi Majapahit
                        </span>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    asChild
                    className="rounded-full text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10 gap-1.5 text-xs font-medium h-9 px-4 transition-all"
                >
                    <Link href="/">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Kembali ke Beranda</span>
                    </Link>
                </Button>
            </header>

            {/* Main Center Area */}
            <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
                <div className="w-full max-w-5xl grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    {/* Left Column: Context & Information */}
                    <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-4 text-white">
                        <div className="space-y-3">
                            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
                                Akses inventaris & peminjaman aset{' '}
                                <span className="text-emerald-400">pesantren</span>.
                            </h1>
                            <p className="text-zinc-300 text-sm leading-relaxed max-w-md">
                                Gunakan akun yang telah terdaftar untuk mengajukan peminjaman sarana prasarana, memeriksa status persetujuan, atau mengelola barang.
                            </p>
                        </div>

                        {/* Frosted Glass Information Cards */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-lg">
                                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                                    <Laptop className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-white">Katalog Lengkap & Terpusat</h4>
                                    <p className="text-[11px] text-zinc-300 leading-normal mt-0.5">
                                        Seluruh perangkat multimedia, elektronik, dan sarana pesantren terdata rapi.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-lg">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-white">Verifikasi Pengurus Cepat</h4>
                                    <p className="text-[11px] text-zinc-300 leading-normal mt-0.5">
                                        Persetujuan permohonan peminjaman langsung dari dashboard tanpa formulir kertas.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-lg">
                                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                                    <FileCheck className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-white">Audit Log Transparan</h4>
                                    <p className="text-[11px] text-zinc-300 leading-normal mt-0.5">
                                        Riwayat peminjam dan batas pengembalian terekam untuk menjaga amanah aset.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Google Sign-In Card (Clean Light Mode Card) */}
                    <div className="lg:col-span-6 flex justify-center">
                        <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-zinc-100 p-6 sm:p-10 relative text-zinc-900">
                            {/* Card Header */}
                            <div className="space-y-1.5 mb-8">
                                <div className="flex items-center gap-2.5 mb-3 lg:hidden">
                                    <AppLogoIcon className="h-7 w-7 object-contain" />
                                    <span className="font-semibold text-sm text-zinc-900">
                                        Inventaris PTM
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                                    Masuk ke Akun
                                </h2>
                                <p className="text-xs sm:text-sm text-zinc-500 font-normal">
                                    Masukkan kredensial akun Anda untuk mengakses sistem inventaris.
                                </p>
                            </div>

                            {/* Status Alert */}
                            {status && (
                                <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-xs font-medium text-emerald-800 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                    <span>{status}</span>
                                </div>
                            )}

                            {/* Login Form */}
                            <form onSubmit={submit} className="space-y-5">
                                {/* Email Field */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-medium text-zinc-700">
                                        Alamat Email
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="nama@ptm.id"
                                            value={data.email}
                                            className="h-11 rounded-xl border-zinc-300 bg-white text-zinc-900 text-sm transition-all focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/15"
                                            autoComplete="username"
                                            autoFocus
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                {/* Password Field */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="text-xs font-medium text-zinc-700">
                                            Kata Sandi
                                        </Label>
                                        {canResetPassword && (
                                            <Link
                                                href="/forgot-password"
                                                className="text-xs font-medium text-emerald-700 hover:underline"
                                            >
                                                Lupa sandi?
                                            </Link>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={data.password}
                                            className="h-11 rounded-xl border-zinc-300 bg-white text-zinc-900 text-sm transition-all focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/15 pr-11"
                                            autoComplete="current-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors p-1"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="remember"
                                            checked={data.remember}
                                            onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                            className="rounded border-zinc-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                        />
                                        <Label
                                            htmlFor="remember"
                                            className="text-xs text-zinc-600 cursor-pointer select-none font-normal"
                                        >
                                            Ingat perangkat ini
                                        </Label>
                                    </div>
                                </div>

                                {/* Submit Button (Google Pill Button) */}
                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        className="w-full h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm hover:shadow transition-all active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2"
                                        disabled={processing}
                                    >
                                        {processing && (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                        )}
                                        <span>{processing ? 'Memproses Masuk...' : 'Masuk ke Sistem'}</span>
                                    </Button>
                                </div>
                            </form>

                            {/* Security Notice */}
                            <div className="mt-8 pt-5 border-t border-zinc-100 flex items-center justify-center gap-2 text-[11px] text-zinc-400">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Koneksi aman terenkripsi • Internal PTM</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Footer */}
            <footer className="relative z-20 w-full py-4 px-4 sm:px-8 border-t border-white/10 text-center text-xs text-zinc-400 bg-zinc-950/50 backdrop-blur-md">
                © {new Date().getFullYear()} Pesantren Teknologi Majapahit • Kanigoro, Jatirejo, Mojokerto
            </footer>
        </div>
    );
}

Login.layout = null;
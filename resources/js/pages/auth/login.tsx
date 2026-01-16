import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLogoIcon from '@/components/app-logo-icon';
import { Badge } from '@/components/ui/badge';
import { login, register } from '@/routes';
import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle, Eye, EyeOff, CheckCircle, Activity, ArrowLeft, Shield } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword: boolean }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Masuk - Sistem Inventaris" />

            <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 bg-background font-sans">
                {/* Left Side - Branding */}
                <div className="relative hidden h-full flex-col bg-zinc-900 p-10 text-white dark:border-r lg:flex overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src="/images/unsplash.jpg"
                            alt="Background"
                            className="h-full w-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
                    </div>

                    <div className="relative z-20 flex items-center gap-3">
                        <AppLogoIcon className="h-12 w-12 object-contain" />
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-tight">Inventaris PTM</span>
                            <span className="text-[10px] text-zinc-400 font-medium tracking-widest uppercase">Management System</span>
                        </div>
                    </div>

                    <div className="relative z-20 flex flex-1 flex-col items-start justify-center gap-8 max-w-lg">
                        <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 backdrop-blur-md px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                            Pesantren Teknologi Majapahit
                        </Badge>

                        <div className="space-y-4">
                            <h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl text-white leading-tight">
                                Selamat <br />
                                <span className="bg-gradient-to-br from-green-400 to-emerald-500 bg-clip-text text-transparent italic">
                                    Datang
                                </span>
                            </h1>
                            <p className="text-lg text-zinc-300 font-medium leading-relaxed">
                                Kelola aset dan inventaris pesantren dengan sistem digital yang aman, transparan, dan efisien.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 w-full pt-4">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10">
                                <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                                <div className="text-sm">
                                    <p className="font-bold text-white">Monitoring Real-time</p>
                                    <p className="text-zinc-400 text-xs">Pantau status barang kapanpun.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10">
                                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                                    <Activity className="h-5 w-5" />
                                </div>
                                <div className="text-sm">
                                    <p className="font-bold text-white">Laporan Otomatis</p>
                                    <p className="text-zinc-400 text-xs">Export data dengan satu klik saja.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-20 mt-auto flex items-center justify-between border-t border-white/10 pt-8">
                        <p className="text-sm text-zinc-400">© 2024 Pesantren Teknologi Majapahit</p>
                        <div className="flex gap-4">
                            <div className="h-1.5 w-8 rounded-full bg-emerald-500" />
                            <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                            <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="lg:p-8 flex items-center justify-center min-h-screen relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 z-30">
                        <Button variant="ghost" asChild className="gap-2 font-bold text-zinc-500 hover:text-zinc-900 transition-all">
                            <Link href="/">
                                <ArrowLeft className="h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                    </div>

                    <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px] px-8 relative z-20">
                        <div className="flex flex-col space-y-2 text-center lg:text-left pt-12 lg:pt-0">
                            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">Masuk Akun</h2>
                            <p className="text-sm font-medium text-zinc-500">
                                Masukkan email dan kata sandi Anda untuk melanjutkan.
                            </p>
                        </div>

                        {status && (
                            <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-sm font-bold text-green-600 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-bold text-zinc-700 ml-1">Alamat Email</Label>
                                    <div className="relative group">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="nama@ptm.id"
                                            value={data.email}
                                            className="h-12 rounded-xl border-zinc-200 bg-zinc-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                            autoComplete="username"
                                            autoFocus
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                <div className="space-y-2">
                                    <div className="relative group">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={data.password}
                                            className="h-12 rounded-xl border-zinc-200 bg-zinc-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 pr-12"
                                            autoComplete="current-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} />
                                </div>
                            </div>

                            <div className="flex items-center px-1">
                                <Checkbox
                                    id="remember"
                                    checked={data.remember}
                                    onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                    className="rounded-md border-zinc-300 text-emerald-600 focus:ring-emerald-500/20"
                                />
                                <Label htmlFor="remember" className="ml-2 text-xs font-bold text-zinc-500 cursor-pointer select-none">
                                    Ingat perangkat ini
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-base shadow-xl shadow-emerald-200 dark:shadow-none transition-all active:scale-[0.98] disabled:opacity-70"
                                disabled={processing}
                            >
                                {processing ? (
                                    <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
                                ) : (
                                    <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
                                )}
                                Login Sekarang
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

Login.layout = null;
import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle, LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <AuthLayout 
            title="Masuk ke Sistem" 
            description="Selamat datang kembali! Masukkan kredensial Anda untuk mengakses sistem inventaris."
        >
            <Head title="Masuk - Sistem Inventaris" />

            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden -z-10">
                <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
            </div>

            <div className="w-full max-w-sm mx-auto">
                {/* Status Message */}
                {status && (
                    <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm text-center">
                        {status}
                    </div>
                )}

                <Form 
                    {...AuthenticatedSessionController.store.form()} 
                    resetOnSuccess={['password']} 
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="flex flex-col gap-6">
                                {/* Email Field */}
                                <div className="flex flex-col gap-3">
                                    <Label htmlFor="email" className="text-sm font-medium">
                                        Alamat Email
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="email@example.com"
                                            className="pl-10 pr-4 py-3"
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                {/* Password Field */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="text-sm font-medium">
                                            Password
                                        </Label>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="Masukkan password"
                                            className="pl-10 pr-10 py-3"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            tabIndex={3}
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
                                <div className="flex items-center space-x-3">
                                    <Checkbox 
                                        id="remember" 
                                        name="remember" 
                                        tabIndex={4}
                                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                    />
                                    <Label htmlFor="remember" className="text-sm text-muted-foreground">
                                        Ingat saya
                                    </Label>
                                </div>

                                {/* Submit Button */}
                                <Button 
                                    type="submit" 
                                    className="w-full py-3 mt-2 bg-gradient-to-br from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200"
                                    tabIndex={5} 
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="h-4 w-4 mr-2" />
                                            Masuk ke Sistem
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Error Messages */}
                            {errors.email && !errors.password && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                    Periksa kembali email Anda
                                </div>
                            )}
                            
                            {errors.password && !errors.email && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                    Password yang dimasukkan salah
                                </div>
                            )}
                        </>
                    )}
                </Form>

                {/* Security Notice */}
                <div className="mt-8 p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                            <p className="text-xs text-blue-700">
                                <strong>Keamanan Sistem:</strong> Pastikan Anda mengakses dari perangkat yang aman 
                                dan tidak membagikan kredensial login kepada siapapun.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
            `}</style>
        </AuthLayout>
    );
}
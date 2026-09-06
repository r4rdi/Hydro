'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInUser } from '@/lib/auth';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            await signInUser(email, password);

            // HARD REDIRECT: Memastikan Cookie dikirim sempurna ke Middleware Server
            window.location.href = '/dashboard';
        } catch (err: any) {
            console.error('Login error:', err);
            setErrorMsg(err.message || 'Gagal masuk. Periksa email dan kata sandi Anda.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-emerald-400">Hydro Monitoring System</h1>
                    <p className="text-sm text-slate-400 mt-1">Masuk untuk mengelola sistem hidroponik IoT</p>
                </div>

                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                            placeholder="nama@hydro.web.id"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Kata Sandi</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg transition-all duration-200 disabled:opacity-50"
                    >
                        {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-400">
                    Belum punya akun?{' '}
                    <Link href="/register" className="text-emerald-400 hover:underline">
                        Daftar di sini
                    </Link>
                </div>
            </div>
        </div>
    );
}
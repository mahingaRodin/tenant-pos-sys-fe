import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/button';
import { ShoppingCart, LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { authApi } from '../../lib/api/auth';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await authApi.login({ email, password });

            if (response.data && response.data.jwt) {
                // Clear old state first
                logout();

                const user = response.data.user;
                const role = user?.role;

                // Persist the full user object from the response
                login(user, response.data.jwt);

                // Role-based redirection
                if (role === 'ROLE_SUPER_ADMIN' || role === 'ROLE_STORE_ADMIN' || role === 'ROLE_STORE_MANAGER' || role === 'ROLE_BRANCH_MANAGER') {
                    window.location.href = '/dashboard';
                } else if (role === 'ROLE_BRANCH_CASHIER') {
                    window.location.href = '/pos';
                } else {
                    window.location.href = '/';
                }
            }
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 w-full max-w-md mx-auto space-y-6">

            <div className="text-center space-y-2 mb-8 items-center flex flex-col">
                <div className="h-14 w-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-2">
                    <ShoppingCart className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
                <p className="text-slate-500">Sign in to your tenant account</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 block" htmlFor="email">Email</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors sm:text-sm text-slate-900"
                            placeholder="admin@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-700 block" htmlFor="password">Password</label>
                        <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">Forgot password?</a>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors sm:text-sm text-slate-900"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            Sign in <LogIn className="w-4 h-4 ml-1" />
                        </>
                    )}
                </Button>
            </form>

            <div className="pt-4 text-center border-t border-slate-100">
                <p className="text-sm text-slate-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
                        Sign up for free
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

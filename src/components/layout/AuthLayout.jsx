import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const AuthLayout = ({ children }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // If already authenticated, allow reaching login/register to switch accounts or refresh state
    // Redirect logic removed to prevent "locked in" loops

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
            {/* Left side - Branding/Image (Hidden on mobile) */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-slate-900 text-white p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 mix-blend-overlay"></div>
                <div className="z-10 max-w-md text-center">
                    <h1 className="text-4xl font-bold mb-6 tracking-tight">SaaS POS System</h1>
                    <p className="text-lg text-slate-300 leading-relaxed">
                        Streamline your retail operations, manage multiple branches, and gain insights with our comprehensive point of sale solution.
                    </p>
                </div>
                {/* Decorative elements */}
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            </div>

            {/* Right side - Form */}
            <div className="flex items-center justify-center p-8 sm:p-12">
                <div className="w-full max-w-md space-y-8">
                    {children || <Outlet />}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;

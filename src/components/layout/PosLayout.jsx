import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft, User, Settings, HelpCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuthStore } from '../../store/useAuthStore';

const PosLayout = ({ children }) => {
    const user = useAuthStore((state) => state.user);

    return (
        <div className="h-screen w-screen bg-slate-100 flex flex-col overflow-hidden">
            {/* Top Navigation Bar */}
            <header className="h-14 bg-slate-900 text-white flex items-center justify-between px-4 shrink-0 shadow-md z-10">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium hidden sm:inline">Back to Dashboard</span>
                    </Link>
                    <div className="h-6 w-px bg-slate-700 mx-2"></div>
                    <div className="font-bold text-lg tracking-wide text-indigo-400">
                        TenantPOS <span className="text-white font-normal text-sm ml-2">Terminal 01</span>
                    </div>
                </div>

                <div className="flex flex-1 max-w-md mx-4 items-center">
                    {/* Global POS Search could go here */}
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-800">
                        <HelpCircle className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-800">
                        <Settings className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-medium leading-none">{user?.firstName || 'User'} {user?.lastName || ''}</div>
                            <div className="text-xs text-slate-400 mt-1">{user?.role?.replace('ROLE_', '').replace('_', ' ') || 'Cashier'}</div>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300">
                            <User className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Terminal Area */}
            <main className="flex-1 flex overflow-hidden">
                {children || <Outlet />}
            </main>
        </div>
    );
};

export default PosLayout;

import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Settings,
    LogOut,
    Store,
    Menu,
    Bell,
    ListFilter
} from 'lucide-react';
import { Button } from '../ui/button';

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const location = useLocation();
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'POS Terminal', path: '/pos', icon: ShoppingCart },
        { name: 'Orders', path: '/dashboard/orders', icon: ListFilter },
        { name: 'Inventory', path: '/dashboard/inventory', icon: Package },
        { name: 'Products', path: '/dashboard/products', icon: Package },
        { name: 'Stores & Branches', path: '/dashboard/stores', icon: Store },
        { name: 'Settings', path: '/dashboard/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside
                className={`bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'
                    }`}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-center border-b border-slate-200 shrink-0">
                    {sidebarOpen ? (
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            TenantPOS
                        </span>
                    ) : (
                        <span className="text-xl font-bold text-indigo-600">TP</span>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center px-3 py-2.5 rounded-lg transition-colors group ${isActive
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} ${!sidebarOpen ? 'mx-auto' : 'mr-3'}`} />
                                {sidebarOpen && <span className="font-medium">{item.name}</span>}
                            </Link>
                        )
                    })}
                </div>

                {/* User / Logout */}
                <div className="p-4 border-t border-slate-200">
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-3 py-2.5 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group"
                    >
                        <LogOut className={`w-5 h-5 shrink-0 text-slate-400 group-hover:text-red-500 ${!sidebarOpen ? 'mx-auto' : 'mr-3'}`} />
                        {sidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-500">
                            <Menu className="w-5 h-5" />
                        </Button>
                        {/* Context Picker could go here (e.g. Current Branch) */}
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="text-slate-500 relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </Button>
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {children || <Outlet />}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;

import React, { useEffect, useState, useCallback } from 'react';
import {
    DollarSign,
    ShoppingCart,
    TrendingUp,
    Users,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { orderApi } from '../../lib/api/orders';
import { useAuthStore } from '../../store/useAuthStore';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ title, value, change, icon: Icon, trend, isLoading }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            {isLoading ? (
                <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" />
            ) : (
                <>
                    <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                    <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                        <TrendingUp className={`w-4 h-4 mr-1 ${trend === 'down' && 'rotate-180'}`} />
                        <span>{change}</span>
                        <span className="text-slate-400 ml-1">vs last month</span>
                    </div>
                </>
            )}
        </div>
        <div className={`p-3 rounded-xl ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            <Icon className="w-6 h-6" />
        </div>
    </div>
);

const DashboardOverview = () => {
    const [stats, setStats] = useState({
        todayRevenue: 0,
        todayOrders: 0,
        recentTransactions: [],
        isLoading: true,
        error: null
    });

    const user = useAuthStore((state) => state.user);
    const branchId = user?.branchId;

    const fetchDashboardData = useCallback(async () => {
        if (!branchId) {
            setStats(prev => ({ ...prev, isLoading: false, error: 'No branch associated.' }));
            return;
        }
        setStats(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const [todayRes, recentRes] = await Promise.all([
                orderApi.getTodayByBranchId(branchId, 0, 100),
                orderApi.getRecentByBranchId(branchId, 0, 5)
            ]);

            const todayOrders = todayRes.data?.content || [];
            const revenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

            setStats({
                todayRevenue: revenue,
                todayOrders: todayOrders.length,
                recentTransactions: recentRes.data?.content || [],
                isLoading: false,
                error: null
            });
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setStats(prev => ({ ...prev, isLoading: false, error: 'Failed to sync live data.' }));
        }
    }, [branchId]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-500">Welcome back, {user?.firstName || 'User'}! Here's what's happening today.</p>
                </div>
                <button
                    onClick={fetchDashboardData}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <TrendingUp className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            {stats.error && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3 text-amber-800">
                    <AlertCircle className="shrink-0 w-5 h-5" />
                    <p className="text-sm font-medium">{stats.error}</p>
                </div>
            )}

            {/* Quick Actions - Super Admin Priority */}
            {(user?.role === 'ROLE_SUPER_ADMIN' || user?.role === 'ROLE_STORE_ADMIN') && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 rounded-3xl shadow-xl shadow-indigo-100/50 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold mb-1">Administrative Quick Actions</h2>
                        <p className="text-indigo-100 text-sm">Efficiently manage your store operations from here.</p>
                    </div>
                    <div className="flex gap-4 relative z-10">
                        <a
                            href="/pos"
                            className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-lg active:scale-95"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Launch POS Terminal
                        </a>
                        <button className="bg-indigo-500/30 backdrop-blur-md border border-indigo-400/30 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-500/40 transition-all active:scale-95">
                            System Settings
                        </button>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                    title="Today's Revenue"
                    value={`$${stats.todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                    change="+20.1%"
                    icon={DollarSign}
                    trend="up"
                    isLoading={stats.isLoading}
                />
                <StatCard
                    title="Today's Orders"
                    value={stats.todayOrders.toString()}
                    change="+12.5%"
                    icon={ShoppingCart}
                    trend="up"
                    isLoading={stats.isLoading}
                />
                <StatCard
                    title="Active Customers"
                    value="2,420"
                    change="+4.3%"
                    icon={Users}
                    trend="up"
                    isLoading={stats.isLoading}
                />
                <StatCard
                    title="Avg. Order Value"
                    value={`$${(stats.todayOrders > 0 ? stats.todayRevenue / stats.todayOrders : 0).toFixed(2)}`}
                    change="-2.1%"
                    icon={TrendingUp}
                    trend="down"
                    isLoading={stats.isLoading}
                />
            </div>

            {/* Charts & Recent Activity */}
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[400px] flex items-center justify-center">
                    <div className="text-center text-slate-400">
                        <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="font-medium">Revenue Trends</p>
                        <p className="text-xs">Data patterns will be visualized here as history builds up.</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[400px]">
                    <h3 className="font-semibold text-slate-900 mb-4">Recent Transactions</h3>
                    <div className="space-y-4">
                        {stats.isLoading ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex items-center gap-3 animate-pulse">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                                        <div className="h-2 bg-slate-100 rounded w-1/3" />
                                    </div>
                                </div>
                            ))
                        ) : stats.recentTransactions.length === 0 ? (
                            <div className="text-center py-20 text-slate-400">
                                <p className="text-sm">No transactions yet today.</p>
                            </div>
                        ) : (
                            stats.recentTransactions.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                                            <ShoppingCart className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Order #{order.id.slice(0, 8)}</p>
                                            <p className="text-xs text-slate-500">
                                                {order.createdAt ? formatDistanceToNow(new Date(order.createdAt), { addSuffix: true }) : 'Just now'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-900">${order.totalAmount?.toFixed(2)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;


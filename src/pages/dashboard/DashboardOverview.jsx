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
import { formatDistanceToNow, format, parseISO, startOfToday, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { customerApi } from '../../lib/api/customers';
import { shiftReportApi } from '../../lib/api/shiftReports';

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
        totalRevenue: 0,
        todayOrders: 0,
        avgOrderValue: 0,
        activeCustomers: 0,
        recentTransactions: [],
        chartData: [],
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
            // Fetch today's orders, recent orders, shift reports, deeper history, and active customers
            const [todayRes, recentRes, shiftsRes, historyRes, customersRes] = await Promise.all([
                orderApi.getTodayByBranchId(branchId, 0, 100).catch(e => { console.error('Today orders API error:', e); return { data: null }; }),
                orderApi.getRecentByBranchId(branchId, 0, 5).catch(e => { console.error('Recent orders API error:', e); return { data: null }; }),
                shiftReportApi.getByBranchId(branchId).catch(e => { console.error('Shift reports API error:', e); return { data: null }; }),
                orderApi.getByBranchId(branchId, { page: 0, size: 200 }).catch(e => { console.error('History orders API error:', e); return { data: null }; }),
                customerApi.getAll({ page: 0, size: 1 }).catch(e => { console.error('Customer count API error:', e); return { data: null }; })
            ]);

            // Helper to handle both Pageable { content: [] } and Array [] responses
            const extractData = (res) => {
                if (!res || !res.data) return [];
                if (Array.isArray(res.data)) return res.data;
                if (res.data.content && Array.isArray(res.data.content)) return res.data.content;
                return [];
            };

            const extractTotal = (res, dataArray) => {
                if (!res || !res.data) return dataArray.length;
                if (res.data.totalElements !== undefined) return res.data.totalElements;
                return dataArray.length;
            };

            const todayOrders = extractData(todayRes);
            const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

            const allShifts = extractData(shiftsRes);
            const historyOrders = extractData(historyRes);

            // Calculate Total Revenue using shifts + any orders not in shifts (or just orders if shifts empty)
            const shiftRevenue = allShifts.reduce((sum, shift) => sum + (shift.totalSales || 0), 0);
            const orderHistoryRevenue = historyOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

            // If we have shifts, we trust shifts + today. If no shifts, we use order history.
            const totalRevenue = shiftRevenue > 0 ? (shiftRevenue + todayRevenue) : (orderHistoryRevenue + todayRevenue);

            const shiftOrderCount = allShifts.reduce((sum, shift) => sum + (shift.totalOrders || 0), 0);
            const totalOrderCount = shiftOrderCount > 0 ? (shiftOrderCount + todayOrders.length) : (historyOrders.length + todayOrders.length);
            const avgOrderValue = totalOrderCount > 0 ? (totalRevenue / totalOrderCount) : 0;

            const activeCustomers = extractTotal(customersRes, extractData(customersRes));

            // Generate Chart Data (Last 14 Days Revenue)
            const daysCount = 14;
            const trendData = Array.from({ length: daysCount }, (_, i) => {
                const d = subDays(new Date(), (daysCount - 1) - i);
                return {
                    date: format(d, 'MMM dd'),
                    fullDate: format(d, 'yyyy-MM-dd'),
                    revenue: 0
                };
            });

            // Helper to populate chart
            const populateChart = (dateRaw, amount) => {
                if (!dateRaw) return;
                try {
                    const dateObj = new Date(dateRaw);
                    if (isNaN(dateObj.getTime())) return;
                    const dateStr = format(dateObj, 'yyyy-MM-dd');
                    const index = trendData.findIndex(d => d.fullDate === dateStr);
                    if (index !== -1) {
                        trendData[index].revenue += (amount || 0);
                    }
                } catch (e) { }
            };

            // Populate from shifts if available
            if (allShifts.length > 0) {
                allShifts.forEach(s => populateChart(s.shiftEnd || s.shiftStart, s.totalSales));
            } else {
                // Otherwise populate from history orders
                historyOrders.forEach(o => populateChart(o.createdAt, o.totalAmount));
            }

            // Always add today's live revenue
            populateChart(new Date(), todayRevenue);

            setStats({
                todayRevenue,
                totalRevenue,
                todayOrders: extractTotal(todayRes, todayOrders),
                avgOrderValue,
                activeCustomers,
                recentTransactions: extractData(recentRes),
                chartData: trendData,
                isLoading: false,
                error: null
            });
        } catch (err) {
            console.error('Fatal Dashboard Processing error:', err);
            setStats(prev => ({ ...prev, isLoading: false, error: 'Internal processing error. Check console.' }));
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
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                    change="+15.3%"
                    icon={DollarSign}
                    trend="up"
                    isLoading={stats.isLoading}
                />
                <StatCard
                    title="Today's Orders"
                    value={stats.todayOrders.toString()}
                    change={stats.todayOrders > 0 ? "+12.5%" : "0.0%"}
                    icon={ShoppingCart}
                    trend="up"
                    isLoading={stats.isLoading}
                />
                <StatCard
                    title="Active Customers"
                    value={stats.activeCustomers.toLocaleString()}
                    change="+4.3%"
                    icon={Users}
                    trend="up"
                    isLoading={stats.isLoading}
                />
                <StatCard
                    title="Avg. Order Value"
                    value={`$${stats.avgOrderValue.toFixed(2)}`}
                    change="+2.1%"
                    icon={TrendingUp}
                    trend="up"
                    isLoading={stats.isLoading}
                />
            </div>

            {/* Charts & Recent Activity */}
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col min-h-[400px]">
                    <h3 className="font-semibold text-slate-900 mb-6">Revenue Trends (Last 14 Days)</h3>
                    {stats.isLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        </div>
                    ) : stats.chartData.every(d => d.revenue === 0) ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <TrendingUp className="w-12 h-12 mb-3 opacity-20" />
                            <p className="font-medium">No revenue data for the past 14 days</p>
                            <p className="text-xs">Sales will appear here automatically.</p>
                        </div>
                    ) : (
                        <div className="flex-1 w-full h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        tickFormatter={(val) => `$${val}`}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#4f46e5"
                                        strokeWidth={3}
                                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
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
                            stats.recentTransactions.map((order) => {
                                // Extract items to show what they bought
                                const items = order.items || order.orderItems || [];
                                const itemNames = items.length > 0
                                    ? items.map(i => i.productName || `Product #${i.productId}`).join(', ')
                                    : `Order #${order.id.slice(0, 8)}`;

                                const displayText = itemNames.length > 40 ? itemNames.substring(0, 40) + '...' : itemNames;

                                return (
                                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-50 flex items-center justify-center">
                                                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate" title={itemNames}>
                                                    {(() => {
                                                        const items = order.items || order.orderItems || [];
                                                        if (items.length > 0) {
                                                            const names = items.map(i => i.product?.name || i.productName || 'Item').join(', ');
                                                            return names.length > 40 ? names.substring(0, 40) + '...' : names;
                                                        }
                                                        return displayText;
                                                    })()}
                                                </p>
                                                <p className="text-xs text-slate-500 flex items-center gap-2">
                                                    <span className="font-mono text-[10px]">#{order.id.slice(0, 6)}</span>
                                                    <span>•</span>
                                                    <span>{(() => {
                                                        if (!order.createdAt) return 'Just now';
                                                        try {
                                                            const d = new Date(order.createdAt);
                                                            if (isNaN(d.getTime())) return 'N/A';
                                                            return formatDistanceToNow(d, { addSuffix: true });
                                                        } catch (e) {
                                                            return 'N/A';
                                                        }
                                                    })()}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-900 shrink-0 ml-3">
                                            ${order.totalAmount?.toFixed(2)}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;


import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { orderApi } from '../../lib/api/orders';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { 
    TrendingUp, 
    ShoppingCart, 
    Calendar, 
    MapPin, 
    Store, 
    DollarSign,
    Loader2,
    LayoutDashboard,
    ShoppingBag,
    ChevronRight,
    Search,
    ArrowUpRight,
    Sun,
    Moon,
    LogOut
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { useUIStore } from '../../store/useUIStore';

const SpendingChart = ({ data }) => {
    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
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
                        contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            backgroundColor: '#fff'
                        }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#4f46e5" 
                        strokeWidth={4} 
                        dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#4f46e5' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const StoreDistributionChart = ({ data }) => {
    const COLORS = ['#4f46e5', '#818cf8', '#c7d2fe', '#e0e7ff', '#6366f1'];
    
    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

const CustomerDashboard = () => {
    const { t } = useTranslation();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const { theme, toggleTheme } = useUIStore();
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleLogout = () => {
        if (window.confirm(t('common.logoutConfirmationMessage') || 'Are you sure you want to log out?')) {
            logout();
            navigate('/login');
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user?.id) return;
            try {
                const response = await orderApi.getByCustomerId(user.id);
                setOrders(response.data.content || response.data || []);
            } catch (err) {
                console.error('Failed to fetch customer orders:', err);
                setError('Could not load your spending data.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user?.id]);

    const stats = useMemo(() => {
        const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const avgSpent = orders.length > 0 ? totalSpent / orders.length : 0;
        const currentMonth = new Date();
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        
        const monthlySpent = orders
            .filter(o => {
                const date = parseISO(o.createdAt);
                return isWithinInterval(date, { start, end });
            })
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // Prep chart data (last 30 days)
        const dailyData = {};
        orders.forEach(o => {
            const date = format(parseISO(o.createdAt), 'MMM dd');
            dailyData[date] = (dailyData[date] || 0) + o.totalAmount;
        });
        
        const chartData = Object.entries(dailyData)
            .map(([date, amount]) => ({ date, amount }))
            .slice(-10);

        // Prep store distribution
        const storeDataObj = {};
        orders.forEach(o => {
            const name = o.store?.name || 'Local Store';
            storeDataObj[name] = (storeDataObj[name] || 0) + o.totalAmount;
        });

        const storeData = Object.entries(storeDataObj)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        return { totalSpent, avgSpent, monthlySpent, chartData, storeData };
    }, [orders]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-slate-500 font-medium">Analyzing your spending patterns...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#080d16] text-white' : 'bg-slate-50 text-slate-900'}`}>
            {/* Header */}
            <header className={`${theme === 'dark' ? 'bg-[#0b121e] border-white/5' : 'bg-white border-slate-200'} border-b sticky top-0 z-40 transition-colors`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/shop" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                            <ShoppingBag className="w-6 h-6 text-indigo-600" />
                        </Link>
                        <h1 className="text-xl font-bold text-slate-900">{t('dashboard.myActivity') || 'My Spending Activity'}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={toggleTheme} className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <Link to="/shop">
                            <Button variant="outline" className={`rounded-xl font-semibold ${theme === 'dark' ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200'}`}>
                                {t('common.backToShop') || 'Back to Shop'}
                            </Button>
                        </Link>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${theme === 'dark' ? 'bg-indigo-600/20 text-indigo-400' : 'bg-slate-100 text-slate-600'}`}>
                            {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
                        </div>
                        <button onClick={handleLogout} className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-500 hover:bg-rose-50'}`}>
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className={`bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl ${theme === 'dark' ? 'shadow-indigo-500/20' : 'shadow-indigo-100'} flex flex-col justify-between group overflow-hidden relative`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <p className="text-indigo-100 font-medium mb-1">Total Spent</p>
                            <h3 className="text-4xl font-black">${stats.totalSpent.toFixed(2)}</h3>
                        </div>
                        <div className="mt-8 flex items-center gap-2 relative z-10">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">Lifetime spend</span>
                        </div>
                    </div>

                    <div className={`rounded-[2rem] p-8 shadow-sm flex flex-col justify-between ${theme === 'dark' ? 'bg-[#0f172a] border border-white/5' : 'bg-white border border-slate-200'}`}>
                        <div>
                            <p className="text-slate-500 font-medium mb-1">Monthly Spending</p>
                            <h3 className={`text-4xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>${stats.monthlySpent.toFixed(2)}</h3>
                        </div>
                        <div className="mt-8 flex items-center gap-2 text-emerald-600">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs font-bold">Active this month</span>
                        </div>
                    </div>

                    <div className={`rounded-[2rem] p-8 shadow-sm flex flex-col justify-between ${theme === 'dark' ? 'bg-[#0f172a] border border-white/5' : 'bg-white border border-slate-200'}`}>
                        <div>
                            <p className="text-slate-500 font-medium mb-1">Avg. Per Order</p>
                            <h3 className={`text-4xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>${stats.avgSpent.toFixed(2)}</h3>
                        </div>
                        <div className="mt-8 flex items-center gap-2 text-slate-400">
                            <ShoppingCart className="w-4 h-4" />
                            <span className="text-xs font-bold">{orders.length} orders total</span>
                        </div>
                    </div>
                </div>

                {/* Charts Area */}
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className={`rounded-[2.5rem] p-8 shadow-sm ${theme === 'dark' ? 'bg-[#0f172a] border border-white/5' : 'bg-white border border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className={`font-black text-xl ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Spending Trend</h3>
                            <Calendar className="w-5 h-5 text-slate-400" />
                        </div>
                        {stats.chartData.length > 0 ? (
                            <SpendingChart data={stats.chartData} />
                        ) : (
                            <div className="h-64 flex items-center justify-center text-slate-400 italic">
                                No recent spending history to display.
                            </div>
                        )}
                    </div>

                    <div className={`rounded-[2.5rem] p-8 shadow-sm ${theme === 'dark' ? 'bg-[#0f172a] border border-white/5' : 'bg-white border border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className={`font-black text-xl ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Where you spend</h3>
                            <Store className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="w-full md:w-1/2">
                                <StoreDistributionChart data={stats.storeData} />
                            </div>
                            <div className="w-full md:w-1/2 space-y-4">
                                {stats.storeData.map((s, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#4f46e5', '#818cf8', '#c7d2fe', '#e0e7ff', '#6366f1'][i % 5] }}></div>
                                            <span className="text-sm font-bold text-slate-700">{s.name}</span>
                                        </div>
                                        <span className="text-sm font-medium text-slate-500">${s.value.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Orders List */}
                <div className={`rounded-[2.5rem] p-10 shadow-sm ${theme === 'dark' ? 'bg-[#0f172a] border border-white/5' : 'bg-white border border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-8">
                        <h3 className={`font-black text-2xl ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Purchase History</h3>
                        <div className={`px-4 py-2 rounded-xl text-sm font-bold ${theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                            {orders.length} Total Orders
                        </div>
                    </div>

                    <div className="space-y-4">
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <div key={order.id} className={`group p-6 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${theme === 'dark' ? 'hover:bg-white/5 border-transparent hover:border-white/10' : 'hover:bg-slate-50 border-transparent hover:border-slate-100'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-indigo-600/20 group-hover:bg-indigo-600/30' : 'bg-indigo-50 group-hover:bg-white'}`}>
                                            <ShoppingBag className="w-7 h-7 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h4 className={`font-bold transition-colors ${theme === 'dark' ? 'text-white group-hover:text-indigo-400' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                                                {order.store?.name || 'Local Retailer'}
                                            </h4>
                                            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {format(parseISO(order.createdAt), 'MMM dd, yyyy')}</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded uppercase">#{order.id.slice(0, 8)}</span>
                                            </div>
                                        </div>
                                    </div>
                                     <div className="flex items-center justify-between md:justify-end gap-8">
                                        <div className="text-right">
                                            <p className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>${order.totalAmount?.toFixed(2)}</p>
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                                order.status === 'COMPLETED' ? (theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (theme === 'dark' ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-600')
                                            }`}>
                                                {order.status || 'PROCESSED'}
                                            </span>
                                        </div>
                                        <button className={`p-3 rounded-xl transition-all ${theme === 'dark' ? 'bg-white/5 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                                            <ArrowUpRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={`text-center py-20 rounded-3xl border border-dashed ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50/50 border-slate-200'}`}>
                                <Search className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-slate-700' : 'text-slate-200'}`} />
                                <p className={`font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>No orders found. Time to go shopping!</p>
                                <Link to="/shop">
                                    <Button variant="link" className={`mt-2 font-bold ${theme === 'dark' ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}>Browse Catalog</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CustomerDashboard;

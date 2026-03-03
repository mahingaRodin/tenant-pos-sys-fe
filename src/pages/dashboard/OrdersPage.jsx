import React, { useEffect, useState, useCallback } from 'react';
import { ShoppingBag, Search, Calendar, FileText, Loader2, AlertCircle, Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { orderApi } from '../../lib/api/orders';
import { useAuthStore } from '../../store/useAuthStore';
import { format } from 'date-fns';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const user = useAuthStore((state) => state.user);
    const branchId = user?.branchId;

    const fetchOrders = useCallback(async () => {
        if (!branchId) {
            setError('No branch associated with your profile.');
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const res = await orderApi.getByBranchId(branchId, { page: 0, size: 50 });
            setOrders(res.data?.content || []);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setError('Could not load transaction history.');
        } finally {
            setIsLoading(false);
        }
    }, [branchId]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales History</h1>
                    <p className="text-slate-500">View and manage all branch transactions.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        Date Range
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                        <FileText className="w-4 h-4" />
                        Export PDF
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            placeholder="Search by order ID..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Total</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-28" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20" /></td>
                                        <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-100 rounded w-16 ml-auto" /></td>
                                        <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-100 rounded w-8 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <ShoppingBag className="w-8 h-8 opacity-20" />
                                            <p>No orders recorded yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900 font-mono text-sm">#{order.id.slice(0, 12)}</div>
                                            <div className="text-[10px] text-slate-400">Branch: {branchId.slice(0, 8)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-900">
                                                {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy') : 'N/A'}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {order.createdAt ? format(new Date(order.createdAt), 'hh:mm a') : ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${order.paymentType === 'CASH' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                                                }`}>
                                                {order.paymentType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                                            ${order.totalAmount?.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-indigo-600">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;

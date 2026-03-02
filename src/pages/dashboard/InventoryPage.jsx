import React, { useEffect, useState, useCallback } from 'react';
import { Package, Search, ListFilter, ArrowUpDown, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { inventoryApi } from '../../lib/api/inventory';
import { useAuthStore } from '../../store/useAuthStore';

const InventoryPage = () => {
    const [inventory, setInventory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const user = useAuthStore((state) => state.user);
    const branchId = user?.branchId || '123e4567-e89b-12d3-a456-426614174000';

    const fetchInventory = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await inventoryApi.getByBranchId(branchId);
            setInventory(res.data?.content || []);
        } catch (err) {
            console.error('Failed to fetch inventory:', err);
            setError('Could not load inventory data.');
        } finally {
            setIsLoading(false);
        }
    }, [branchId]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const filteredInventory = inventory.filter(item =>
        item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product?.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Management</h1>
                    <p className="text-slate-500">Monitor and update stock levels across your branch.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchInventory} className="gap-2">
                        <RefreshCw className={`w-4 h-4 ${isLoading && 'animate-spin'}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            placeholder="Filter by product name or SKU..."
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
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right flex items-center justify-end gap-1">
                                    Current Stock <ArrowUpDown className="w-3 h-3" />
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-40" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20" /></td>
                                        <td className="px-6 py-4 text-center"><div className="h-6 bg-slate-100 rounded-full w-16 mx-auto" /></td>
                                        <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-100 rounded w-12 ml-auto" /></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-100 rounded w-20 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredInventory.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Package className="w-8 h-8 opacity-20" />
                                            <p>No inventory records found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredInventory.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{item.product?.name}</div>
                                            <div className="text-xs text-slate-500">{item.product?.categoryName}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">{item.product?.code || 'N/A'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.quantity > 10 ? 'bg-emerald-50 text-emerald-700' :
                                                    item.quantity > 0 ? 'bg-amber-50 text-amber-700' :
                                                        'bg-red-50 text-red-700'
                                                }`}>
                                                {item.quantity > 10 ? 'In Stock' : item.quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`text-sm font-bold ${item.quantity <= 10 ? 'text-amber-600' : 'text-slate-900'}`}>
                                                {item.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                                                Adjust
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-red-800">
                    <AlertCircle className="shrink-0 w-5 h-5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}
        </div>
    );
};

export default InventoryPage;

import React, { useEffect, useState, useCallback } from 'react';
import {
    Package,
    Search,
    Plus,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { productApi } from '../../lib/api/products';
import { useAuthStore } from '../../store/useAuthStore';

const ProductsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const user = useAuthStore((state) => state.user);
    // Use storeId from user or fallback to a default if not set (for multi-tenant context)
    const storeId = user?.storeId || '123e4567-e89b-12d3-a456-426614174000'; // Fallback for dev

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            let response;
            if (searchTerm) {
                response = await productApi.search(storeId, searchTerm, page, 10);
            } else {
                response = await productApi.getByStoreId(storeId, page, 10);
            }

            if (response.data) {
                setProducts(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
                setTotalElements(response.data.totalElements || 0);
            }
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setError('Unable to load products. Make sure the backend is running.');
        } finally {
            setIsLoading(false);
        }
    }, [storeId, page, searchTerm]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProducts();
        }, searchTerm ? 500 : 0); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [fetchProducts]);

    if (isLoading && products.length === 0) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-slate-500 gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <p className="font-medium">Loading your catalog...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products Catalog</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your inventory, pricing, and product details.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                </Button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                        placeholder="Search products by name or SKU..."
                        className="pl-10 bg-slate-50 border-slate-200"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(0);
                        }}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto border-slate-200 text-slate-600 bg-white hover:bg-slate-50">
                        <Filter className="w-4 h-4 mr-2" />
                        Category
                    </Button>
                    <Button variant="outline" className="w-full sm:w-auto border-slate-200 text-slate-600 bg-white hover:bg-slate-50">
                        Status
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-center gap-3 text-amber-800">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Product Information</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        No products found in this store.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-indigo-500" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{product.name}</p>
                                                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">${product.price?.toFixed(2) || '0.00'}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 text-slate-400">
                                                <button className="p-1 hover:text-indigo-600 transition-colors"><Edit className="w-4 h-4" /></button>
                                                <button className="p-1 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
                    <span>
                        Showing {products.length} of {totalElements} entries
                    </span>
                    <div className="flex gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-slate-200"
                            disabled={page === 0}
                            onClick={() => setPage(page - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-slate-200"
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage(page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;


import React, { useEffect, useState, useCallback } from 'react';
import { Search, ListFilter, CreditCard, Banknote, Package, ShoppingCart, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { productApi } from '../../lib/api/products';
import { categoryApi } from '../../lib/api/categories';
import { orderApi } from '../../lib/api/orders';
import { useAuthStore } from '../../store/useAuthStore';

const PosTerminal = () => {
    const [categories, setCategories] = useState(['All']);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentType, setPaymentType] = useState('CASH');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null);

    const user = useAuthStore((state) => state.user);
    const storeId = user?.storeId || '123e4567-e89b-12d3-a456-426614174000';
    const branchId = user?.branchId || null;

    const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [catRes, prodRes] = await Promise.all([
                categoryApi.getByStoreId(storeId, 0, 50),
                productApi.getByStoreId(storeId, 0, 100)
            ]);

            if (catRes.data && catRes.data.content) {
                setCategories(['All', ...catRes.data.content.map(c => c.name)]);
            }
            if (prodRes.data && prodRes.data.content) {
                setProducts(prodRes.data.content);
            }
        } catch (err) {
            console.error('Failed to fetch POS data:', err);
            setError('Terminal connection issues. Please refresh.');
        } finally {
            setIsLoading(false);
        }
    }, [storeId]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const handleCheckout = async () => {
        if (cart.length === 0 || isProcessing) return;

        setIsProcessing(true);
        setError(null);

        try {
            const orderDto = {
                totalAmount: total,
                branchId: branchId,
                cashierId: user?.id,
                paymentType: paymentType,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            await orderApi.create(orderDto);
            setOrderSuccess(`Order completed! Total: $${total.toFixed(2)}`);
            setCart([]);

            // Auto hide success after 3 seconds
            setTimeout(() => setOrderSuccess(null), 3000);
        } catch (err) {
            console.error('Checkout failed:', err);
            setError('Failed to process order. Check inventory or payment connection.');
        } finally {
            setIsProcessing(false);
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.categoryName === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex-1 flex overflow-hidden w-full h-full">
            {/* Left Area: Product Grid */}
            <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
                {/* Search & Categories Bar */}
                <div className="bg-white border-b border-slate-200 shrink-0">
                    <div className="p-4 border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                placeholder="Search by name or scan barcode..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="h-14 px-4 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-all ${selectedCategory === cat
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Container */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 relative">
                    {orderSuccess && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-bold">{orderSuccess}</span>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                            <p>Loading terminal resources...</p>
                        </div>
                    ) : error ? (
                        <div className="h-full flex flex-col items-center justify-center text-amber-600 gap-3 border-2 border-dashed border-amber-200 rounded-3xl p-8 text-center">
                            <AlertCircle className="w-12 h-12" />
                            <p className="font-medium">{error}</p>
                            <Button variant="outline" onClick={fetchInitialData}>Try Reconnect</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 text-center">
                            {filteredProducts.length === 0 ? (
                                <div className="col-span-full py-20 text-slate-400">
                                    No products found matching filters.
                                </div>
                            ) : (
                                filteredProducts.map(product => (
                                    <button
                                        key={product.id}
                                        onClick={() => addToCart(product)}
                                        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 text-left hover:shadow-md hover:border-indigo-300 transition-all active:scale-95 group relative overflow-hidden"
                                    >
                                        <div className="aspect-square bg-slate-100 rounded-xl mb-3 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                            <Package className="w-10 h-10 text-slate-400 group-hover:text-indigo-400" />
                                        </div>
                                        <h3 className="font-semibold text-slate-900 truncate leading-tight">{product.name}</h3>
                                        <p className="text-xs text-slate-500 mb-2 truncate">{product.categoryName || 'General'}</p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="font-bold text-indigo-700">${product.price?.toFixed(2)}</span>
                                            <span className="text-[10px] font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                                                Active
                                            </span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Area: Cart Panel */}
            <div className="w-[320px] lg:w-[400px] bg-white border-l border-slate-200 flex flex-col shrink-0 relative z-10 shadow-[0_0_40px_-15px_rgba(0,0,0,0.1)]">

                {/* Cart Header */}
                <div className="h-16 border-b border-slate-200 px-6 flex items-center justify-between shrink-0 bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-900">Current Order</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setCart([])}
                        disabled={isProcessing}
                    >
                        Clear
                    </Button>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 flex flex-col items-center">
                            <ShoppingCart className="w-12 h-12 mb-3 text-slate-200" />
                            <p className="font-medium">Cart is empty</p>
                            <p className="text-sm">Select products to add</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm group">
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-slate-900 text-sm truncate">{item.name}</h4>
                                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                        <span className="font-medium text-slate-700">${item.price?.toFixed(2)}</span>
                                        <span>x</span>
                                        <div className="flex items-center gap-2 bg-slate-50 rounded-md px-1 py-0.5">
                                            <button
                                                disabled={isProcessing}
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="w-5 h-5 flex items-center justify-center hover:bg-slate-200 rounded disabled:opacity-50"
                                            >-</button>
                                            <span className="w-4 text-center">{item.quantity}</span>
                                            <button
                                                disabled={isProcessing}
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="w-5 h-5 flex items-center justify-center hover:bg-slate-200 rounded disabled:opacity-50"
                                            >+</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-slate-900 text-sm">${(item.price * item.quantity).toFixed(2)}</div>
                                    {!isProcessing && (
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-[10px] text-red-500 hover:underline mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Totals & Checkout Panel */}
                <div className="bg-slate-50 border-t border-slate-200 p-6 shrink-0 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-20">
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Subtotal</span>
                            <span className="font-medium text-slate-900">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Tax (8%)</span>
                            <span className="font-medium text-slate-900">${tax.toFixed(2)}</span>
                        </div>
                        <div className="pt-3 border-t border-slate-200 flex justify-between items-end">
                            <span className="font-medium text-slate-900">Total</span>
                            <span className="text-3xl font-bold text-indigo-600">${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <Button
                            variant="outline"
                            className={`h-14 w-full bg-white border-slate-200 flex flex-col items-center justify-center gap-1 transition-all ${paymentType === 'CASH' ? 'border-indigo-600 ring-1 ring-indigo-600 text-indigo-600' : 'hover:bg-slate-50'}`}
                            onClick={() => setPaymentType('CASH')}
                            disabled={isProcessing}
                        >
                            <Banknote className="w-5 h-5" />
                            <span className="text-xs">Cash</span>
                        </Button>
                        <Button
                            variant="outline"
                            className={`h-14 w-full bg-white border-slate-200 flex flex-col items-center justify-center gap-1 transition-all ${paymentType === 'CARD' ? 'border-indigo-600 ring-1 ring-indigo-600 text-indigo-600' : 'hover:bg-slate-50'}`}
                            onClick={() => setPaymentType('CARD')}
                            disabled={isProcessing}
                        >
                            <CreditCard className="w-5 h-5" />
                            <span className="text-xs">Card</span>
                        </Button>
                    </div>

                    <Button
                        disabled={cart.length === 0 || isProcessing}
                        onClick={handleCheckout}
                        className="w-full h-16 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
                    >
                        {isProcessing ? (
                            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                        ) : (
                            `Charge $${total.toFixed(2)}`
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PosTerminal;

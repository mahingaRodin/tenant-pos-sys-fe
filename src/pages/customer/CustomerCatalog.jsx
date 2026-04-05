import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { productApi } from '../../lib/api/products';
import { storeApi } from '../../lib/api/stores';
import { branchApi } from '../../lib/api/branches';
import { inventoryApi } from '../../lib/api/inventories';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import {
    Search,
    ShoppingCart,
    Store,
    X,
    Plus,
    Minus,
    Loader2,
    MapPin,
    Building2,
    LayoutDashboard,
    ShoppingBag,
    CheckCircle2,
    RefreshCcw,
    Tag,
    Package,
    AlertCircle,
    ChevronRight,
    Sun,
    Moon,
    LogOut
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

/* ─── helpers ─────────────────────────────────────────────────── */
const getPrice  = (p) => Number(p.sellingPrice ?? p.mrp ?? p.price ?? 0);
const getImage  = (p) => p.image ?? p.imageUrl ?? null;
const itemStock = (p) => typeof p._stock === 'number' ? p._stock : null;
const isInStock = (p) => { const s = itemStock(p); return s === null || s > 0; };

/* ─── Category Filter Bar ─────────────────────────────────────── */
const CategoryBar = ({ categories, selected, onSelect }) => {
    const { theme } = useUIStore();
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
            <button
                onClick={() => onSelect('All')}
                className={`shrink-0 px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                    selected === 'All'
                        ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]'
                        : (theme === 'dark' ? 'bg-[#1e293b]/50 text-slate-400 hover:bg-[#1e293b] hover:text-slate-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700')
                }`}
            >
                All
            </button>
        {categories.map((cat) => (
            <button
                key={cat}
                onClick={() => onSelect(cat)}
                className={`shrink-0 px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                    selected === cat
                        ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]'
                        : (theme === 'dark' ? 'bg-[#1e293b]/50 text-slate-400 hover:bg-[#1e293b] hover:text-slate-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700')
                }`}
            >
                {cat}
            </button>
        ))}
    </div>
    );
};

/* ─── Product Card ─────────────────────────────────────────────── */
const ProductCard = ({ product, onSelect }) => {
    const { theme } = useUIStore();
    const addItem  = useCartStore((s) => s.addItem);
    const items    = useCartStore((s) => s.items);
    const [added, setAdded] = useState(false);

    const inCart   = items.some((i) => i.id === product.id);
    const stock    = itemStock(product);
    const instock  = isInStock(product);
    const img      = getImage(product);
    const price    = getPrice(product);

    const handleAdd = (e) => {
        e.stopPropagation();
        if (!instock) return;
        addItem({ ...product, price }, product.branchId || null, product.storeId || null);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    return (
        <div
            className={`group relative flex flex-col rounded-2xl border transition-all duration-500 overflow-hidden ${
                instock
                    ? (theme === 'dark' ? 'bg-[#111827] border-white/5 hover:border-indigo-500/50 hover:bg-[#161e31] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'bg-white border-slate-200 hover:border-indigo-500/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]')
                    : (theme === 'dark' ? 'bg-[#0f141e] border-white/5 opacity-80' : 'bg-slate-50 border-slate-200 opacity-80')
            }`}
            onClick={() => onSelect(product)}
        >
            {/* Image Container */}
            <div className="relative aspect-square w-full overflow-hidden bg-black/20">
                {img ? (
                    <img
                        src={img}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-all duration-700 ${
                            !instock ? 'grayscale opacity-40 blur-[1px]' : 'group-hover:scale-110'
                        }`}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10">
                        <ShoppingBag className="w-16 h-16 text-slate-500" />
                    </div>
                )}

                {/* Status Badges */}
                <div className="absolute top-3 left-3 z-10">
                    <span className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black text-slate-300 border border-white/10 uppercase tracking-widest">
                        {product.category?.name || 'General'}
                    </span>
                </div>

                {/* Price Tag Overlay */}
                {instock && (
                    <div className="absolute top-3 right-3 z-10">
                        <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-900/50 border border-indigo-400/30">
                            ${price.toFixed(2)}
                        </div>
                    </div>
                )}

                {/* Out of Stock Special Overlay (per second image) */}
                {!instock && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-[#1e293b]/80 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 shadow-2xl -rotate-12">
                            <span className="text-white/60 font-black text-xs uppercase tracking-tighter">Out of Stock</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="p-4 flex flex-col flex-1 gap-2">
                <div className="flex-1">
                    <h3 className={`font-black text-sm leading-snug line-clamp-2 mb-1 transition-colors ${
                        instock ? (theme === 'dark' ? 'text-white group-hover:text-indigo-400' : 'text-slate-900 group-hover:text-indigo-600') : 'text-slate-500'
                    }`}>
                        {product.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                        <Store className="w-3 h-3" />
                        <span className="truncate">{product.storeName}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <div className="flex flex-col">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                            instock ? 'text-indigo-400' : 'text-slate-600'
                        }`}>
                            {stock !== null ? `${stock} in stock` : 'Checking stock...'}
                        </span>
                        {!instock && <span className="text-[14px] font-black text-slate-700">${price.toFixed(2)}</span>}
                    </div>

                    <button
                        onClick={handleAdd}
                        disabled={!instock}
                        className={`h-9 px-4 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 ${
                            !instock
                                ? (theme === 'dark' ? 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed' : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed')
                                : added
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/50'
                                : inCart
                                ? 'bg-indigo-500/20 text-indigo-500 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white'
                                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/50 hover:-translate-y-0.5'
                        }`}
                    >
                        {!instock ? (
                            'Unavailable'
                        ) : added ? (
                            <><CheckCircle2 className="w-3.5 h-3.5" /> Added</>
                        ) : inCart ? (
                            'Available'
                        ) : (
                            'Available'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─── Product Modal ─────────────────────────────────────────────── */
const ProductModal = ({ product, onClose }) => {
    const { theme } = useUIStore();
    const [storeInfo, setStoreInfo] = useState(null);
    const [branches, setBranches]   = useState([]);
    const [loading, setLoading]     = useState(true);

    const addItem   = useCartStore((s) => s.addItem);
    const items     = useCartStore((s) => s.items);
    const updateQty = useCartStore((s) => s.updateQuantity);
    const removeItem = useCartStore((s) => s.removeItem);

    const cartItem = items.find((i) => i.id === product.id);
    const price    = getPrice(product);
    const img      = getImage(product);
    const instock  = isInStock(product);
    const stock    = itemStock(product);

    useEffect(() => {
        const sid = product.storeId;
        if (!sid) { setLoading(false); return; }
        Promise.all([storeApi.getById(sid), branchApi.getByStoreId(sid)])
            .then(([sRes, bRes]) => {
                setStoreInfo(sRes.data);
                setBranches(bRes.data?.content || bRes.data || []);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [product.storeId]);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
            <div
                className={`${theme === 'dark' ? 'bg-[#0f172a] border-white/10' : 'bg-white border-slate-200'} border w-full sm:max-w-4xl sm:rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row max-h-[95vh] sm:max-h-[85vh] rounded-t-[2.5rem]`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Image Section */}
                <div className={`md:w-2/5 relative min-h-[300px] bg-black/40 flex items-center justify-center ${!instock ? 'grayscale brightness-50' : ''}`}>
                    {img ? (
                        <img src={img} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-10">
                            <ShoppingBag className="w-32 h-32 text-slate-400" />
                        </div>
                    )}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2.5 bg-black/60 backdrop-blur-xl rounded-2xl hover:bg-black transition-all border border-white/10 text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    {!instock && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-indigo-600/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-indigo-400/30 -rotate-2 shadow-2xl">
                                <span className="text-white font-black uppercase tracking-widest text-sm">Out of Stock</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="md:w-3/5 p-8 sm:p-12 overflow-y-auto flex flex-col gap-8 scrollbar-hide no-scrollbar">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {product.category?.name || 'General'}
                            </span>
                            {instock && (
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    Available
                                </span>
                            )}
                        </div>

                        <div className="space-y-1">
                            <h2 className={`text-3xl sm:text-4xl font-black leading-tight tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{product.name}</h2>
                            {product.brand && <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.2em]">{product.brand}</p>}
                        </div>

                        <div className="flex items-baseline gap-4 pt-2">
                            <span className={`text-4xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>${price.toFixed(2)}</span>
                            {product.mrp && product.mrp > price && (
                                <span className="text-lg text-slate-500 line-through font-bold decoration-rose-500/30 decoration-2">
                                    ${Number(product.mrp).toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Quick Info</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className={`${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'} border p-4 rounded-3xl`}>
                                <Package className="w-5 h-5 text-indigo-500 mb-2" />
                                <p className="text-xs text-slate-500 font-bold mb-1">Availability</p>
                                <p className={`text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{stock !== null ? `${stock} in Stock` : 'Unlimited'}</p>
                            </div>
                            <div className={`${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'} border p-4 rounded-3xl`}>
                                <Store className="w-5 h-5 text-indigo-500 mb-2" />
                                <p className="text-xs text-slate-500 font-bold mb-1">Store Network</p>
                                <p className={`text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{product.storeName || 'Partner Store'}</p>
                            </div>
                        </div>
                    </div>

                    {product.description && (
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Description</h4>
                            <p className="text-slate-400 text-sm leading-relaxed font-medium">{product.description}</p>
                        </div>
                    )}

                    {/* Action Area */}
                    <div className={`mt-auto pt-6 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'}`}>
                        {!instock ? (
                            <div className={`w-full h-16 rounded-[1.5rem] flex items-center justify-center font-black tracking-widest uppercase text-xs ${theme === 'dark' ? 'bg-white/5 border border-white/5 text-slate-600' : 'bg-slate-100 border border-slate-200 text-slate-400'}`}>
                                Sold Out — Notify me when back
                            </div>
                        ) : cartItem ? (
                            <div className="flex items-center justify-between gap-6">
                                <div className={`flex items-center gap-4 rounded-[1.5rem] p-1.5 px-3 border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                    <button
                                        onClick={() => cartItem.quantity <= 1 ? removeItem(cartItem.id, cartItem.branchId) : updateQty(cartItem.id, cartItem.branchId, cartItem.quantity - 1)}
                                        className={`h-10 w-10 flex items-center justify-center rounded-xl transition-colors ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-white border hover:bg-slate-50 text-slate-700'}`}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className={`w-8 text-center font-black text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{cartItem.quantity}</span>
                                    <button
                                        onClick={() => updateQty(cartItem.id, cartItem.branchId, cartItem.quantity + 1)}
                                        className={`h-10 w-10 flex items-center justify-center rounded-xl transition-colors ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-white border hover:bg-slate-50 text-slate-700'}`}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Subtotal</p>
                                    <p className="text-3xl font-black text-indigo-400">${(price * cartItem.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => addItem({ ...product, price }, product.branchId || null, product.storeId || null)}
                                className="w-full h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                <ShoppingBag className="w-6 h-6" />
                                Add to Marketplace Cart
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─── Cart Drawer ──────────────────────────────────────────────── */
const CartDrawer = ({ open, onClose }) => {
    const items = useCartStore((s) => s.items);
    const removeItem = useCartStore((s) => s.removeItem);
    const updateQty = useCartStore((s) => s.updateQuantity);
    const clearCart = useCartStore((s) => s.clearCart);
    const total = useCartStore((s) => s.getTotalAmount());

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative w-full max-w-sm h-full bg-[#0d111a] shadow-[-20px_0_100px_rgba(0,0,0,0.5)] border-l border-white/5 flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-white italic">MY CART</h2>
                        <p className="text-[10px] font-black text-indigo-400 tracking-[0.3em] uppercase">{items.length} ACTIVE ITEMS</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-white"><X className="w-5 h-5" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide no-scrollbar">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-6 opacity-30">
                            <ShoppingBag className="w-20 h-20 text-slate-500" />
                            <div className="space-y-1">
                                <p className="font-black text-white uppercase tracking-widest text-sm">Cart Empty</p>
                                <p className="text-xs font-bold text-slate-500">Add products to see them here</p>
                            </div>
                        </div>
                    ) : items.map((item) => (
                        <div key={`${item.id}-${item.branchId}`} className="group flex items-center gap-4 p-4 bg-[#161e31] rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                            <div className="w-16 h-16 bg-black/20 rounded-xl overflow-hidden shrink-0">
                                {getImage(item) ? <img src={getImage(item)} alt={item.name} className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center"><ShoppingCart className="w-6 h-6 text-slate-700" /></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-white truncate text-sm mb-1">{item.name}</p>
                                <p className="text-indigo-400 font-black text-base">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                            </div>
                            <div className="flex flex-col items-center gap-1 bg-black/20 rounded-xl p-1 px-2 border border-white/5">
                                <button className="p-1 text-slate-500 hover:text-white" onClick={() => updateQty(item.id, item.branchId, item.quantity + 1)}><Plus className="w-3.5 h-3.5" /></button>
                                <span className="font-black text-white text-xs">{item.quantity}</span>
                                <button className="p-1 text-slate-500 hover:text-rose-500" onClick={() => item.quantity <= 1 ? removeItem(item.id, item.branchId) : updateQty(item.id, item.branchId, item.quantity - 1)}><Minus className="w-3.5 h-3.5" /></button>
                            </div>
                        </div>
                    ))}
                </div>

                {items.length > 0 && (
                    <div className="p-8 border-t border-white/5 bg-black/20 space-y-6">
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Amount</span>
                                <button onClick={clearCart} className="block text-[10px] font-black text-rose-500/50 hover:text-rose-500 uppercase tracking-widest transition-colors">Empty Cart</button>
                            </div>
                            <span className="text-4xl font-black text-white italic tracking-tighter">${total.toFixed(2)}</span>
                        </div>
                        <button className="w-full h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3 active:scale-[0.98]">
                            CHECKOUT NOW
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─── Main Page ─────────────────────────────────────────────────── */
const CustomerCatalog = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useUIStore();
    const logout = useAuthStore((s) => s.logout);

    const [products, setProducts]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);
    const [noStores, setNoStores]   = useState(false);
    const [search, setSearch]       = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cartOpen, setCartOpen]   = useState(false);

    const cartCount = useCartStore((s) => s.getTotalItems());

    const handleLogout = () => {
        if (window.confirm(t('common.logoutConfirmationMessage') || 'Are you sure you want to log out?')) {
            logout();
            navigate('/login');
        }
    };

    const fetchAll = useCallback(async () => {
        setLoading(true); setError(null); setNoStores(false);
        try {
            // 1. Get all stores
            let stores = [];
            try {
                const sRes = await storeApi.getAll(0, 100);
                stores = sRes.data?.content || sRes.data || [];
            } catch (e) {
                if (e?.response?.status === 403) { setNoStores(true); setLoading(false); return; }
                throw e;
            }
            if (!stores.length) { setProducts([]); setLoading(false); return; }

            // 2. Aggregate products and branch stock
            const storeResults = await Promise.allSettled(
                stores.map(async (store) => {
                    const [prodRes, branchRes] = await Promise.allSettled([
                        productApi.getByStoreId(store.id, 0, 500),
                        branchApi.getByStoreId(store.id, 0, 100),
                    ]);

                    const prods    = prodRes.status === 'fulfilled' ? (prodRes.value.data?.content || prodRes.value.data || []) : [];
                    const branches = branchRes.status === 'fulfilled' ? (branchRes.value.data?.content || branchRes.value.data || []) : [];

                    if (prodRes.status === 'rejected') console.warn(`[CustomerCatalog] Failed to fetch products for store ${store.id}:`, prodRes.reason);
                    if (branchRes.status === 'rejected') console.warn(`[CustomerCatalog] Failed to fetch branches for store ${store.id}:`, branchRes.reason);

                    // Fetch inventory for all branches of this store
                    const invResults = await Promise.allSettled(
                        branches.map((b) => inventoryApi.getByBranchId(b.id, 0, 1000).catch(err => {
                            console.warn(`[CustomerCatalog] Failed to fetch inventory for branch ${b.id}:`, err);
                            throw err;
                        }))
                    );

                    const stockMap = {};
                    const stockMapBySku = {};
                    invResults.forEach((r, idx) => {
                        if (r.status !== 'fulfilled') return;
                        const inv = r.value.data?.content || r.value.data || [];
                        inv.forEach((i) => {
                            const pid = i.productId || i.product?.id || i.product_id;
                            const psku = i.productSku || i.product?.sku;
                            const qty = Number(i.quantity) || 0;
                            if (pid) stockMap[pid] = (stockMap[pid] || 0) + qty;
                            if (psku) stockMapBySku[psku] = (stockMapBySku[psku] || 0) + qty;
                        });
                    });

                    return prods.map((p) => {
                        let stock = 0;
                        if (stockMap.hasOwnProperty(p.id)) {
                            stock = stockMap[p.id];
                        } else if (p.sku && stockMapBySku.hasOwnProperty(p.sku)) {
                            stock = stockMapBySku[p.sku];
                        }
                        
                        return {
                            ...p,
                            price: Number(p.sellingPrice ?? p.mrp ?? 0),
                            storeName: store.brand || store.name || 'Store',
                            _stock: stock,
                        };
                    });
                })
            );

            const all = [];
            const seen = new Set();
            storeResults.forEach((r) => {
                if (r.status === 'fulfilled') {
                    r.value.forEach((p) => { if (!seen.has(p.id)) { seen.add(p.id); all.push(p); } });
                }
            });

            setProducts(all);
        } catch (err) {
            console.error('[CustomerCatalog]', err);
            setError('System update in progress. Please refresh in a moment.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const categories = useMemo(() =>
        ['All', ...new Set(products.map((p) => p.category?.name).filter(Boolean))].slice(1)
    , [products]);

    const filtered = useMemo(() => {
        return products.filter((p) => {
            const q = search.toLowerCase();
            const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.category?.name?.toLowerCase().includes(q) || p.storeName?.toLowerCase().includes(q);
            const matchCat = activeCategory === 'All' || p.category?.name === activeCategory;
            return matchSearch && matchCat;
        }).sort((a, b) => (isInStock(b) ? 1 : -1) - (isInStock(a) ? 1 : -1)); // In-stock items first
    }, [products, search, activeCategory]);

    return (
        <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#080d16] text-white selection:bg-indigo-500/30' : 'bg-slate-50 text-slate-900 selection:bg-indigo-300/30'}`}>
            {/* Header */}
            <header className={`${theme === 'dark' ? 'bg-[#080d16]/80 border-white/5' : 'bg-white/80 border-slate-200'} backdrop-blur-2xl border-b sticky top-0 z-40 transition-colors`}>
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-900/50">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-xl font-black text-white italic tracking-tighter leading-none">TENANT<span className="text-indigo-400">SHOP</span></p>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">Global Marketplace</p>
                        </div>
                    </Link>

                    <div className="flex-1 max-w-2xl relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Find products, stores, or categories..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium focus:bg-white/10 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={toggleTheme} className={`p-3 rounded-2xl transition-all border ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/5' : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 border-slate-200'}`}>
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <Link to="/my-dashboard" className={`hidden md:flex p-3 rounded-2xl transition-all border ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/5' : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 border-slate-200'}`}>
                            <LayoutDashboard className="w-5 h-5" />
                        </Link>
                        <button onClick={() => setCartOpen(true)} className="relative p-3 bg-indigo-600/10 rounded-2xl hover:bg-indigo-600/20 transition-all text-indigo-500 border border-indigo-500/20">
                            <ShoppingCart className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className={`absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center shadow-lg shadow-rose-900/50 border-2 ${theme === 'dark' ? 'border-[#080d16]' : 'border-white'}`}>
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </button>
                         <button onClick={handleLogout} className={`p-3 rounded-2xl transition-all border ${theme === 'dark' ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/20' : 'bg-rose-50 text-rose-500 hover:bg-rose-100 border-rose-100'}`}>
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
                {/* Hero / Filter Section */}
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className={`text-4xl sm:text-5xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>EXPLORE PRODUCTS</h1>
                            <p className="text-slate-500 font-bold max-w-xl text-sm uppercase tracking-widest">Premium quality goods from our network of verified store partners.</p>
                        </div>
                        {!loading && products.length > 0 && (
                            <div className={`flex items-center gap-3 p-2 px-4 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'}`}>
                                <Tag className="w-4 h-4 text-indigo-500" />
                                <span className="text-xs font-black text-slate-400">
                                    {filtered.length} AVAILABLE ITEMS
                                </span>
                            </div>
                        )}
                    </div>

                    {!loading && categories.length > 0 && (
                        <CategoryBar categories={categories} selected={activeCategory} onSelect={setActiveCategory} />
                    )}
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="h-96 flex flex-col items-center justify-center gap-6">
                        <div className="w-20 h-20 border-4 border-indigo-900 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_50px_rgba(79,70,229,0.2)]" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Syncing Database...</p>
                    </div>
                ) : noStores ? (
                    <div className="py-32 text-center bg-white/5 rounded-[3rem] border border-white/5 px-10">
                        <AlertCircle className="w-16 h-16 text-amber-500/40 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-white italic">ACCESS DENIED</h3>
                        <p className="text-slate-500 mt-2 max-w-sm mx-auto font-bold text-sm uppercase">Please contact security to verify your customer credentials.</p>
                        <button onClick={fetchAll} className="mt-8 bg-white text-black font-black px-10 py-4 rounded-2xl hover:bg-slate-200 transition-all uppercase text-xs tracking-widest">Authenticate Again</button>
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {filtered.map((p) => <ProductCard key={p.id} product={p} onSelect={setSelectedProduct} />)}
                    </div>
                ) : (
                    <div className="py-32 text-center opacity-30">
                        <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-slate-600" />
                        <h3 className="text-xl font-black italic">NO RESULTS FOUND</h3>
                        <p className="text-xs font-bold uppercase tracking-widest mt-2">{search ? `Nothing matches "${search}"` : 'Marketplace is restocking...'}</p>
                    </div>
                )}
            </main>

            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
            {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
        </div>
    );
};

export default CustomerCatalog;

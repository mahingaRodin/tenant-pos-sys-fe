import React, { useEffect, useState } from 'react';
import {
    Building2,
    MapPin,
    Users,
    Activity,
    Plus,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { storeApi } from '../../lib/api/stores';
import { useAuthStore } from '../../store/useAuthStore';

const StoresPage = () => {
    const [branches, setBranches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        const fetchStores = async () => {
            setIsLoading(true);
            try {
                // In a multi-tenant SaaS, usually an Admin sees their stores
                // We'll try to fetch all stores first, or use the user's specific store if they have one
                const response = await storeApi.getAll(0, 10);

                // Spring Boot Page response structure: response.data.content
                if (response.data && response.data.content) {
                    setBranches(response.data.content);
                } else {
                    setBranches([]);
                }
            } catch (err) {
                console.error('Failed to fetch stores:', err);
                setError('Could not load stores. Please check your connection to the backend.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStores();
    }, []);

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-slate-500 gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <p className="font-medium">Loading your stores...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex flex-col items-center text-center gap-3">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <div className="space-y-1">
                    <h3 className="font-bold text-red-900">Connection Error</h3>
                    <p className="text-red-700 max-w-md">{error}</p>
                </div>
                <Button
                    onClick={() => window.location.reload()}
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white"
                >
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stores & Branches</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your multi-location network and view high-level performance.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Store
                </Button>
            </div>

            {branches.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900">No stores found</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mt-2">Get started by creating your first store to manage your business.</p>
                    <Button className="mt-6 bg-indigo-600">Create My First Store</Button>
                </div>
            ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                    {branches.map((store) => (
                        <div key={store.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 leading-tight">{store.name}</h3>
                                        <div className="flex items-center text-sm text-slate-500 mt-1">
                                            <MapPin className="w-3.5 h-3.5 mr-1" />
                                            {store.address || 'No address provided'}
                                        </div>
                                    </div>
                                </div>
                                <span className={`flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${store.status === 'ACTIVE'
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {store.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>}
                                    {store.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 py-4 border-y border-slate-100 my-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Business Email</p>
                                    <p className="text-sm font-medium text-slate-800 truncate">{store.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1 flex items-center"><Users className="w-3 h-3 mr-1" /> Phone</p>
                                    <p className="text-sm font-medium text-slate-800">{store.phone || 'N/A'}</p>
                                </div>
                                <div className="col-span-2 lg:col-span-1 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-4">
                                    <p className="text-xs text-slate-500 mb-1 flex items-center"><Activity className="w-3 h-3 mr-1" /> Status</p>
                                    <p className="text-sm font-bold text-indigo-600">{store.status}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1 bg-white border-slate-200 text-slate-700 hover:bg-slate-50">Manage Store</Button>
                                <Button variant="outline" className="flex-1 bg-white border-slate-200 text-slate-700 hover:bg-slate-50">View Analytics</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StoresPage;


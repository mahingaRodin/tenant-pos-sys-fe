import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

// Layouts
import DashboardLayout from '../components/layout/DashboardLayout';
import PosLayout from '../components/layout/PosLayout';
import AuthLayout from '../components/layout/AuthLayout';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardOverview from '../pages/dashboard/DashboardOverview';
import ProductsPage from '../pages/dashboard/ProductsPage';
import StoresPage from '../pages/dashboard/StoresPage';
import InventoryPage from '../pages/dashboard/InventoryPage';
import OrdersPage from '../pages/dashboard/OrdersPage';
import PosTerminal from '../pages/pos/PosTerminal';
import LandingPage from '../pages/LandingPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const role = user?.role;
    const isAuthorized = !allowedRoles || allowedRoles.includes(role) || role === 'ROLE_SUPER_ADMIN';

    if (!isAuthorized) {
        // Redirect to their default landing page if unauthorized
        const targetPath = role === 'ROLE_BRANCH_CASHIER' ? '/pos' : '/dashboard';
        return <Navigate to={targetPath} replace />;
    }

    return children;
};

export const router = createBrowserRouter([
    {
        path: '/login',
        element: (
            <AuthLayout>
                <LoginPage />
            </AuthLayout>
        ),
    },
    {
        path: '/register',
        element: (
            <AuthLayout>
                <RegisterPage />
            </AuthLayout>
        ),
    },
    {
        path: '/',
        element: <LandingPage />,
    },
    {
        path: '/dashboard',
        element: (
            <ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_STORE_ADMIN', 'ROLE_STORE_MANAGER', 'ROLE_BRANCH_MANAGER']}>
                <DashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <DashboardOverview />,
            },
            {
                path: 'products',
                element: <ProductsPage />,
            },
            {
                path: 'stores',
                element: <StoresPage />,
            },
            {
                path: 'inventory',
                element: <InventoryPage />,
            },
            {
                path: 'orders',
                element: <OrdersPage />,
            },
        ],
    },
    {
        path: '/pos',
        element: (
            <ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_STORE_ADMIN', 'ROLE_BRANCH_CASHIER']}>
                <PosLayout>
                    <PosTerminal />
                </PosLayout>
            </ProtectedRoute>
        ),
    },
]);

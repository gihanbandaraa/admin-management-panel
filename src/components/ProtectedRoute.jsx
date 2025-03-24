import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute = () => {
    const { user, loading } = useContext(AuthContext);

    // Don't redirect while checking authentication
    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 mx-auto text-[#475A99]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-lg font-medium text-gray-700">Loading dashboard...</p>
                    <p className="mt-2 text-sm text-gray-500">Please wait while we verify your credentials</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
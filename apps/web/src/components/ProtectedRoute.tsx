import { Navigate, Outlet } from 'react-router';
import { useCurrentUser } from '../hooks/useCurrentUser';

export function ProtectedRoute() {
    const { data, isLoading, isError } = useCurrentUser();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError || !data) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

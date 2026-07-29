import { Navigate, Outlet } from 'react-router';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { LoadingScreen } from './LoadingScreen';

export function ProtectedRoute() {
    const { data, isLoading, isError } = useCurrentUser();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (isError || !data) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

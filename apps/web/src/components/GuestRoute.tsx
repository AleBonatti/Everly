import { Navigate, Outlet } from 'react-router';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { LoadingScreen } from './LoadingScreen';

export function GuestRoute() {
    const { data, isLoading } = useCurrentUser();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (data) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}

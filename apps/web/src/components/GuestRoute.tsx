import { Navigate, Outlet } from 'react-router';
import { useCurrentUser } from '../hooks/useCurrentUser';

export function GuestRoute() {
    const { data, isLoading } = useCurrentUser();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (data) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

import { useQuery } from '@tanstack/react-query';
import { getMe } from '../lib/api/auth';

export function useCurrentUser() {
    return useQuery({
        queryKey: ['me'],
        queryFn: getMe,
        retry: false,
    });
}

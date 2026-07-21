import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { login } from '../lib/api/auth';

export function LoginPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: login,
        onSuccess: (user) => {
            queryClient.setQueryData(['me'], user);
            navigate('/');
        },
    });

    return (
        <div>
            <p>Login page</p>
            <button onClick={() => mutation.mutate({ email: 'la.seppia@gmail.com', password: 'password' })}>Test login</button>
            {mutation.isError && <p>{mutation.error.message}</p>}
        </div>
    );
}

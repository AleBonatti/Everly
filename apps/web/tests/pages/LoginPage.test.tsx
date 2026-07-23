import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import { LoginPage } from '../../src/pages/LoginPage';
import { ApiError } from '../../src/lib/api-client';
import * as authApi from '../../src/lib/api/auth';

vi.mock('../../src/lib/api/auth');

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows a validation error instead of submitting an empty form', async () => {
        const user = userEvent.setup();
        renderWithProviders(<LoginPage />);

        await user.click(screen.getByRole('button', { name: /log in/i }));

        expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
        expect(authApi.login).not.toHaveBeenCalled();
    });

    it('calls login with the entered credentials on submit', async () => {
        vi.mocked(authApi.login).mockResolvedValue({
            id: 'user-1',
            name: 'Ada Lovelace',
            email: 'ada@example.com',
        });

        const user = userEvent.setup();
        renderWithProviders(<LoginPage />);

        await user.type(screen.getByLabelText(/email/i), 'ada@example.com');
        await user.type(screen.getByLabelText(/password/i), 'supersecret123');
        await user.click(screen.getByRole('button', { name: /log in/i }));

        await waitFor(() => {
            expect(authApi.login).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'supersecret123' });
        });
    });

    it('shows the server error message when login fails', async () => {
        vi.mocked(authApi.login).mockRejectedValue(new ApiError(401, 'Invalid email or password'));

        const user = userEvent.setup();
        renderWithProviders(<LoginPage />);

        await user.type(screen.getByLabelText(/email/i), 'ada@example.com');
        await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
        await user.click(screen.getByRole('button', { name: /log in/i }));

        expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
    });
});

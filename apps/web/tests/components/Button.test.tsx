import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../test-utils';
import { Button } from '../../src/components/Button';

describe('Button', () => {
    it('renders its children', () => {
        render(<Button>Save item</Button>);
        expect(screen.getByRole('button', { name: 'Save item' })).toBeInTheDocument();
    });

    it('calls onClick when clicked', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);

        await user.click(screen.getByRole('button', { name: 'Click me' }));

        expect(handleClick).toHaveBeenCalledOnce();
    });

    it('is disabled and unclickable while isLoading', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();
        render(
            <Button onClick={handleClick} isLoading>
                Saving...
            </Button>,
        );

        const button = screen.getByRole('button', { name: 'Saving...' });
        expect(button).toBeDisabled();

        await user.click(button);
        expect(handleClick).not.toHaveBeenCalled();
    });
});

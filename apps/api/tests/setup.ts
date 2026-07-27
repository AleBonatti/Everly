import { vi } from 'vitest';

process.loadEnvFile('.env.test');

vi.mock('../src/lib/email.js', () => ({
    sendEmail: vi.fn().mockResolvedValue(undefined),
}));

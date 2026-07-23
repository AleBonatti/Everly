import { buildApp } from '../../src/app.js';

export function createTestApp() {
    return buildApp({ logger: false });
}

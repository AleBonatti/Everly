export function withDelay<Args extends unknown[], T>(fn: (...args: Args) => Promise<T>, ms = 500) {
    return async (...args: Args): Promise<T> => {
        await new Promise((resolve) => setTimeout(resolve, ms));
        return fn(...args);
    };
}

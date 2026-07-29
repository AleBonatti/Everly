import { useEffect, useState } from 'react';

const SLOW_THRESHOLD_MS = 3000;

export function LoadingScreen() {
    const [isSlow, setIsSlow] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsSlow(true), SLOW_THRESHOLD_MS);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3.5 text-center px-6">
            <span className="size-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">{isSlow ? 'Waking up the server, this may take a moment...' : 'Loading...'}</p>
        </div>
    );
}

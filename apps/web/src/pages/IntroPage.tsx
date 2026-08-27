import { Navigate, Link } from 'react-router';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { LoadingScreen } from '../components/LoadingScreen';
import everlyLogo from '../assets/everly-logo.png';
import everlyClaim from '../assets/everly-logo-claim.png';
import appStoreBadge from '../assets/store-app-store-dark-english.svg';
import googlePlayBadge from '../assets/store-google-play-dark-english.svg';

const FEATURES = [
    'Quickly save anything worth remembering, right when you think of it',
    'Organize your list by category and importance',
    'Attach a location so you always know where to find that restaurant or spot again',
    'Search and filter your list to find things fast',
    "Archive what you've already done, keep the rest for later",
];

export function IntroPage() {
    const { data: user, isLoading } = useCurrentUser();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex justify-center px-8 py-20">
            <div className="w-full max-w-180 flex flex-col items-center">
                <div className="flex flex-col items-center gap-2.5 mb-14">
                    <img src={everlyLogo} alt="Everly" className="h-16 w-auto" />
                    <img src={everlyClaim} alt="A list of things worth doing" className="h-8 w-auto" />
                </div>

                <div className="flex flex-col gap-5 w-full">
                    <p className="text-base leading-relaxed text-foreground/85 text-pretty">
                        How many times have you been talking with friends about a <span className="font-bold">movie you wanted to watch</span>, walked past a{' '}
                        <span className="font-bold">new restaurant downtown you meant to try</span>, or thought about <span className="font-bold">a place you'd love to visit</span> someday — only to
                        forget about it a week later?
                    </p>
                    <p className="text-base leading-relaxed text-foreground/85 text-pretty">Everly helps you hold onto all those little "I should do that" moments, so they don't get lost.</p>
                    <p className="text-base leading-relaxed text-foreground/85 text-pretty">
                        Keep a simple, organized list of everything worth doing: movies, restaurants, trips, events, and anything else that catches your eye. Add a photo, a location on the map, and a
                        category, so when you're ready, everything you wanted to try is right there waiting for you.
                    </p>
                </div>

                <div className="w-full mt-13 pt-10 border-t border-border-subtle flex flex-col gap-5">
                    <h2 className="text-sm font-bold tracking-widest uppercase text-accent">Why Everly</h2>
                    <ul className="flex flex-col gap-3.5">
                        {FEATURES.map((feature) => (
                            <li key={feature} className="flex gap-3.5 items-start">
                                <span className="shrink-0 size-1.5 mt-2.5 rounded-full bg-accent" />
                                <span className="text-[16.5px] leading-relaxed text-foreground/90">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="mt-13 text-lg italic font-semibold leading-relaxed text-center text-foreground text-pretty">
                    Stop losing track of the things you actually wanted to do. Start your list with Everly!
                </p>

                <div className="flex flex-wrap gap-3.5 items-center justify-center mt-8">
                    <Link to="/login" className="inline-flex items-center justify-center gap-2.5 h-14 px-7 rounded-[10px] bg-accent hover:bg-accent-hover text-accent-foreground font-bold text-lg">
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M3 12h18" />
                            <path d="M12 3c2.6 2.5 2.6 15.5 0 18M12 3c-2.6 2.5-2.6 15.5 0 18" />
                        </svg>
                        Go to web app
                    </Link>

                    <img src={appStoreBadge} alt="Download on the App Store" className="h-14 w-auto" />

                    <img src={googlePlayBadge} alt="Get it on Google Play" className="h-14 w-auto" />
                </div>
            </div>
        </div>
    );
}

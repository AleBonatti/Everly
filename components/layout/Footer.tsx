import Container from './Container';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <Container size="2xl">
        <div className="flex h-16 items-center justify-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            © {currentYear} FutureList. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}

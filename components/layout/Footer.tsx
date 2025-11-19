import Container from './Container';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full">
      <Container size="2xl" className="mb-4">
        <div className="rounded-2xl bg-[#F2F2F2] dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex h-16 items-center justify-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              © {currentYear} FutureList. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

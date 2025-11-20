import Container from './Container';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full">
      <Container size="2xl" className="mb-4">
        <div className="px-4 sm:px-6 lg:px-8 rounded-2xl bg-[#F2F2F2] dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex justify-between items-center h-16">
            <p className="text-base font-medium text-secondary dark:text-neutral-400">
              © {currentYear} FutureList. All rights reserved.
            </p>
            <p className="text-base font-light space-x-6 text-secondary dark:text-neutral-400">
              <a href="#" className="hover:underline">
                Privacy policy
              </a>
              <a href="#" className="hover:underline">
                Cookie policy
              </a>
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

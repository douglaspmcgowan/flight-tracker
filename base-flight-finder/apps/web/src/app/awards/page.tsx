import Link from 'next/link';
import { AwardWorkspace } from '@/components/AwardWorkspace/AwardWorkspace';
import { Footer } from '@/components/Footer';
import { ThemeToggle } from '@/components/ThemeToggle';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function AwardsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string | string[] }>;
}) {
  const params = await searchParams;
  const initialSearchId = typeof params.search === 'string' ? params.search : undefined;

  return (
    <main className={styles.root} id="main-content">
      <header className={styles.topBar}>
        <Link href="/" className={styles.brand}>Flight Finder</Link>
        <nav className={styles.nav} aria-label="Awards page">
          <Link href="/">Cash trackers</Link>
          <span aria-current="page">Awards</span>
          <ThemeToggle />
        </nav>
      </header>
      <AwardWorkspace initialSearchId={initialSearchId} />
      <Footer />
    </main>
  );
}

import { redirect } from 'next/navigation';
import { Empty, ErrorBanner, PageHeader, QueryError } from '@/components/PanelContent';
import { getActiveProfile } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { Profile } from '@/lib/types';
import { grantEntitlement, revokeEntitlement, setUserDisabled } from '../actions';
import styles from '@/components/PanelContent.module.css';

export const dynamic = 'force-dynamic';

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string; err?: string }> }) {
  const profile = await getActiveProfile();
  if (!profile) redirect('/');
  if (profile.role !== 'admin') redirect('/dashboard');

  const { q, err } = await searchParams;
  const svc = createServiceClient();
  let query = svc.from('profiles').select('id, email, role, disabled').order('created_at', { ascending: false }).limit(50);
  if (q) query = query.ilike('email', `%${q}%`);
  const { data, error } = await query;
  const users = (data as Profile[] | null) ?? [];

  const { data: productRows } = await svc
    .from('products')
    .select('id, title')
    .order('sort_order')
    .order('price_idr');
  const grantKinds = ((productRows as { id: string; title: string }[] | null) ?? [])
    .filter((product) => product.id !== 'bundle')
    .map((product) => ({ id: product.id, label: product.title }));

  return (
    <>
      <PageHeader crumb="Admin / Pengguna" title="Pengguna" lede="Maksimal 50 akun per pencarian." />
      {err ? <ErrorBanner message={err} /> : null}
      <form method="get" className={styles.searchForm}>
        <input name="q" placeholder="Cari email..." defaultValue={q ?? ''} className={styles.input} />
        <button type="submit" className={styles.button}>
          Cari
        </button>
      </form>

      {error ? (
        <QueryError />
      ) : users.length === 0 ? (
        <Empty text={q ? 'Tidak ada pengguna dengan email itu.' : 'Belum ada pengguna.'} />
      ) : (
        users.map((user) => (
          <div key={user.id} className={styles.card}>
            <div className={styles.cardTitle}>
              {user.email ?? user.id} <span className={styles.meta}>({user.role})</span>
              {user.disabled ? <span className={styles.disabledMark}> — disabled</span> : null}
            </div>
            <div className={styles.userActions}>
              <form action={setUserDisabled}>
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="disabled" value={String(!user.disabled)} />
                {q ? <input type="hidden" name="q" value={q} /> : null}
                <button type="submit" className={styles.button} disabled={user.id === profile.id}>
                  {user.disabled ? 'Aktifkan' : 'Nonaktifkan'}
                </button>
              </form>
              <form action={grantEntitlement} className={styles.pair}>
                <input type="hidden" name="userId" value={user.id} />
                {q ? <input type="hidden" name="q" value={q} /> : null}
                <select name="kind" className={styles.select} defaultValue="guide">
                  {grantKinds.map((kind) => (
                    <option key={kind.id} value={kind.id}>
                      {kind.label}
                    </option>
                  ))}
                </select>
                <button type="submit" className={styles.button}>
                  Grant
                </button>
                <button type="submit" className={styles.buttonDanger} formAction={revokeEntitlement}>
                  Revoke
                </button>
              </form>
            </div>
          </div>
        ))
      )}
    </>
  );
}

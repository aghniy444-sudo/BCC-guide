import { redirect } from 'next/navigation';
import { Empty, ErrorBanner, PageHeader, QueryError } from '@/components/PanelContent';
import { getActiveProfile } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { Post } from '@/lib/types';
import { deletePost, savePost, setPostPublished } from '../actions';
import styles from '@/components/PanelContent.module.css';

export const dynamic = 'force-dynamic';

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ err?: string }> }) {
  const profile = await getActiveProfile();
  if (!profile) redirect('/');
  if (profile.role !== 'admin') redirect('/dashboard');

  const { err } = await searchParams;
  const svc = createServiceClient();
  const { data, error } = await svc.from('posts').select('*').order('created_at', { ascending: false });
  const posts = (data as Post[] | null) ?? [];

  return (
    <>
      <PageHeader crumb="Admin / Posting" title="Posting Lomba / Booklet / Course" />
      {err ? <ErrorBanner message={err} /> : null}
      <form action={savePost} className={styles.form}>
        <div className={styles.cardTitle}>Buat posting baru</div>
        <select name="type" defaultValue="competition" className={styles.select}>
          <option value="competition">Lomba</option>
          <option value="booklet">Booklet</option>
          <option value="course">Course (YouTube)</option>
        </select>
        <input name="title" placeholder="Judul" className={styles.input} />
        <textarea name="body" placeholder="Deskripsi" className={styles.textarea} />
        <input name="url" placeholder="URL (https, wajib YouTube untuk course)" className={styles.input} />
        <label className={styles.checkRow}>
          <input type="checkbox" name="published" value="true" /> Publish
        </label>
        <button type="submit" className={styles.button}>
          Tambah
        </button>
      </form>

      {error ? (
        <QueryError />
      ) : posts.length === 0 ? (
        <Empty text="Belum ada posting." />
      ) : (
        <>
          {posts.map((post) => (
            <form key={post.id} action={savePost} className={styles.form}>
              <input type="hidden" name="postId" value={post.id} />
              <select name="type" defaultValue={post.type} className={styles.select}>
                <option value="competition">Lomba</option>
                <option value="booklet">Booklet</option>
                <option value="course">Course (YouTube)</option>
              </select>
              <input name="title" defaultValue={post.title} className={styles.input} />
              <textarea name="body" defaultValue={post.body} className={styles.textarea} />
              <input name="url" defaultValue={post.url ?? ''} className={styles.input} />
              <label className={styles.checkRow}>
                <input type="checkbox" name="published" value="true" defaultChecked={post.published} /> Publish
              </label>
              <button type="submit" className={styles.button}>
                Simpan
              </button>
            </form>
          ))}
          <div className={styles.inlineActions}>
            {posts.map((post) => (
              <span key={post.id} className={styles.pair}>
                <form action={setPostPublished}>
                  <input type="hidden" name="postId" value={post.id} />
                  <input type="hidden" name="published" value={String(!post.published)} />
                  <button type="submit" className={styles.button}>
                    {post.published ? 'Unpublish' : 'Publish'} “{post.title.slice(0, 18)}”
                  </button>
                </form>
                <form action={deletePost}>
                  <input type="hidden" name="postId" value={post.id} />
                  <button type="submit" className={styles.buttonDanger}>
                    Hapus
                  </button>
                </form>
              </span>
            ))}
          </div>
        </>
      )}
    </>
  );
}

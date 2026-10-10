import { redirect } from 'next/navigation';
import { Empty, PageHeader, PostList, QueryError } from '@/components/PanelContent';
import { createClient, getActiveProfile } from '@/lib/supabase/server';
import type { Post } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function BookletsPage() {
  const profile = await getActiveProfile();
  if (!profile) redirect('/');
  if (profile.role === 'admin') redirect('/admin');

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('id, type, title, body, url, published, created_at')
    .eq('published', true)
    .eq('type', 'booklet')
    .order('created_at', { ascending: false });
  const posts = (data as Post[] | null) ?? [];

  return (
    <>
      <PageHeader crumb="Dashboard / Booklet" title="Booklet" />
      {error ? <QueryError /> : posts.length === 0 ? <Empty text="Belum ada booklet." /> : <PostList posts={posts} />}
    </>
  );
}

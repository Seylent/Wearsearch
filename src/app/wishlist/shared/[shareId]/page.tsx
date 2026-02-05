import PublicWishlistContent from '@/components/pages/PublicWishlistContent';

export const revalidate = 300;

interface WishlistPageProps {
  params: Promise<{ shareId: string }>;
}

export default async function PublicWishlistSharedPage({ params }: WishlistPageProps) {
  const { shareId } = await params;
  return <PublicWishlistContent shareId={shareId} />;
}

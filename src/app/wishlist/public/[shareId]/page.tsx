import PublicWishlistContent from '@/components/pages/PublicWishlistContent';

export const revalidate = 300;

interface WishlistPageProps {
  params: Promise<{ shareId: string }>;
}

export default async function PublicWishlistPage({ params }: WishlistPageProps) {
  const { shareId } = await params;
  return <PublicWishlistContent shareId={shareId} />;
}

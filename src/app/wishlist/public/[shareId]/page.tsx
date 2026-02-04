import PublicWishlistContent from '@/components/pages/PublicWishlistContent';

export const revalidate = 300;

export default function PublicWishlistPage({ params }: { params: { shareId: string } }) {
  return <PublicWishlistContent shareId={params.shareId} />;
}

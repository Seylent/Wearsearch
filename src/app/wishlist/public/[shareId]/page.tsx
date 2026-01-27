import PublicWishlistContent from '@/components/pages/PublicWishlistContent';

export default function PublicWishlistPage({ params }: { params: { shareId: string } }) {
  return <PublicWishlistContent shareId={params.shareId} />;
}

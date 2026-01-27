import PublicWishlistContent from '@/components/pages/PublicWishlistContent';

export default function PublicWishlistSharedPage({ params }: { params: { shareId: string } }) {
  return <PublicWishlistContent shareId={params.shareId} />;
}

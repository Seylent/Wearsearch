import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { NeonAbstractions } from "@/components/NeonAbstractions";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { useUserRatings, useDeleteRating } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Star, Trash2, Store, Package } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Rating {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  store_id?: string;
  product_id?: string;
  store_name?: string;
  product_name?: string;
}

const MyRatings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const { data: ratings = [], isLoading: loading } = useUserRatings(userId || '');
  const deleteRatingMutation = useDeleteRating();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!authService.isAuthenticated()) {
      navigate("/auth");
      return;
    }

    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setUserId(userData.id);
    } catch (error) {
      console.error("Error:", error);
      navigate("/auth");
    }
  };

  const handleDeleteRating = async (ratingId: string) => {
    if (!user) return;

    try {
      await deleteRatingMutation.mutateAsync({ ratingId, userId: user.id });
      toast({
        title: "Success",
        description: "Rating deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting rating:", error);
      toast({
        title: "Error",
        description: "Failed to delete rating",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-zinc-600"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-[35vh] flex items-center justify-center overflow-hidden pt-28 pb-8">
        <NeonAbstractions />

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 glass-card-strong rounded-full mb-6">
            <Star className="w-3 h-3" />
            <span className="text-xs text-foreground/80 tracking-wider uppercase font-medium">
              Your Feedback
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-3 tracking-tight">
            My <span className="neon-text">Ratings</span>
          </h1>

          <p className="text-lg text-muted-foreground">
            View and manage all your product and store ratings
          </p>
        </div>
      </section>

      <main className="container mx-auto px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass-card p-6 rounded-2xl animate-pulse">
                  <div className="h-6 bg-zinc-800 rounded w-1/3 mb-4" />
                  <div className="h-4 bg-zinc-800 rounded w-full mb-2" />
                  <div className="h-4 bg-zinc-800 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : ratings.length === 0 ? (
            <div className="glass-card p-12 rounded-2xl text-center">
              <Star className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
              <h3 className="font-display text-2xl font-bold mb-2">No Ratings Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start rating products and stores to see them here
              </p>
              <Button
                onClick={() => navigate("/products")}
                className="bg-white text-black hover:bg-zinc-100"
              >
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div
                  key={rating.id}
                  className="glass-card p-6 rounded-2xl hover:bg-foreground/[0.08] transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {rating.store_id ? (
                          <Store className="w-5 h-5 text-zinc-400" />
                        ) : (
                          <Package className="w-5 h-5 text-zinc-400" />
                        )}
                        <h3 className="font-semibold text-lg">
                          {rating.store_name || rating.product_name || "Unknown"}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        {renderStars(rating.rating)}
                        <span className="text-sm text-zinc-500">
                          {new Date(rating.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {rating.comment && (
                        <p className="text-zinc-400 leading-relaxed">
                          {rating.comment}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(rating.id)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="glass-card-strong border-foreground/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rating</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this rating? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDeleteRating(deleteId)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyRatings;

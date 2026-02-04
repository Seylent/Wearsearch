export default function ProductNotFound() {
  return (
    <div className="min-h-screen text-foreground flex flex-col items-center justify-center px-4">
      <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2">Product not found</h1>
      <p className="text-muted-foreground text-center max-w-md">
        This product is no longer available or has been removed.
      </p>
    </div>
  );
}

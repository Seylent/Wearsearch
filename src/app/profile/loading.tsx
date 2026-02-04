export default function Loading() {
  return (
    <div className="min-h-screen text-foreground flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    </div>
  );
}

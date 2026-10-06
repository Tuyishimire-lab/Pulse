export default function Loading() {
  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center">
      <div className="w-16 h-16 relative">
        <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
        <div className="absolute inset-0 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
      </div>
      <h2 className="mt-6 text-xl font-medium text-white/80 animate-pulse">
        Loading Reports...
      </h2>
    </div>
  );
}

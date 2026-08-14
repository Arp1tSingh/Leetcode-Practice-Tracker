export default function Loading() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-secondary/50 rounded-lg animate-pulse"></div>
          <div className="h-4 w-64 bg-secondary/30 rounded-lg animate-pulse mt-2"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass p-6 rounded-2xl border border-border/50 h-32 animate-pulse">
            <div className="h-10 w-10 bg-secondary/80 rounded-full mb-3"></div>
            <div className="h-4 w-24 bg-secondary/50 rounded-lg mb-2"></div>
            <div className="h-6 w-16 bg-secondary/80 rounded-lg"></div>
          </div>
        ))}
      </div>
      
      <div className="glass rounded-2xl border border-border/50 h-96 animate-pulse p-6">
        <div className="h-6 w-32 bg-secondary/50 rounded-lg mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 w-full bg-secondary/30 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

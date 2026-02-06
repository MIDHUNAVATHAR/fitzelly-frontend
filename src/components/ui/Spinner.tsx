

export default function Spinner() {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-950/90 backdrop-blur-md">
        <div className="flex flex-col items-center gap-6">
          {/* Ring */}
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-400/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin"></div>
          </div>
  
          {/* Text */}
          <p className="text-sm tracking-wide text-zinc-400 animate-pulse">
            Loading dashboard…
          </p>
        </div>
      </div>
    );
  }
  
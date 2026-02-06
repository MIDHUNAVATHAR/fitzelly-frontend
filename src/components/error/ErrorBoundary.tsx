import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private goHome = () => {
    window.location.href = "/"; 
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.15),transparent_60%)]" />

          {/* Card */}
          <div className="relative z-10 max-w-md w-full rounded-3xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 shadow-2xl p-8">
            <div className="w-14 h-14 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-6">
              <AlertTriangle className="w-7 h-7 text-amber-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              Something went wrong
            </h2>

            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              This section couldn’t be loaded. You can try again, or return to
              the dashboard safely.
            </p>

            {this.state.error && (
              <div className="mb-6 rounded-lg bg-zinc-950 border border-zinc-800 p-4 text-xs font-mono text-zinc-400 max-h-40 overflow-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Primary */}
              <button
                onClick={this.goHome}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-400 text-black font-semibold px-5 py-3 hover:bg-emerald-500 transition shadow-[0_0_20px_rgba(52,211,153,0.4)]"
              >
                <ArrowLeft className="w-4 h-4" />
                Go to Home
              </button>

              {/* Secondary */}
              <button
                onClick={this.handleRetry}
                className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 text-zinc-300 px-5 py-3 hover:bg-zinc-800 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

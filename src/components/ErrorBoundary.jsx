import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("SNPSHOT Studio caught an unhandled error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          id="snpshot-error-boundary"
          className="min-h-screen w-full flex items-center justify-center p-6 bg-[#010030] text-[#FFE5F1] font-sans selection:bg-[#F042FF] selection:text-white"
        >
          <div className="max-w-md w-full bg-[#0e0048] border-2 border-[#2e109d] rounded-2xl p-8 shadow-[0_20px_60px_rgba(1,0,48,0.8)] text-center relative overflow-hidden">
            {/* Top decorative badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#2e109d]/40 border border-[#F042FF]/40 text-[#F042FF] text-xs font-mono font-bold tracking-widest uppercase mb-6">
              <AlertTriangle className="w-3.5 h-3.5 text-[#F042FF]" />
              STUDIO SYSTEM RECOVERY
            </div>

            <h1 className="font-display font-black text-2xl uppercase tracking-tight text-white mb-2">
              SOMETHING WENT OFF-GRID
            </h1>
            
            <p className="text-sm text-purple-200/80 mb-6 leading-relaxed">
              A temporary runtime issue occurred while rendering the photo booth studio. Don't worry—your session can be restored instantly.
            </p>

            {this.state.error && (
              <div className="bg-[#010030]/80 border border-[#2e109d] rounded-xl p-3.5 mb-6 text-left overflow-x-auto max-h-32 text-xs font-mono text-pink-300/90">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                id="btn-reload-studio"
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#F042FF] hover:bg-[#d92ee8] text-white font-bold text-sm tracking-wide rounded-xl shadow-[0_4px_16px_rgba(240,66,255,0.4)] transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                RELOAD STUDIO
              </button>
              <button
                id="btn-home-studio"
                onClick={() => { window.location.href = "/"; }}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-[#160078] hover:bg-[#20009c] text-white font-bold text-sm tracking-wide rounded-xl border border-[#2e109d] transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                HOME
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

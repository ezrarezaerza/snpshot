import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Studio runtime caught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#010030] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full p-6 rounded-2xl border border-[#7226FF]/50 bg-[#08003a] shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F042FF]/20 border border-[#F042FF]/40 flex items-center justify-center text-[#F042FF] text-xl font-bold font-mono">
              !
            </div>
            <h2 className="text-xl font-bold font-mono tracking-wider text-[#FFE5F1]">
              SESSION RECOVERY
            </h2>
            <p className="text-xs text-purple-200/80 leading-relaxed font-mono">
              A studio rendering hiccup was caught. You can return to the studio home to restart your session smoothly.
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7226FF] to-[#F042FF] text-white font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-[0_0_20px_rgba(240,66,255,0.4)]"
            >
              Restart Session
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

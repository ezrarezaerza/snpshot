import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, ArrowLeft, ShieldCheck, AlertCircle, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("admin@snpshot.studio");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Check if already authenticated
  useEffect(() => {
    const existingToken = localStorage.getItem("snpshot_admin_token");
    if (existingToken) {
      fetch("/api/admin/auth/verify", {
        headers: { Authorization: `Bearer ${existingToken}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            navigate("/admin", { replace: true });
          }
        })
        .catch(() => {
          localStorage.removeItem("snpshot_admin_token");
        });
    }
  }, [navigate]);

  const handleAutofill = () => {
    setEmail("admin@snpshot.studio");
    setPassword("admin123");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid administrator credentials. Please check your email and password.");
      }

      // Store authenticated session
      localStorage.setItem("snpshot_admin_token", data.token);
      localStorage.setItem("snpshot_admin_user", JSON.stringify(data.user));

      setSuccessMessage("Authentication verified. Launching Studio OS...");
      
      setTimeout(() => {
        const destination = location.state?.from || "/admin";
        navigate(destination, { replace: true });
      }, 600);
    } catch (err) {
      setError(err.message || "Connection failed. Please verify server status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#010030] text-white flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#7226FF]/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#F042FF]/15 blur-[150px] pointer-events-none" />
      
      {/* Geometric Frame Grid Accents */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      {/* Top Bar Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2.5 text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-[#F042FF]" />
          <span>Back to Public Studio</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
            Postgres // Edge Live
          </span>
        </div>
      </header>

      {/* Main Authentication Box */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-md bg-[#0e0048] border border-[#2e109d] rounded-3xl p-8 sm:p-10 shadow-[0_24px_80px_rgba(1,0,48,0.85)] relative overflow-hidden">
          
          {/* Subtle Top Accent Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#7226FF] via-[#F042FF] to-[#7226FF]" />

          {/* Logo & Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7226FF] to-[#F042FF] text-white shadow-[0_8px_24px_rgba(114,38,255,0.45)] mb-2">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#F042FF] font-mono block mb-1">
                STUDIO OS // ACCESS CONTROL
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase text-white leading-none">
                ADMIN CONSOLE
              </h1>
            </div>
            <p className="text-xs text-white/60 font-medium">
              Secure authentication gateway for SNPSHOT Studio operations and asset persistence.
            </p>
          </div>

          {/* Quick Credential Helper Pill */}
          <div 
            onClick={handleAutofill}
            className="mb-6 bg-[#010030]/80 border border-[#2e109d] hover:border-[#7226FF] rounded-2xl p-3.5 cursor-pointer transition-all flex items-center justify-between group"
            title="Click to populate required credentials"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-[#7226FF]/20 flex items-center justify-center text-[#F042FF] shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-mono font-bold text-white/50">Studio Access Key</div>
                <div className="text-xs font-mono font-semibold text-white/90">admin@snpshot.studio : admin123</div>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-[#F042FF] group-hover:underline font-mono">
              Auto-fill
            </span>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3.5 flex items-start gap-3 text-rose-200 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {/* Success Notice */}
          {successMessage && (
            <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 flex items-start gap-3 text-emerald-200 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{successMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80 uppercase tracking-wider block">
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@snpshot.studio"
                  className="w-full bg-[#010030] border border-[#2e109d] focus:border-[#F042FF] focus:ring-2 focus:ring-[#7226FF]/30 text-white text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-all placeholder:text-white/20 font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider block">
                  Password
                </label>
                <span className="text-[10px] text-white/40 font-mono">300 DPI Session</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#010030] border border-[#2e109d] focus:border-[#F042FF] focus:ring-2 focus:ring-[#7226FF]/30 text-white text-sm rounded-xl pl-10 pr-11 py-3 outline-none transition-all placeholder:text-white/20 font-mono tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/40 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-6 rounded-xl font-black uppercase text-sm tracking-wider text-white bg-gradient-to-r from-[#7226FF] via-[#F042FF] to-[#7226FF] bg-[length:200%_auto] hover:bg-right transition-all duration-500 shadow-[0_8px_30px_rgba(114,38,255,0.4)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-white" />
                  <span>Enter Studio OS Console</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Metadata */}
          <div className="mt-8 pt-6 border-t border-[#2e109d]/60 flex items-center justify-between text-[11px] text-white/40 font-mono">
            <span>Kernel v2.4.0</span>
            <span>Vercel Postgres + Blob</span>
          </div>

        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 py-4 text-center text-[11px] text-white/30 font-mono">
        SNPSHOT Studio Operating System // Protected Administrative Zone
      </footer>
    </div>
  );
};

export default AdminLogin;

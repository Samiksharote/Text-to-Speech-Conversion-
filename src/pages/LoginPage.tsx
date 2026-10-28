import { useState } from "react";
import { LogIn, Mail, Lock, User, Eye, EyeOff, AudioLines } from "lucide-react";

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30">
          <AudioLines className="h-7 w-7 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {mode === "login"
            ? "Sign in to access your AI Voice account."
            : "Join AI Voice to start converting text to speech."}
        </p>
      </div>

      <div className="mb-5 flex rounded-xl border border-slate-800 bg-slate-900/40 p-1">
        <button
          onClick={() => setMode("login")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
            mode === "login"
              ? "bg-cyan-500/15 text-cyan-300"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <LogIn className="h-4 w-4" />
          Sign In
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
            mode === "signup"
              ? "bg-cyan-500/15 text-cyan-300"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <User className="h-4 w-4" />
          Sign Up
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl shadow-black/20 sm:p-6"
      >
        {mode === "signup" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                placeholder="Jane Doe"
              />
            </div>
          </div>
        )}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/40 active:scale-95"
        >
          {mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-500">
        {mode === "login" ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="font-medium text-cyan-400 transition-colors hover:text-cyan-300"
        >
          {mode === "login" ? "Sign up" : "Sign in"}
        </button>
      </p>

      <div className="mt-6 text-center">
        <button
          onClick={() => onNavigate("home")}
          className="text-xs text-slate-500 transition-colors hover:text-slate-300"
        >
          ← Back to converter
        </button>
      </div>
    </div>
  );
}

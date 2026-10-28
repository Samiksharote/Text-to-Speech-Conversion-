import { useState } from "react";
import { Mail, MessageSquare, Send, MapPin, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30">
          <MessageSquare className="h-7 w-7 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Get in Touch</h1>
        <p className="mt-3 text-base text-slate-400">
          Have a question, suggestion, or need help with setup? We'd love to hear from you.
        </p>
      </div>

      {submitted ? (
        <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-8 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-400" />
          <h2 className="text-lg font-semibold text-white">Message Sent!</h2>
          <p className="mt-2 text-sm text-slate-400">
            Thanks for reaching out, {form.name || "there"}. We'll get back to you soon.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({ name: "", email: "", message: "" });
            }}
            className="mt-5 rounded-lg border border-slate-700 bg-slate-800/60 px-5 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700/60"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl shadow-black/20 sm:p-6"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Your Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Email Address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Message</label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full resize-y rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              placeholder="Tell us what's on your mind..."
            />
          </div>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/40 active:scale-95"
          >
            <Send className="h-4 w-4" />
            Send Message
          </button>
        </form>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <Mail className="h-5 w-5 text-cyan-400" />
          <div>
            <p className="text-xs font-medium text-slate-300">Email</p>
            <p className="text-xs text-slate-500">support@aivoice.app</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <MapPin className="h-5 w-5 text-cyan-400" />
          <div>
            <p className="text-xs font-medium text-slate-300">Location</p>
            <p className="text-xs text-slate-500">Runs entirely on your device</p>
          </div>
        </div>
      </div>
    </div>
  );
}

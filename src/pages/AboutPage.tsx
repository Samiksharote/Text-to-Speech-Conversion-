import { Mic2, AudioLines, Heart } from "lucide-react";

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export default function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30">
          <AudioLines className="h-7 w-7 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">About AI Voice</h1>
        <p className="mt-3 text-base text-slate-400">
          A browser-based text-to-speech app that uses the voices available on your device. No paid
          APIs or subscriptions.
        </p>
      </div>

      <div className="mb-10">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition-all hover:border-slate-700">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
            <Mic2 className="h-5 w-5" />
          </div>
          <h3 className="mb-1.5 text-sm font-semibold text-white">Browser Speech</h3>
          <p className="text-sm leading-relaxed text-slate-400">
            Speaks your text with the names and languages exposed by your browser. Choose a voice,
            adjust rate, pitch, and volume, then play, pause, resume, or stop.
          </p>
        </div>
      </div>

      {/* Voice quality note */}
      <div className="mb-10 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
        <div className="mb-2 flex items-center gap-2.5">
          <Mic2 className="h-5 w-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-white">About Voice Quality</h2>
        </div>
        <div className="space-y-3 text-sm text-slate-400">
          <p>
            <strong className="text-slate-200">Available voices</strong> are supplied by your
            browser and operating system. The app displays their actual names and language codes;
            the available choices vary by device and browser.
          </p>
          <p>
            <strong className="text-slate-200">Long text</strong> is split into ordered chunks for
            playback. You can stop speech at any time.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-sm text-slate-500">
        <span>Built with</span>
        <Heart className="h-3.5 w-3.5 text-cyan-400" fill="currentColor" />
        <span>using the Web Speech API</span>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => onNavigate("home")}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/40 active:scale-95"
        >
          Try the Converter
        </button>
      </div>
    </div>
  );
}

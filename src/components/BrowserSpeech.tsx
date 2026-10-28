import { useEffect, useMemo, useState } from "react";
import {
  Play,
  Pause,
  Square,
  Volume2,
  Gauge,
  Music2,
  Mic,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useBrowserSpeech } from "@/hooks/useBrowserSpeech";

interface BrowserSpeechProps {
  text: string;
}

function Slider({
  label,
  icon,
  value,
  min,
  max,
  step,
  onChange,
  suffix,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-300">
          <span className="text-cyan-400">{icon}</span>
          {label}
        </label>
        <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-mono font-semibold text-cyan-300">
          {value.toFixed(2)}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider-cyan h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700"
        style={{
          background: `linear-gradient(to right, rgb(34 211 238) 0%, rgb(59 130 246) ${pct}%, rgb(51 65 85) ${pct}%, rgb(51 65 85) 100%)`,
        }}
      />
    </div>
  );
}

export default function BrowserSpeech({ text }: BrowserSpeechProps) {
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [langFilter, setLangFilter] = useState<string>("all");

  const synthVoice = useMemo<SpeechSynthesisVoice | null>(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
    const list = window.speechSynthesis.getVoices();
    if (list.length === 0) return null;
    return list.find((v) => v.voiceURI === selectedVoiceURI) || null;
  }, [selectedVoiceURI]);

  const { supported, voices, voicesLoaded, status, error, progress, speak, pause, resume, stop } =
    useBrowserSpeech({ voice: synthVoice, rate, pitch, volume });

  useEffect(() => {
    if (voices.length > 0 && !selectedVoiceURI) {
      const def = voices.find((v) => v.default) || voices[0];
      setSelectedVoiceURI(def.id);
    }
  }, [voices, selectedVoiceURI]);

  const langOptions = useMemo(() => {
    const set = new Set<string>();
    voices.forEach((v) => set.add(v.lang));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [voices]);

  const filteredVoices = useMemo(() => {
    if (langFilter === "all") return voices;
    return voices.filter((v) => v.lang.toLowerCase().startsWith(langFilter.toLowerCase()));
  }, [voices, langFilter]);

  const selectedBrowserVoice = useMemo(
    () => voices.find((v) => v.id === selectedVoiceURI),
    [voices, selectedVoiceURI]
  );

  const handleSpeak = () => {
    if (!text.trim()) return;
    speak(text);
  };

  const isSpeaking = status === "speaking";
  const isPaused = status === "paused";

  if (!supported) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-200">
        <div className="flex items-center gap-2 font-semibold">
          <AlertTriangle className="h-5 w-5" />
          Browser Not Supported
        </div>
        <p className="mt-2">
          Your browser does not support speech synthesis. Try a current version of Chrome, Edge, or
          Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info note */}
      <div className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 py-2.5 text-xs text-cyan-200/80">
        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-cyan-400" />
        <span>
          Speech plays through your browser's available voices.
        </span>
      </div>

      {/* Voice quality tip */}
      <div className="rounded-xl bg-slate-800/40 px-3 py-2.5 text-xs text-slate-400">
        <span className="font-medium text-slate-300">Tip for natural voices:</span> Select a voice
        with <span className="text-cyan-300">"Google"</span> or <span className="text-cyan-300">"Natural"</span> in
        the name for the most human-like sound. Lower the rate slightly (0.9) for a more relaxed
        delivery.
      </div>

      {/* Voice selection */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300">
          <Mic className="h-4 w-4 text-cyan-400" />
          Voice
        </label>

        {!voicesLoaded ? (
          <div className="flex items-center gap-2 rounded-lg bg-slate-800/40 px-3 py-2.5 text-xs text-slate-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
            Loading available voices...
          </div>
        ) : voices.length === 0 ? (
          <div
            role="status"
            className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-200"
          >
            No speech voices are available in this browser. Install or enable a system voice, then
            reload the page.
          </div>
        ) : (
          <>
            <label htmlFor="speech-language" className="sr-only">
              Filter voices by language
            </label>
            <select
              id="speech-language"
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
              className="mb-2 w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 text-sm text-slate-200 transition-colors focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
            >
              <option value="all">All languages</option>
              {langOptions.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <label htmlFor="speech-voice" className="sr-only">
              Voice
            </label>
            <select
              id="speech-voice"
              value={selectedVoiceURI}
              onChange={(e) => setSelectedVoiceURI(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 text-sm text-slate-200 transition-colors focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
            >
              {filteredVoices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} — {v.lang}
                </option>
              ))}
            </select>
            {selectedBrowserVoice && (
              <p className="mt-1.5 text-xs text-slate-400">
                Selected: <span className="font-medium text-cyan-300">{selectedBrowserVoice.name}</span>
                {" — "}
                <span>{selectedBrowserVoice.lang}</span>
              </p>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Slider
          label="Rate"
          icon={<Gauge className="h-3.5 w-3.5" />}
          value={rate}
          min={0.5}
          max={2}
          step={0.05}
          onChange={setRate}
          suffix="x"
        />
        <Slider
          label="Pitch"
          icon={<Music2 className="h-3.5 w-3.5" />}
          value={pitch}
          min={0}
          max={2}
          step={0.05}
          onChange={setPitch}
        />
        <Slider
          label="Volume"
          icon={<Volume2 className="h-3.5 w-3.5" />}
          value={volume}
          min={0}
          max={1}
          step={0.05}
          onChange={setVolume}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Speaking progress with waveform */}
      {progress.total > 0 && status !== "idle" && (
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              {isSpeaking && (
                <>
                  <span className="flex items-end gap-0.5 h-5">
                    <span className="wave-bar w-1 rounded-full bg-cyan-400" style={{ animationDelay: "0ms" }} />
                    <span className="wave-bar w-1 rounded-full bg-cyan-400" style={{ animationDelay: "150ms" }} />
                    <span className="wave-bar w-1 rounded-full bg-cyan-400" style={{ animationDelay: "300ms" }} />
                    <span className="wave-bar w-1 rounded-full bg-cyan-400" style={{ animationDelay: "450ms" }} />
                  </span>
                  Speaking...
                </>
              )}
              {isPaused && "Paused"}
            </span>
            <span>
              Part {progress.done} of {progress.total}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {!isSpeaking && !isPaused && (
          <button
            onClick={handleSpeak}
            disabled={!text.trim() || !voicesLoaded || voices.length === 0}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/35 active:scale-95 disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            Speak Text
          </button>
        )}
        {isSpeaking && (
          <button
            onClick={pause}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-5 py-2.5 text-sm font-medium text-slate-200 transition-all hover:bg-slate-700/60 active:scale-95"
          >
            <Pause className="h-4 w-4" />
            Pause
          </button>
        )}
        {isPaused && (
          <button
            onClick={resume}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/35 active:scale-95"
          >
            <Play className="h-4 w-4" />
            Resume
          </button>
        )}
        {(isSpeaking || isPaused) && (
          <button
            onClick={stop}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-300 transition-all hover:bg-red-500/20 active:scale-95"
          >
            <Square className="h-4 w-4" />
            Stop
          </button>
        )}
      </div>
    </div>
  );
}

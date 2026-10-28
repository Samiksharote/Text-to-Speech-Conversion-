import { useState } from "react";
import { Sparkles, Type, Eraser } from "lucide-react";
import BrowserSpeech from "./BrowserSpeech";

export default function Converter() {
  const [text, setText] = useState("");

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Hero heading */}
      <div className="mb-6 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300">
          <Sparkles className="h-3.5 w-3.5" />
          Browser Speech Synthesis
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Transform Text into
          <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Spoken Audio
          </span>
        </h1>
        <p className="mt-3 text-sm text-slate-400 sm:text-base">
          Type text, choose an available browser voice, and listen instantly.
        </p>
      </div>

      {/* Text input */}
      <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-1.5 shadow-2xl shadow-black/30">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here. Long text is automatically split into chunks and processed in order..."
          className="h-48 w-full resize-y rounded-xl bg-transparent p-4 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:outline-none sm:h-56"
        />
        <div className="flex items-center justify-between px-3 pb-2 pt-1">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Type className="h-3 w-3" />
              {wordCount.toLocaleString()} words
            </span>
            <span>{charCount.toLocaleString()} characters</span>
          </div>
          {text && (
            <button
              onClick={() => setText("")}
              className="flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-red-400"
            >
              <Eraser className="h-3 w-3" />
              Clear Text
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-xl shadow-black/20 sm:p-5">
        <BrowserSpeech text={text} />
      </div>

      {/* Text preview */}
      {text.trim() && (
        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyan-400/70">
            Text Preview
          </p>
          <p className="max-h-24 overflow-y-auto text-sm leading-relaxed text-slate-400">
            {text}
          </p>
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import type { BrowserVoice, ChunkProgress } from "@/types";

// Larger chunks produce more natural speech — the browser handles prosody
// better when it has a full sentence to work with. We split on sentence
// boundaries and cap at a generous length.
const MAX_CHUNK_CHARS = 280;

/**
 * Split text into ordered, sentence-based chunks for speech playback.
 */
export function splitText(text: string, maxChars = MAX_CHUNK_CHARS): string[] {
  const clean = text.trim();
  if (!clean) return [];

  // First split into sentences on . ! ? followed by whitespace
  const sentenceRegex = /[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g;
  const sentences = clean.match(sentenceRegex);
  if (!sentences) return [clean];

  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    // If a single sentence is longer than maxChars, split it on commas/spaces
    if (trimmed.length > maxChars) {
      // Flush current chunk first
      if (current) {
        chunks.push(current.trim());
        current = "";
      }
      // Split the long sentence
      let rest = trimmed;
      while (rest.length > maxChars) {
        let cut = maxChars;
        const comma = rest.lastIndexOf(",", maxChars);
        const space = rest.lastIndexOf(" ", maxChars);
        if (comma > maxChars * 0.4) cut = comma + 1;
        else if (space > maxChars * 0.3) cut = space;
        chunks.push(rest.slice(0, cut).trim());
        rest = rest.slice(cut).trim();
      }
      if (rest) {
        if (current) current += " " + rest;
        else current = rest;
      }
      continue;
    }

    // Combine sentences into chunks up to maxChars
    if ((current + " " + trimmed).length <= maxChars) {
      current = current ? current + " " + trimmed : trimmed;
    } else {
      if (current) chunks.push(current.trim());
      current = trimmed;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

interface UseBrowserSpeechOptions {
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  volume: number;
}

export function useBrowserSpeech({ voice, rate, pitch, volume }: UseBrowserSpeechOptions) {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [voices, setVoices] = useState<BrowserVoice[]>([]);
  const [voicesLoaded, setVoicesLoaded] = useState(!supported);
  const [status, setStatus] = useState<"idle" | "speaking" | "paused">("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ChunkProgress>({ done: 0, total: 0 });
  const queueRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const playbackIdRef = useRef(0);

  // Load voices and listen for changes
  useEffect(() => {
    if (!supported) return;
    const load = () => {
      const list = window.speechSynthesis.getVoices();
      if (list.length > 0) {
        setVoicesLoaded(true);
        setVoices(
          list.map((v) => ({
            id: v.voiceURI,
            name: v.name,
            lang: v.lang,
            localService: v.localService,
            default: v.default,
          }))
        );
      }
    };
    load();
    const onVoicesChanged = () => {
      load();
      setVoicesLoaded(true);
    };
    window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
    const timer = window.setInterval(load, 1000);
    const stopTimer = window.setTimeout(() => {
      window.clearInterval(timer);
      setVoicesLoaded(true);
    }, 6000);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
      window.clearInterval(timer);
      window.clearTimeout(stopTimer);
    };
  }, [supported]);

  const speakChunk = useCallback(
    (text: string, onEnd: () => void, onError: (message: string) => void) => {
      if (!supported) {
        onError("Your browser does not support speech synthesis.");
        return;
      }
      const utter = new SpeechSynthesisUtterance(text);
      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      }
      // Default rate of 1.0 can feel rushed; the user controls it via the slider.
      utter.rate = rate;
      utter.pitch = pitch;
      utter.volume = volume;
      utter.onend = onEnd;
      utter.onerror = (e) => {
        if (e.error !== "interrupted" && e.error !== "canceled") onError(`Speech error: ${e.error}`);
      };
      window.speechSynthesis.speak(utter);
    },
    [supported, voice, rate, pitch, volume]
  );

  const playNext = useCallback(() => {
    const playbackId = playbackIdRef.current;
    const queue = queueRef.current;
    const idx = indexRef.current;
    if (idx >= queue.length) {
      setStatus("idle");
      setProgress({ done: queue.length, total: queue.length });
      return;
    }
    setProgress({ done: idx, total: queue.length });
    setStatus("speaking");
    speakChunk(queue[idx], () => {
      if (playbackId !== playbackIdRef.current) return;
      indexRef.current += 1;
      // Brief pause between chunks for natural rhythm
      window.setTimeout(() => {
        if (playbackId === playbackIdRef.current) playNext();
      }, 120);
    }, (message) => {
      if (playbackId !== playbackIdRef.current) return;
      setError(message);
      queueRef.current = [];
      indexRef.current = 0;
      setStatus("idle");
    });
  }, [speakChunk]);

  const speak = useCallback(
    (text: string) => {
      if (!supported) {
        setError("Your browser does not support the Web Speech API.");
        return;
      }
      setError(null);
      playbackIdRef.current += 1;
      queueRef.current = [];
      indexRef.current = 0;
      setStatus("idle");
      setProgress({ done: 0, total: 0 });
      window.speechSynthesis.cancel();
      const chunks = splitText(text);
      if (chunks.length === 0) {
        setError("Please enter some text to speak.");
        return;
      }
      queueRef.current = chunks;
      indexRef.current = 0;
      setProgress({ done: 0, total: chunks.length });
      playNext();
    },
    [supported, playNext]
  );

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setStatus("paused");
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setStatus("speaking");
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    playbackIdRef.current += 1;
    queueRef.current = [];
    indexRef.current = 0;
    window.speechSynthesis.cancel();
    setStatus("idle");
    setProgress({ done: 0, total: 0 });
  }, [supported]);

  useEffect(() => {
    return () => {
      if (supported) {
        playbackIdRef.current += 1;
        window.speechSynthesis.cancel();
      }
    };
  }, [supported]);

  return { supported, voices, voicesLoaded, status, error, progress, speak, pause, resume, stop };
}

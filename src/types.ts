export type Gender = "male" | "female" | "unknown";

export interface BrowserVoice {
  id: string;
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

export interface ChunkProgress {
  done: number;
  total: number;
}

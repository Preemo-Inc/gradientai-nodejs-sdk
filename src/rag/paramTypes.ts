export type AddFilesParams = {
  filepaths: Array<string>;
};

export const CHUNKER_TYPES = [
  "fileChunker",
  "meaningBasedChunker",
  "normalChunker",
  "sentenceWithContextChunker",
] as const;
export type ChunkerType = (typeof CHUNKER_TYPES)[number];

export type MeaningBasedChunker = {
  chunkerType: "meaningBasedChunker";
  overlap?: number;
  sentenceGroupLength?: number;
  similiarityPercentThreshold?: number;
  size?: number;
};

export type SentenceWithContextChunker = {
  chunkerType: "sentenceWithContextChunker";
  contextSentences?: number;
  overlap?: number;
  size?: number;
};

export type FileChunker = {
  chunkerType: "fileChunker";
};

export type NormalChunker = {
  chunkerType: "normalChunker";
  overlap?: number;
  size?: number;
};

export type RagChunker =
  | FileChunker
  | MeaningBasedChunker
  | NormalChunker
  | SentenceWithContextChunker;

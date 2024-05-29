export type AddFilesParams = {
  filepaths: Array<string>;
};

export type SimpleNodeParser = {
  chunkSize?: number;
  chunkOverlap?: number;
  parserType: "simpleNodeParser";
};

export type SentenceWindowNodeParser = {
  chunkSize?: number;
  chunkOverlap?: number;
  parserType: "sentenceWindowNodeParser";
  windowSize?: number;
};

export type RagParser = SentenceWindowNodeParser | SimpleNodeParser;

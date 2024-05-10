export type AddFilesParams = {
  filepaths: Array<string>;
};

export type SimpleNodeParser = {
  chunkSize?: number;
  chunkOverlap?: number;
  parserType: "simpleNodeParser";
};

export type RagParser = SimpleNodeParser;

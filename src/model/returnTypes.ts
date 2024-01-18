export type CompleteResponse = {
  finishReason: string;
  generatedOutput: string;
};

export type FineTuneResponse = {
  numberOfTrainableTokens: number;
  sumLoss: number;
};

export type GenerateEmbeddingsResponse = {
  embeddings: Array<{
    embedding: Array<number>;
    index: number;
  }>;
};

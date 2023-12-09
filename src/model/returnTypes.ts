export type CompleteResponse = {
  finishReason: string;
  generatedOutput: string;
};

export type FineTuneResponse = {
  numberOfTrainableTokens: number;
  sumLoss: number;
};

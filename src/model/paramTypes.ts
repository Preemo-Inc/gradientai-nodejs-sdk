export type FineTuneStructuredSampleInput = {
  parseSpecialTokens?: boolean;
  trainable?: boolean;
  value: string;
};

export type FineTuneSampleInputs =
  | string
  | Array<FineTuneStructuredSampleInput>;

export type FineTuneSample = {
  fineTuningParameters?: {
    multiplier?: number;
  };
  inputs: FineTuneSampleInputs;
};

export type EmbeddingsModelSlug = "bge-large";

export type CompleteGuidanceType = "choice";

export type CompleteGuidance = {
  type: CompleteGuidanceType;
  value: Array<string>;
};

export type CompleteRAG = {
  collectionId: string;
};

export type CompleteParams = {
  autoTemplate?: boolean;
  guidance?: CompleteGuidance;
  maxGeneratedTokenCount?: number;
  rag?: CompleteRAG;
  query: string;
  temperature?: number;
  topK?: number;
  topP?: number;
};

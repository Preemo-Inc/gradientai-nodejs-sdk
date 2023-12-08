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

export type CompleteGuidanceType = "choice";

export type CompleteGuidance = {
  type: CompleteGuidanceType;
  value: Array<string>;
};

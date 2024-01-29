import { BaseModelCapability } from "./model/baseModel";

export type CapabilityFilterOption = BaseModelCapability | "any";

export type AnalyzeSentimentParams = {
  document: string;
  examples?: Array<{
    document: string;
    sentiment: Sentiment;
  }>;
};

export type Sentiment = "positive" | "negative" | "neutral";

export type ExtractParams = {
  document: string;
  schema: Record<
    string,
    {
      required?: boolean;
      type: "string" | "boolean" | "number";
    }
  >;
};
export type ExtractResult = {
  entity: Record<string, string | number | boolean>;
};

export type SummarizeParams = {
  document: string;
  examples?: Array<{
    document: string;
    summary: string;
  }>;
  length?: "short" | "medium" | "long";
};

export type PersonalizeParams = {
  document: string;
  audienceDescription: string;
};

export type AnswerParams = {
  question: string;
  source:
    | {
        collectionId: string;
        type: "rag";
      }
    | {
        type: "document";
        value: string;
      };
};

export type AnswerResult = {
  answer: string;
  ragContext?: {
    documents: Array<{
      content: string;
      fileName: string;
    }>;
  };
};

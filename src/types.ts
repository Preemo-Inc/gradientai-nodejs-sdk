import { BaseModelCapability } from "./model/baseModel";
import { EmbeddingsModelSlug } from "./model/paramTypes";

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

export type ExtractPdfParams = {
  filepath: string;
};

export type ExtractPdfResult = {
  pages: Array<{
    images: Array<{
      data: string;
      format: "base64-png";
    }>;
    pageNumber: number;
    tables: Array<{
      name: string;
      tableRows: Array<{
        cells: Array<{
          cellValue: string;
          colSpan: number | null;
          rowSpan: number | null;
        }>;
        type: "table_data_row" | "table_header";
      }>;
    }>;
    text: string;
    textBlocks: Array<{
      kind: "footer" | "header" | "section_title" | "text" | "title";
      texts: Array<string>;
    }>;
  }>;
  text: string;
  title: string | null;
};

export type TranscribeAudioParams = {
  filepath: string;
};

export type TranscribeAudioResult = {
  text: string;
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

export type GetRagCollectionParams = {
  id: string;
};

export type CreateRagCollectionParams = {
  filepaths?: Array<string>;
  name: string;
  slug: EmbeddingsModelSlug;
};

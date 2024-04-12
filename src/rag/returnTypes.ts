import { RagFileIngestionStatus } from "../types";

export type RagFile = {
  id: string;
  name: string;
  status: RagFileIngestionStatus;
};

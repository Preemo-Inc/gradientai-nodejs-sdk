import { ModelsApi } from "../api";
import { CompleteGuidance } from "./paramTypes";
import { CompleteResponse } from "./returnTypes";

export abstract class Model {
  protected readonly apiInstance: ModelsApi;
  public readonly id: string;
  public readonly workspaceId: string;

  protected constructor({
    apiInstance,
    id,
    workspaceId,
  }: {
    apiInstance: ModelsApi;
    id: string;
    workspaceId: string;
  }) {
    this.apiInstance = apiInstance;
    this.id = id;
    this.workspaceId = workspaceId;
  }

  public readonly complete = async ({
    guidance,
    maxGeneratedTokenCount,
    query,
    temperature,
    topK,
    topP,
  }: {
    guidance?: CompleteGuidance;
    maxGeneratedTokenCount?: number;
    query: string;
    temperature?: number;
    topK?: number;
    topP?: number;
  }): Promise<CompleteResponse> => {
    const {
      data: { finishReason, generatedOutput },
    } = await this.apiInstance.completeModel({
      id: this.id,
      xGradientWorkspaceId: this.workspaceId,
      completeModelBodyParams: {
        guidance,
        query,
        maxGeneratedTokenCount,
        temperature,
        topK,
        topP,
      },
    });

    return { finishReason, generatedOutput };
  };
}

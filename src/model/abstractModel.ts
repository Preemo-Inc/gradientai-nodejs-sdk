import { ModelsApi } from "../api";
import { CompleteParams } from "./paramTypes";
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
    autoTemplate,
    guidance,
    maxGeneratedTokenCount,
    query,
    rag,
    temperature,
    topK,
    topP,
  }: CompleteParams): Promise<CompleteResponse> => {
    const {
      data: { finishReason, generatedOutput },
    } = await this.apiInstance.completeModel({
      id: this.id,
      xGradientWorkspaceId: this.workspaceId,
      completeModelBodyParams: {
        autoTemplate,
        guidance,
        query,
        rag,
        maxGeneratedTokenCount,
        temperature,
        topK,
        topP,
      },
    });

    return { finishReason, generatedOutput };
  };
}

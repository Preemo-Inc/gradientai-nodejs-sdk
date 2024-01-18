import { EmbeddingsApi } from "../api";
import { EmbeddingsModelSlug } from "../model/paramTypes";
import { GenerateEmbeddingsResponse } from "../model/returnTypes";

export class EmbeddingsModel {
  private readonly apiInstance: EmbeddingsApi;

  public readonly slug: EmbeddingsModelSlug;
  public readonly workspaceId: string;

  public constructor({
    apiInstance,
    slug,
    workspaceId,
  }: {
    apiInstance: EmbeddingsApi;
    slug: EmbeddingsModelSlug;
    workspaceId: string;
  }) {
    this.apiInstance = apiInstance;
    this.slug = slug;
    this.workspaceId = workspaceId;
  }

  public readonly generateEmbeddings = async ({
    inputs,
  }: {
    inputs: Array<{ input: string }>;
  }): Promise<GenerateEmbeddingsResponse> => {
    const response = await this.apiInstance.generateEmbedding({
      xGradientWorkspaceId: this.workspaceId,
      generateEmbeddingBodyParams: { inputs },
      slug: this.slug,
    });

    return response.data;
  };
}

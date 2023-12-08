import {
  EmbeddingsApi,
  GenerateEmbeddingSlugEnum,
  GenerateEmbeddingSuccess,
} from "../api";

export class EmbeddingsModel {
  private readonly apiInstance: EmbeddingsApi;

  public readonly slug: GenerateEmbeddingSlugEnum;
  public readonly workspaceId: string;

  public constructor({
    apiInstance,
    slug,
    workspaceId,
  }: {
    apiInstance: EmbeddingsApi;
    slug: GenerateEmbeddingSlugEnum;
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
  }): Promise<GenerateEmbeddingSuccess> => {
    const response = await this.apiInstance.generateEmbedding({
      xGradientWorkspaceId: this.workspaceId,
      generateEmbeddingBodyParams: { inputs },
      slug: this.slug,
    });

    return response.data;
  };
}

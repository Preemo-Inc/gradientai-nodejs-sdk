import {
  Configuration,
  EmbeddingsApi,
  GenerateEmbeddingSlugEnum,
  ListEmbeddingsSuccess,
  ListModelsSuccessModelsInner,
  ModelsApi,
} from "./api";
import { EmbeddingsModel } from "./embedding/embeddingsModel";
import { getOptionalEnvValue, getRequiredEnvValue } from "./helpers/env";
import { expectNever } from "./helpers/typeChecking";
import { Model } from "./model/abstractModel";
import { BaseModel } from "./model/baseModel";
import { ModelAdapter } from "./model/modelAdapter";

export class Gradient {
  private readonly modelsApi: ModelsApi;
  private readonly embeddingsApi: EmbeddingsApi;

  public readonly workspaceId: string;

  private readonly deserializeModelInstance = (
    apiModel: ListModelsSuccessModelsInner
  ): Model => {
    switch (apiModel.type) {
      case "baseModel":
        return new BaseModel({
          apiInstance: this.modelsApi,
          id: apiModel.id,
          slug: apiModel.slug,
          workspaceId: this.workspaceId,
        });
      case "modelAdapter":
        return new ModelAdapter({
          apiInstance: this.modelsApi,
          baseModelId: apiModel.baseModelId,
          id: apiModel.id,
          name: apiModel.name,
          workspaceId: this.workspaceId,
        });
      default:
        return expectNever(apiModel);
    }
  };

  private readonly deserializeEmbeddingsModel = (
    apiModel: ListEmbeddingsSuccess["embeddingsModels"][number]
  ): EmbeddingsModel => {
    return new EmbeddingsModel({
      apiInstance: this.embeddingsApi,
      slug: apiModel.slug,
      workspaceId: this.workspaceId,
    });
  };

  public constructor({
    accessToken = getRequiredEnvValue("GRADIENT_ACCESS_TOKEN"),
    host = getOptionalEnvValue("GRADIENT_API_URL"),
    workspaceId = getRequiredEnvValue("GRADIENT_WORKSPACE_ID"),
  }: {
    accessToken?: string;
    host?: string;
    workspaceId?: string;
  }) {
    const configuration = new Configuration({
      accessToken,
      basePath: host,
    });

    this.modelsApi = new ModelsApi(configuration);
    this.embeddingsApi = new EmbeddingsApi(configuration);
    this.workspaceId = workspaceId;
  }

  public readonly getBaseModel = async ({
    baseModelSlug,
  }: {
    baseModelSlug: string;
  }): Promise<BaseModel> => {
    const models = await this.listModels({ onlyBase: true });
    const model = models.find(({ slug }) => slug === baseModelSlug);
    if (!model) {
      throw new Error(`Base model not found for slug ${baseModelSlug}`);
    }
    return model;
  };

  public readonly getModelAdapter = async ({
    modelAdapterId,
  }: {
    modelAdapterId: string;
  }): Promise<ModelAdapter> => {
    const {
      data: { baseModelId, id, name },
    } = await this.modelsApi.getModel({
      id: modelAdapterId,
      xGradientWorkspaceId: this.workspaceId,
    });

    return new ModelAdapter({
      apiInstance: this.modelsApi,
      baseModelId,
      id,
      name,
      workspaceId: this.workspaceId,
    });
  };

  public readonly listModels = async <T extends boolean>({
    onlyBase,
  }: {
    onlyBase: T;
  }): Promise<Array<T extends true ? BaseModel : Model>> => {
    const {
      data: { models },
    } = await this.modelsApi.listModels({
      onlyBase,
      xGradientWorkspaceId: this.workspaceId,
    });

    return models
      .map(this.deserializeModelInstance)
      .filter(
        (model): model is T extends true ? BaseModel : Model =>
          model instanceof (onlyBase ? BaseModel : Model)
      );
  };

  public readonly getEmbeddingsModel = async ({
    slug,
  }: {
    slug: GenerateEmbeddingSlugEnum;
  }): Promise<EmbeddingsModel> => {
    const embeddingsModels = await this.listEmbeddingsModels({});
    const embeddingsModel = embeddingsModels.find((o) => o.slug === slug);
    if (!embeddingsModel) {
      throw new Error(`Embeddings model not found for slug ${slug}`);
    }

    return embeddingsModel;
  };

  public readonly listEmbeddingsModels = async ({}: {}): Promise<
    Array<EmbeddingsModel>
  > => {
    const {
      data: { embeddingsModels },
    } = await this.embeddingsApi.listEmbeddings({
      xGradientWorkspaceId: this.workspaceId,
    });

    return embeddingsModels.map(this.deserializeEmbeddingsModel);
  };
}

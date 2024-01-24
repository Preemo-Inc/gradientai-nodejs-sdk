import {
  BlocksApi,
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
import {
  AnalyzeSentimentParams,
  AnswerParams,
  AnswerResult,
  CapabilityFilterOption,
  ExtractParams,
  ExtractResult,
  PersonalizeParams,
  Sentiment,
  SummarizeParams,
} from "./types";

export class Gradient {
  private readonly modelsApi: ModelsApi;
  private readonly embeddingsApi: EmbeddingsApi;
  private readonly blocksApi: BlocksApi;

  public readonly workspaceId: string;

  private readonly deserializeModelInstance = (
    apiModel: ListModelsSuccessModelsInner
  ): Model => {
    switch (apiModel.type) {
      case "baseModel":
        return new BaseModel({
          apiInstance: this.modelsApi,
          capabilities: apiModel.capabilities,
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
    this.blocksApi = new BlocksApi(configuration);
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
    capability = "any",
    onlyBase,
  }: {
    capability?: CapabilityFilterOption;
    onlyBase: T;
  }): Promise<Array<T extends true ? BaseModel : Model>> => {
    const {
      data: { models },
    } = await this.modelsApi.listModels({
      capability,
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

  public readonly analyzeSentiment = async ({
    document,
    examples,
  }: AnalyzeSentimentParams): Promise<{ sentiment: Sentiment }> => {
    const {
      data: { sentiment },
    } = await this.blocksApi.analyzeSentiment({
      xGradientWorkspaceId: this.workspaceId,
      analyzeSentimentBodyParams: { document, examples },
    });
    return { sentiment };
  };

  public readonly extract = async ({
    document,
    schema,
  }: ExtractParams): Promise<ExtractResult> => {
    const {
      data: { entity },
    } = await this.blocksApi.extractEntity({
      xGradientWorkspaceId: this.workspaceId,
      extractEntityBodyParams: { document, schema },
    });
    return { entity: entity as ExtractResult["entity"] };
  };

  public readonly answer = async ({
    question,
    source,
  }: AnswerParams): Promise<AnswerResult> => {
    const {
      data: { answer, ragContext },
    } = await this.blocksApi.generateAnswer({
      xGradientWorkspaceId: this.workspaceId,
      generateAnswerBodyParams: { question, source },
    });
    return { answer, ragContext };
  };

  public readonly personalize = async ({
    document,
    audienceDescription,
  }: PersonalizeParams): Promise<{ personalizedDocument: string }> => {
    const {
      data: { personalizedDocument },
    } = await this.blocksApi.personalizeDocument({
      xGradientWorkspaceId: this.workspaceId,
      personalizeDocumentBodyParams: { document, audienceDescription },
    });
    return { personalizedDocument };
  };

  public readonly summarize = async ({
    document,
    examples,
    length,
  }: SummarizeParams): Promise<{ summary: string }> => {
    const {
      data: { summary },
    } = await this.blocksApi.summarizeDocument({
      xGradientWorkspaceId: this.workspaceId,
      summarizeDocumentBodyParams: {
        document,
        length,
        examples: examples ?? [],
      },
    });
    return { summary };
  };
}

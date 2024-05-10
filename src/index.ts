import axios from "axios";
import { createReadStream } from "fs";

import { basename } from "path";
import {
  BlocksApi,
  Configuration,
  CreateRagCollectionBodyParams,
  EmbeddingsApi,
  FilesApi,
  GenerateEmbeddingSlugEnum,
  ListEmbeddingsSuccess,
  ListModelsSuccessModelsInner,
  ModelsApi,
  RAGApi,
} from "./api";
import { EmbeddingsModel } from "./embedding/embeddingsModel";
import { FilesApiManager } from "./files/filesApiManager";
import { IFilesApiManager } from "./files/types";
import { getOptionalEnvValue, getRequiredEnvValue } from "./helpers/env";
import { expectNever, isUndefined } from "./helpers/typeChecking";
import { wait } from "./helpers/wait";
import { Model } from "./model/abstractModel";
import { BaseModel } from "./model/baseModel";
import { ModelAdapter } from "./model/modelAdapter";
import { RagCollection } from "./rag/ragCollection";
import {
  AnalyzeSentimentParams,
  AnswerParams,
  AnswerResult,
  CapabilityFilterOption,
  CreateRagCollectionParams,
  ExtractParams,
  ExtractPdfParams,
  ExtractPdfResult,
  ExtractResult,
  GetRagCollectionParams,
  PersonalizeParams,
  Sentiment,
  SummarizeParams,
  TranscribeAudioParams,
  TranscribeAudioResult,
} from "./types";

export class Gradient {
  private readonly blocksApi: BlocksApi;
  private readonly embeddingsApi: EmbeddingsApi;
  private readonly filesApiManager: IFilesApiManager;
  private readonly modelsApi: ModelsApi;
  private readonly ragApi: RAGApi;

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

    const axiosClient = axios.create({
      maxBodyLength: Infinity,
    });

    this.blocksApi = new BlocksApi(configuration, undefined, axiosClient);
    this.embeddingsApi = new EmbeddingsApi(
      configuration,
      undefined,
      axiosClient
    );
    this.filesApiManager = new FilesApiManager({
      filesApi: new FilesApi(configuration, undefined, axiosClient),
      workspaceId,
    });
    this.modelsApi = new ModelsApi(configuration, undefined, axiosClient);
    this.ragApi = new RAGApi(configuration, undefined, axiosClient);

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

  public readonly extractPdf = async ({
    filepath,
  }: ExtractPdfParams): Promise<ExtractPdfResult> => {
    const {
      data: { pages, text, title },
    } = await this.blocksApi.extractPdf({
      xGradientWorkspaceId: this.workspaceId,
      file: createReadStream(filepath) as any,
    });

    return { pages, text, title };
  };

  public readonly transcribeAudio = async ({
    filepath,
  }: TranscribeAudioParams): Promise<TranscribeAudioResult> => {
    const { id: fileId } = await this.filesApiManager.uploadFile({
      filepath,
      type: "audioFile",
    });

    const {
      data: { transcriptionId },
    } = await this.blocksApi.createAudioTranscription({
      createAudioTranscriptionBodyParams: {
        fileId,
      },
      xGradientWorkspaceId: this.workspaceId,
    });

    while (true) {
      const { data } = await this.blocksApi.getAudioTranscription({
        transcriptionId,
        xGradientWorkspaceId: this.workspaceId,
      });

      switch (data.status) {
        case "pending":
        case "pendingCancellation":
        case "running": {
          await wait(1000);
          break;
        }
        case "cancelled":
        case "failed": {
          throw new Error("Unable to get transcription");
        }
        case "succeeded": {
          return { text: data.result.text };
        }
        default: {
          return expectNever(data);
        }
      }
    }
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
        examples: examples,
      },
    });
    return { summary };
  };

  public readonly getRagCollection = async ({
    id,
  }: GetRagCollectionParams): Promise<RagCollection> => {
    const { data: ragCollection } = await this.ragApi.getRagCollection({
      xGradientWorkspaceId: this.workspaceId,
      id,
    });

    return new RagCollection({
      files: ragCollection.files,
      filesApiManager: this.filesApiManager,
      id: ragCollection.id,
      name: ragCollection.name,
      parser: ragCollection.parser,
      ragApi: this.ragApi,
      workspaceId: this.workspaceId,
    });
  };

  /**
   *  Files are not present in the list call. To retrieve the files use `getRagCollection`.
   */
  public readonly listRagCollections = async ({}: {}): Promise<
    Array<Omit<RagCollection, "files">>
  > => {
    const { data } = await this.ragApi.listRagCollections({
      xGradientWorkspaceId: this.workspaceId,
    });

    return data.ragCollections.map(
      ({ id, name, parser }) =>
        new RagCollection({
          files: [],
          filesApiManager: this.filesApiManager,
          id,
          name,
          parser,
          ragApi: this.ragApi,
          workspaceId: this.workspaceId,
        })
    );
  };

  public readonly createRagCollection = async ({
    filepaths,
    name,
    parser,
    slug,
  }: CreateRagCollectionParams): Promise<RagCollection> => {
    let files: CreateRagCollectionBodyParams["files"];
    if (!isUndefined(filepaths)) {
      const uploadedFiles = await this.filesApiManager.uploadFiles({
        filepaths,
        type: "ragUserFile",
      });

      files = uploadedFiles.files.map(({ filepath, id }) => ({
        id,
        name: basename(filepath),
      }));
    }

    let ragParser: CreateRagCollectionBodyParams["parser"];
    if (!isUndefined(parser)) {
      ragParser = {
        chunkSize: parser.chunkSize,
        chunkOverlap: parser.chunkOverlap,
        parserType: "simpleNodeParser",
      };
    }

    const {
      data: { id },
    } = await this.ragApi.createRagCollection({
      createRagCollectionBodyParams: {
        files,
        name,
        parser: ragParser,
        slug,
      },
      xGradientWorkspaceId: this.workspaceId,
    });

    return this.getRagCollection({ id });
  };
}


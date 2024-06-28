import { basename } from "path";
import { RAGApi } from "../api";
import { IFilesApiManager } from "../files/types";
import { AddFilesParams, RagChunker } from "./paramTypes";
import { RagFile } from "./returnTypes";

export class RagCollection {
  private readonly filesApiManager: IFilesApiManager;
  private readonly ragApi: RAGApi;

  public files: Array<RagFile>;
  public readonly id: string;
  public readonly name: string;
  public readonly chunker: Required<RagChunker>;
  public readonly workspaceId: string;

  public constructor(params: {
    files: Array<RagFile>;
    filesApiManager: IFilesApiManager;
    id: string;
    name: string;
    chunker: Required<RagChunker>;
    ragApi: RAGApi;
    workspaceId: string;
  }) {
    this.files = params.files;
    this.filesApiManager = params.filesApiManager;
    this.id = params.id;
    this.name = params.name;
    this.chunker = params.chunker;
    this.ragApi = params.ragApi;
    this.workspaceId = params.workspaceId;
  }

  public readonly addFiles = async ({
    filepaths,
  }: AddFilesParams): Promise<void> => {
    const { files } = await this.filesApiManager.uploadFiles({
      filepaths,
      type: "ragUserFile",
    });

    await this.ragApi.addFilesToRagCollection({
      addFilesToRagCollectionBodyParams: {
        files: files.map(({ filepath, id }) => ({
          id,
          name: basename(filepath),
        })),
      },
      id: this.id,
      xGradientWorkspaceId: this.workspaceId,
    });

    const {
      data: { files: updatedFiles },
    } = await this.ragApi.getRagCollection({
      xGradientWorkspaceId: this.workspaceId,
      id: this.id,
    });

    this.files = updatedFiles;
  };

  public readonly delete = async ({}): Promise<void> => {
    await this.ragApi.deleteRagCollection({
      id: this.id,
      xGradientWorkspaceId: this.workspaceId,
    });
  };
}

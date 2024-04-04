import { basename } from "path";
import { RAGApi } from "../api";
import { IFilesApiManager } from "../files/types";
import { AddFilesParams } from "./paramTypes";

export class RagCollection {
  private readonly filesApiManager: IFilesApiManager;
  private readonly ragApi: RAGApi;

  public readonly id: string;
  public readonly workspaceId: string;

  public constructor(params: {
    filesApiManager: IFilesApiManager;
    id: string;
    ragApi: RAGApi;
    workspaceId: string;
  }) {
    this.filesApiManager = params.filesApiManager;
    this.id = params.id;
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
  };
}

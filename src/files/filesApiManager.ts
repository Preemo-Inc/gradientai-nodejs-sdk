import { createReadStream, statSync } from "fs";
import { FilesApi } from "../api";
import { IFilesApiManager } from "./types";

export class FilesApiManager implements IFilesApiManager {
  private readonly filesApi: FilesApi;
  private readonly workspaceId: string;

  public constructor(params: { filesApi: FilesApi; workspaceId: string }) {
    this.filesApi = params.filesApi;
    this.workspaceId = params.workspaceId;
  }

  public readonly uploadFile: IFilesApiManager["uploadFile"] = async ({
    filepath,
    type,
  }) => {
    const {
      data: { id },
    } = await this.filesApi.uploadFile({
      xGradientWorkspaceId: this.workspaceId,
      file: {
        contentStream: createReadStream(filepath),
        fileSize: statSync(filepath).size,
        type: "file",
      } as any,
      type,
    });

    return { id };
  };

  public readonly uploadFiles: IFilesApiManager["uploadFiles"] = async ({
    filepaths,
    type,
  }) => {
    const fileUploadResults = await Promise.all(
      filepaths.map(
        async (filepath) =>
          await this.uploadFile({
            filepath,
            type,
          })
      )
    );

    const files = filepaths.map((filepath, index) => {
      const fileUploadResult = fileUploadResults[index];

      return {
        id: fileUploadResult.id,
        filepath,
      };
    });

    return { files };
  };
}

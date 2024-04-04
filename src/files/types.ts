export type FileType = "audioFile" | "ragUserFile";

export namespace UploadFile {
  export type Params = {
    filepath: string;
    type: FileType;
  };

  export type Result = {
    id: string;
  };
}

export namespace UploadFiles {
  export type Params = {
    filepaths: Array<string>;
    type: FileType;
  };

  export type Result = {
    files: Array<{
      filepath: string;
      id: string;
    }>;
  };
}

export interface IFilesApiManager {
  uploadFile: (params: UploadFile.Params) => Promise<UploadFile.Result>;

  uploadFiles: (params: UploadFiles.Params) => Promise<UploadFiles.Result>;
}

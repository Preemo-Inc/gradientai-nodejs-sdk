import { ModelsApi } from "../api";
import { Model } from "./abstractModel";
import { FineTuneSample } from "./paramTypes";
import { FineTuneResponse } from "./returnTypes";

export class ModelAdapter extends Model {
  public readonly baseModelId: string;
  public readonly name: string;

  public constructor({
    apiInstance,
    id,
    baseModelId,
    name,
    workspaceId,
  }: {
    apiInstance: ModelsApi;
    id: string;
    baseModelId: string;
    name: string;
    workspaceId: string;
  }) {
    super({ apiInstance, id, workspaceId });
    this.baseModelId = baseModelId;
    this.name = name;
  }

  public readonly delete = async () => {
    await this.apiInstance.deleteModel({
      id: this.id,
      xGradientWorkspaceId: this.workspaceId,
    });
  };

  public readonly fineTune = async ({
    samples,
  }: {
    samples: Array<FineTuneSample>;
  }): Promise<FineTuneResponse> => {
    const {
      data: { numberOfTrainableTokens, sumLoss },
    } = await this.apiInstance.fineTuneModel({
      id: this.id,
      xGradientWorkspaceId: this.workspaceId,
      fineTuneModelBodyParams: { samples },
    });
    return { numberOfTrainableTokens, sumLoss };
  };
}

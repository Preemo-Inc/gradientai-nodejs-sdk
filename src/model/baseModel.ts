import { ModelsApi } from "../api";
import { Model } from "./abstractModel";
import { ModelAdapter } from "./modelAdapter";

export class BaseModel extends Model {
  public readonly slug: string;

  public constructor({
    apiInstance,
    id,
    slug,
    workspaceId,
  }: {
    apiInstance: ModelsApi;
    id: string;
    slug: string;
    workspaceId: string;
  }) {
    super({ apiInstance, id, workspaceId });
    this.slug = slug;
  }

  public readonly createModelAdapter = async ({
    learningRate,
    name,
    rank,
  }: {
    learningRate?: number;
    name: string;
    rank?: number;
  }): Promise<ModelAdapter> => {
    const {
      data: { id },
    } = await this.apiInstance.createModel({
      createModelBodyParams: {
        initialHyperparameters: {
          loraHyperparameters: { rank },
          trainingArguments: { learningRate },
        },
        model: { baseModelId: this.id, name },
      },
      xGradientWorkspaceId: this.workspaceId,
    });

    return new ModelAdapter({
      apiInstance: this.apiInstance,
      id,
      baseModelId: this.id,
      name,
      workspaceId: this.workspaceId,
    });
  };
}

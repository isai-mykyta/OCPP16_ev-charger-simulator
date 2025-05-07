import { defaultConfiguration } from "./config";

type KeyValue = {
  key: string;
  value: string;
  readonly: boolean;
}

export class ConfigurationService {
  private readonly configuration = defaultConfiguration;

  public getConfiguration(): KeyValue[] {
    return this.configuration;
  }

  public findConfigByKey(key: string): KeyValue | undefined {
    return this.configuration.find((config) => config.key === key);
  }
}

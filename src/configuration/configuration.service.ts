import { KeyValue } from "./types";

export class ConfigurationService {
  private configuration: KeyValue[];

  private readonly requiredKeys = [
    "WebSocketUrl",
    "ChargePointIdentity",
    "WebSocketPingInterval"
  ];

  constructor (configuration: KeyValue[]) {
    const hasRequiredKeys = this.validateRequiredKeys(configuration);

    if (!hasRequiredKeys) {
      throw new Error(`Invalid configuration. Configuration must contain ${this.requiredKeys.join(",")} keys`);
    }

    this.configuration = configuration;
  }

  private validateRequiredKeys(configuration: KeyValue[]): boolean {
    const configKeys = configuration.map((config) => config.key);
    return this.requiredKeys.every((key) => configKeys.includes(key));
  }

  private changeConfig(key: string, value: string): void {
    this.configuration = this.configuration.map((config) => (
      config.key === key ? { ...config, value }: config
    ));
  }

  public getConfiguration(): KeyValue[] {
    return this.configuration;
  }

  public findConfigByKey(key: string): KeyValue | undefined {
    return this.configuration.find((config) => config.key === key);
  }

  public updateConfigByKey(key: string, value: string): boolean {
    const foundKey = this.findConfigByKey(key);
    const isAllowed = !!foundKey && !foundKey.readonly;
    
    if (isAllowed) this.changeConfig(key, value);
    return isAllowed;
  }
}

import { IsArray, IsOptional, IsString } from "class-validator";

export class GetConfigurationReqSchema {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public key?: string[];
}

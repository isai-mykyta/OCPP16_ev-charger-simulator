import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

import { AuthorizationStatus } from "../types";

class IdTagInfoSchema {
  @IsOptional()
  @IsDateString()
  public expiryDate: string;

  @IsOptional()
  @IsString()
  public parentIdTag: string;

  @IsNotEmpty()
  @IsEnum(AuthorizationStatus)
  public status: AuthorizationStatus;
}

export class AuthorizeConfSchema {
  @IsNotEmpty()
  @Type(() => IdTagInfoSchema)
  public idTagInfo: IdTagInfoSchema;
}

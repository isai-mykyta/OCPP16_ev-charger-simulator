import { IsInt, IsNotEmpty, IsString, Length, Min } from "class-validator";

import { IsWebSocketUrl } from "../utils";

export class ConnectSimulatorRequestDto {
  @IsString()
  @IsNotEmpty()
  @Length(5, 20)
  public chargePointIdentity: string;

  @IsString()
  @IsNotEmpty()
  @IsWebSocketUrl()
  public webSocketUrl: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  public chargePointSerialNumber: string;

  @IsString()
  @IsNotEmpty()
  public vendor: string;

  @IsString()
  @IsNotEmpty()
  public model: string;
}

export class StartTransactionRequestDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  public connectorId: number;

  @IsNotEmpty()
  @IsString()
  public idTag: string;
}

import { IsNotEmpty, IsString } from "class-validator";

import { IsWebSocketUrl } from "../utils";

export class ConnectSimulatorRequestDto {
  @IsString()
  @IsNotEmpty()
  public chargePointIdentity: string;

  @IsString()
  @IsNotEmpty()
  @IsWebSocketUrl()
  public webSocketUrl: string;

  @IsString()
  @IsNotEmpty()
  public chargePointSerialNumber: string;

  @IsString()
  @IsNotEmpty()
  public vendor: string;

  @IsString()
  @IsNotEmpty()
  public model: string;
}

export class DisonncetSimulatorRequestDto {}

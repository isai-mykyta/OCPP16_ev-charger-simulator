import { IsDateString, IsNotEmpty } from "class-validator";

export class HeartbeatConfSchema {
  @IsNotEmpty()
  @IsDateString()
  public currentTime: string;
}

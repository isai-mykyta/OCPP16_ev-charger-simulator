import { OcppErrorCode } from "../ocpp";

export const mapErrorConstraintToErrorCode = (constraint: string): OcppErrorCode => {
  switch (constraint) {
  case "isEmail":
  case "isUUID":
  case "isDateString":
  case "isUrl":
  case "whitelistValidation":
  case "maxLength":
  case "minLength":
  case "length":
  case "isEnum":
    return OcppErrorCode.FORMATION_VIOLATION;

  case "isInt":
  case "isBoolean":
  case "isString":
  case "isNumber":
    return OcppErrorCode.TYPE_CONSTRAINT_VIOLATION;

  case "isNotEmpty":
    return OcppErrorCode.PROTOCOL_ERROR;
        
  case "customValidation":
    return OcppErrorCode.NOT_IMPLEMENTED;
        
  default:
    return OcppErrorCode.GENERIC_ERROR;
  }
};

import { Simulator } from "../../simulator";
import { AuthorizeConf } from "../types";

export const handleAuthorizeResponse = (
  simulator: Simulator,
  response: AuthorizeConf
): void => {
  const { expiryDate, status } = response.idTagInfo;
};

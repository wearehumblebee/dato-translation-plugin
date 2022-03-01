import { LogError } from "../types/logger";

/**
 * @desc parse Errors for log file
 * @param error
 * @returns
 */
export const parseError = (error:any): LogError => {
  if (error instanceof TypeError || error instanceof RangeError || error instanceof EvalError || error instanceof Error) {
    return {
      name: error.name,
      message:error.message
    }
  }
  else if(typeof error === "string"){
    return {
      name: "",
      message:error
    }
  }
  else{
    const message = error?.message || "";
    const statusCode = error?.statusCode || 0;
    const statusText = error?.statusText || "";

    return {
      name:"Unknown",
      message,
      statusCode,
      statusText
    }
  }
}

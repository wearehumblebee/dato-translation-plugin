import { LogError } from "../types/logger";

/**
 * @desc parse Errors for log file
 * @param error
 * @returns
 */
export const parseError = (error:any): LogError => {
  if (error instanceof TypeError) {
    return {
      name: error.name,
      message:error.message
    }
  }
  else if(error instanceof RangeError){
    return {
      name: error.name,
      message:error.message
    }

  }
  else if(error instanceof EvalError){
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
  }else if(error instanceof Error){
    return {
      name: error.name,
      message:error.message
    }
  }else{

    const message = error?.message || "";
    const statusCode = error?.statusCode || 0;
    const statusText = error?.statusText || "";

    // const t = {
    //   stack:"",
    //   message:"",
    //   statusCode: 422,
    //   statusText: ""
    // }

    return {
      name:"Unknown",
      message,
      statusCode,
      statusText
    }
  }
}

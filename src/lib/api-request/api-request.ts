import type { AxiosError, AxiosResponse, RawAxiosRequestHeaders } from "axios";
import Axios from "axios";
import type { JsonObject, Primitive } from "type-fest";

import type { ApiDetailType, BackendErrorResponse, BackendSuccessResponse, RequestDataType } from "./api-types";
import {
  getAxiosParams,
  getBasicAuthCredentials,
  manageErrorResponse,
  sanitizeApiController,
  transformRequestData,
} from "./api-schema";

import HttpException from "@/utils/exceptions/http-exception";

export interface IInitApiRequest {
  apiDetails: ApiDetailType;
  pathVariables?: Record<string, Primitive>;
  params?: { [key: string]: Primitive | Array<Record<string, Primitive>> };
  requestData?: RequestDataType;
  signal?: AbortSignal;
  headers?: RawAxiosRequestHeaders;
}

const initApiRequest = async <TData>({
  apiDetails,
  pathVariables,
  params,
  headers,
  signal,
  requestData,
}: IInitApiRequest): Promise<
  AxiosResponse<BackendSuccessResponse<TData>> | undefined
> => {
  const sanitizedDetails = sanitizeApiController(
    { ...apiDetails },
    pathVariables,
  );
  const axiosParams = getAxiosParams(sanitizedDetails, {
    ...headers,
  });
  try {
    const response = await Axios.request<BackendSuccessResponse<TData>>({
      ...axiosParams,
      params,
      signal: signal ?? axiosParams.signal,
      data: transformRequestData(sanitizedDetails, requestData),
      auth: getBasicAuthCredentials(sanitizedDetails.requestBodyType),
    });

    if ((response.data as { status: boolean }).status === false) {
      throw new HttpException({
        message: response.data.message || "An error occurred",
        status: 400,
        error: response || null,
      });
    }

    return response;
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }

    const managedError = manageErrorResponse(
      error as AxiosError<BackendErrorResponse<JsonObject>>,
    );

    throw new HttpException({
      message:
        managedError.data?.message ||
        managedError.message ||
        "An error occurred",
      status:
        typeof managedError.statusCode === "number"
          ? managedError.statusCode
          : 500,
      error: managedError || managedError,
    });
  }
};

export default initApiRequest;

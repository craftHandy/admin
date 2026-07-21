import type { JsonObject, Primitive } from "type-fest";
import type {
  AxiosBasicCredentials,
  AxiosError,
  AxiosRequestConfig,
  RawAxiosRequestHeaders,
} from "axios";

import type {
  ApiDetailType,
  ManagedAxiosError,
  RequestDataType,
  TransformedRequestData,
} from "./api-types";
import { RequestBodyType, RequestMethod } from "./api-types";

import { env } from "@/env";

export const sanitizeApiController = (
  apiDetail: ApiDetailType,
  pathVariables?: GenericObj<Primitive>,
): ApiDetailType => {
  let controllerName = apiDetail.controllerName;
  if (pathVariables && Object.keys(pathVariables).length) {
    Object.keys(pathVariables).forEach((key) => {
      controllerName = controllerName.replace(`{${key}}`, String(pathVariables[key]));
    });
  }

  return Object.assign(apiDetail, {
    controllerName,
  });
};

export const basicAuthCredentials: AxiosBasicCredentials = {
  username: import.meta.env.VITE_BASIC_AUTH_USER || "user",
  password: import.meta.env.VITE_BASIC_AUTH_PASS || "benefit",
};

export const getBasicAuthCredentials = (
  requestBodyType: RequestBodyType | undefined,
) => {
  if (!requestBodyType) return;
  if ([RequestBodyType.BASIC_AUTH].includes(requestBodyType))
    return basicAuthCredentials;
};

export const getRequestHeaders = (apiDetails: ApiDetailType) => {
  const headers: RawAxiosRequestHeaders = {
    "Content-Type": "application/json",
    "Tenant-Id": env.tenantId,
  };

  switch (apiDetails.requestBodyType) {
    case RequestBodyType.QUERY_STRING:
      return Object.assign(headers, {
        "Content-Type": "application/x-www-form-urlencoded",
      });
    case RequestBodyType.FORM_DATA:
      return Object.assign(headers, { "Content-Type": "multipart/form-data" });
    case RequestBodyType.NO_AUTH: {
      return Object.assign(headers, {
        "X-Request-Type": RequestBodyType.NO_AUTH,
      });
    }
    case RequestBodyType.BASIC_AUTH: {
      return headers;
    }
    default:
      return headers;
  }
};

export const getAxiosParams = (
  apiDetails: ApiDetailType,
  headers: RawAxiosRequestHeaders = {},
) => {
  const axiosRequestParams: AxiosRequestConfig = {
    baseURL: apiDetails.baseUrl || env.apiBaseUrl,
    url: apiDetails.controllerName,
    method: apiDetails.requestMethod || RequestMethod.GET,
    responseType: "json",
    timeout: 30_000,
    headers: { ...getRequestHeaders(apiDetails), ...headers },
  };

  if (apiDetails.requestBodyType === RequestBodyType.FILE)
    axiosRequestParams.responseType = "blob";

  return axiosRequestParams;
};

export const getFormData = (requestData: RequestDataType): FormData => {
  const formData = new FormData();
  const data = requestData as Record<string, unknown>;

  Object.keys(data).forEach((key) => {
    const value = data[key];

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item instanceof File || item instanceof Blob) {
          formData.append(`${key}[${index}]`, item);
        } else if (typeof item === "object" && item !== null) {
          Object.entries(item).forEach(([subKey, subValue]) =>
            formData.append(`${key}[${index}].${subKey}`, String(subValue)),
          );
        } else if (item !== undefined && item !== null) {
          formData.append(`${key}[${index}]`, String(item));
        }
      });
    } else if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    } else if (typeof value === "object" && value !== null) {
      Object.entries(value).forEach(([subKey, subValue]) =>
        formData.append(`${key}.${subKey}`, String(subValue)),
      );
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  return formData;
};

export function getQueryString(data: GenericObj): URLSearchParams {
  return new URLSearchParams(data);
}

export const transformRequestData = (
  apiDetails: ApiDetailType,
  requestData?: RequestDataType,
): TransformedRequestData => {
  if (!requestData) return {};

  switch (apiDetails.requestBodyType) {
    case RequestBodyType.FORM_DATA:
      return getFormData(requestData);
    case RequestBodyType.QUERY_STRING:
      return Array.isArray(requestData)
        ? new URLSearchParams()
        : getQueryString(requestData as GenericObj);
    default:
      return requestData;
  }
};

export const manageErrorResponse = (
  error: AxiosError<BackendErrorResponse<JsonObject>>,
): ManagedAxiosError => {
  const { message, config, request, response, isAxiosError, code } = error;
  const errorResponse: ManagedAxiosError = {
    message,
    data: response?.data as BackendErrorResponse<JsonObject>,
    statusCode: response?.status || 500,
    noconnection: false,
    config,
    isAxiosError,
  };

  if (response) errorResponse.data = { ...response.data, status: false };
  else if (request) {
    errorResponse.data = {
      error: {},
      message: "Server could not be reached.",
      status: false,
    };
    if (["ERR_NETWORK", "ERR_CANCELED", "ECONNABORTED"].includes(code ?? ""))
      errorResponse.noconnection = true;
    else errorResponse.data.message = "Something Went Wrong!";
  }

  return errorResponse;
};

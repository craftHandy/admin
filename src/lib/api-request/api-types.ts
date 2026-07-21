import type { AxiosRequestConfig } from "axios";

export type TransformedRequestData =
  | FormData
  | RequestDataType
  | URLSearchParams;

export interface RequestDataType {
  [key: string]: unknown;
}

export enum RequestMethod {
  GET = "GET",
  DELETE = "DELETE",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  PURGE = "PURGE",
  LINK = "LINK",
  UNLINK = "UNLINK",
}

export enum RequestBodyType {
  QUERY_STRING = "QUERY_STRING",
  JSON = "JSON",
  FORM_DATA = "FORM_DATA",
  NO_AUTH = "NO_AUTH",
  FILE = "FILE",
  BASIC_AUTH = "BASIC_AUTH",
}

export interface ApiDetailType {
  actionName?: string | Array<string>;
  controllerName: string;
  requestMethod?: RequestMethod;
  requestBodyType?: RequestBodyType;
  baseUrl?: string;
}

export interface ManagedAxiosError<Data = BackendErrorResponse<unknown>> {
  message: string;
  data: Data;
  statusCode: number | boolean;
  noconnection: boolean;
  config: AxiosRequestConfig | undefined;
  isAxiosError: boolean;
  code?: string;
}

import type { AxiosRequestConfig } from "axios";

export type GenericObj<T = unknown> = Record<string, T>;

export interface BackendResponse<T = unknown> {
  status: boolean;
  message?: string;
  data?: T;
  error?: unknown;
}

export interface BackendSuccessResponse<T = unknown> extends BackendResponse<T> {
  status: true;
}

export interface BackendErrorResponse<T = unknown> extends BackendResponse<T> {
  status: false;
  error?: T;
}

export type TransformedRequestData =
  | FormData
  | RequestDataType
  | URLSearchParams;

export interface RequestDataType {
  [key: string]: unknown;
}

export const RequestMethod = {
  GET: "GET",
  DELETE: "DELETE",
  HEAD: "HEAD",
  OPTIONS: "OPTIONS",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  PURGE: "PURGE",
  LINK: "LINK",
  UNLINK: "UNLINK",
} as const;

export const RequestBodyType = {
  QUERY_STRING: "QUERY_STRING",
  JSON: "JSON",
  FORM_DATA: "FORM_DATA",
  NO_AUTH: "NO_AUTH",
  FILE: "FILE",
  BASIC_AUTH: "BASIC_AUTH",
} as const;
export type RequestMethod =
  (typeof RequestMethod)[keyof typeof RequestMethod];
export type RequestBodyType =
  (typeof RequestBodyType)[keyof typeof RequestBodyType];
export interface ApiDetailType {
  actionName?: string | Array<string>;
  controllerName: string;
  requestMethod?: RequestMethod;
  requestBodyType?: RequestBodyType;
  baseUrl?: string;
}

export interface ManagedAxiosError<Data = BackendResponse<unknown>> {
  message: string;
  data: Data;
  statusCode: number | boolean;
  noconnection: boolean;
  config: AxiosRequestConfig | undefined;
  isAxiosError: boolean;
  code?: string;
}
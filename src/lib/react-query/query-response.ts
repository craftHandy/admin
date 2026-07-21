import type { AxiosResponse } from "axios";

import type {
  MutationMeta,
  QueryMeta,
} from "@tanstack/react-query";

import { toast } from "sonner";
import type HttpException from "@/utils/exceptions/http-exception";

const message = {
  FILE_SIZE: "Please Upload the file less than 12 MB.",
  LONG_TO_RESPOND:
    "Server is taking too long to respond, this can be caused by either poor connectivity or an error with our servers. Please try again in a while!",
  SERVER_NOT_REACHED: "Server could not be reached",
};

let noServerConnectionMessageCount = 0;
let longToRespondMessageCount = 0;

let lastQuerySuccessTime = 0;
let lastMutationSuccessTime = 0;

let unauthorizedHandler: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
  unauthorizedHandler = handler;
};

const onError = (httpException: HttpException, disableFailureToast = false) => {
  const { error } = httpException;
  if (error?.statusCode === 413) toast.error(message.FILE_SIZE);

  if (!disableFailureToast && error?.data?.message)
    toast.error(error.data.message);

  if (error?.statusCode === 401) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    if (unauthorizedHandler) {
      unauthorizedHandler();
    }
  }

  if (error?.noconnection) {
    if (error?.code !== "ECONNABORTED" && !longToRespondMessageCount) {
      longToRespondMessageCount++;
      toast.error(message.LONG_TO_RESPOND);
    }

    if (
      error?.message === message.SERVER_NOT_REACHED &&
      !noServerConnectionMessageCount
    ) {
      noServerConnectionMessageCount++;
      toast.error(message.SERVER_NOT_REACHED);
    }
  }
};

const onQueryError = (
  responseError: unknown,
  query: Record<string, unknown>,
) => {
  onError(
    responseError as HttpException,
    (query.meta as QueryMeta | undefined)?.disableFailureToast ? true : false,
  );
};

const onMutationError = async (
  responseError: unknown,
  variables: unknown,
  context: unknown,
  mutation: Record<string, unknown>,
) => {
  onError(
    responseError as HttpException,
    (mutation.meta as MutationMeta | undefined)?.disableFailureToast
      ? true
      : false,
  );
};

const onQuerySuccess = (data: unknown, query: Record<string, unknown>) => {
  if ((query.meta as QueryMeta | undefined)?.disableSuccessToast) return;

  const currentTime = Date.now();
  const intervalDuration = 2500;
  if (currentTime - lastQuerySuccessTime < intervalDuration) {
    return;
  }

  lastQuerySuccessTime = currentTime;
};

const onMutationSuccess = (
  responseData: unknown,
  variables: unknown,
  context: unknown,
  query: Record<string, unknown>,
) => {
  if ((query.meta as MutationMeta | undefined)?.disableSuccessToast) return;
  const currentTime = Date.now();
  const intervalDuration = 2500;
  if (currentTime - lastMutationSuccessTime < intervalDuration) {
    return;
  }

  lastMutationSuccessTime = currentTime;

  const toastData = (
    responseData as AxiosResponse<{ data?: { message?: string } }>
  )
  const messageText = toastData?.data?.message ?? toastData?.message;
  if (messageText) toast.success(messageText);
};

export { onMutationError, onMutationSuccess, onQueryError, onQuerySuccess };

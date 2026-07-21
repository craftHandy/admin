import type { ManagedAxiosError } from "@/lib/api-request/api-types";

class HttpException<
  TError = ManagedAxiosError<BackendErrorResponse<GenericObj>>,
> extends Error {
  public status?: number;
  public error: TError;

  constructor({ message, status, error }: { message: string; status?: number; error?: TError }) {
    super(message);
    this.status = status;
    this.error = error as TError;
  }
}

export default HttpException;

export default class AppError extends Error {
  status: string;
  isOperational: boolean;
  code?: string;
  constructor(
    public statusCode: number = 500,
    public message: string,
    code?: string
  ) {
    super(message);
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    if (code) this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

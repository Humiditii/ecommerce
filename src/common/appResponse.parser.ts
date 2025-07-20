export class AppResponse {
  static success(message: string, statusCode: number = 200, data?: any, meta?: any) {
    return {
      success: true,
      message,
      statusCode,
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message: string, statusCode: number = 500, error?: any) {
    return {
      success: false,
      message,
      statusCode,
      error,
      timestamp: new Date().toISOString(),
    };
  }
}

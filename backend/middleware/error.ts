import { NextResponse } from "next/server";
import { AppError, ApiErrorResponse } from "../lib/errors";

type RouteHandler = (req: Request, ...args: any[]) => Promise<Response>;

export const withErrorHandler = (handler: RouteHandler): RouteHandler => {
    return async (req: Request, ...args: any[]) => {
        try {
            return await handler(req, ...args);
        } catch (error: any) {
            console.error("API Error Caught:", error);

            let statusCode = 500;
            let message = "Internal Server Error";
            let errorCode = "INTERNAL_SERVER_ERROR";

            if (error instanceof AppError) {
                statusCode = error.statusCode;
                message = error.message;
                errorCode = error.errorCode;
            } else if (error instanceof Error) {
                message = error.message;
            }

            const response: ApiErrorResponse = {
                success: false,
                statusCode,
                message,
                errorCode,
            };

            return NextResponse.json(response, { status: statusCode });
        }
    };
};

export const normalizeResponse = (data: any, statusCode = 200) => {
    return NextResponse.json({
        success: true,
        statusCode,
        data
    }, { status: statusCode });
}

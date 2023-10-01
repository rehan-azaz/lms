import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";

export default (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server error";

    // Invalid ObjectId
    if (err.name == "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Duplicate Key Error
    if (err.code == 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entry`;
        err = new ErrorHandler(message, 400);
    }

    // Invalid JWT Error
    if (err.name == "JsonWebTokenError") {
        const message = `Invalid or wrong token. Try Again`;
        err = new ErrorHandler(message, 400);
    }

    // Expired JWT Error
    if (err.name == "TokenExpiredError") {
        const message = `Token is expired. Try Again`;
        err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};

import express, { NextFunction, Request, Response } from "express";
export const app = express();
import cookieParser from "cookie-parser";
import cors from "cors";
import errorMiddleware from "./middleware/error";
import router from "./routes/routes";

app.use(express.json({ limit: "50mb" }));

app.use(cookieParser());

app.use(
    cors({
        origin: process.env.ORIGIN,
    })
);

app.use("/api/v1", router)

app.use("/status", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        success: true,
        message: "Server is up and running!",
    });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Path ${req.originalUrl} not found`) as any;
    err.statusCode = 404;

    next(err);
});

app.use(errorMiddleware);

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { Request, Response, NextFunction } from "express";
import { ErrorMiddleware } from "./middlewares/error";

dotenv.config();

export const app = express();

// cors middleware
app.use(cors({
    origin: process.env.ORIGIN,
}));

// body parser middleware
app.use(express.json({ limit: "50mb" }));

// cookie parser middleware
app.use(cookieParser());

// routes
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        success: true,
        message: "API is working"
    });
});

app.all("*",(req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err);
})

app.use(ErrorMiddleware);
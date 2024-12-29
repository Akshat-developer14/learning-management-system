import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import express ,{ Request, Response, NextFunction } from "express";
import { ErrorMiddleware } from "./middlewares/error";
import userRouter from "./routes/user.route";
import courseRouter from "./routes/course.route";

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

//routes
// user router
app.use("/api/v1", userRouter);
// course router
app.use("/api/v1", courseRouter);

// routes
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        success: true,
        message: "API is working"
    });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err);
})

app.use(ErrorMiddleware);
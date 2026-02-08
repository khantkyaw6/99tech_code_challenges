import cors from "cors";
import express, {
    type Application,
    type Request,
    type Response,
} from "express";
import rateLimit from "express-rate-limit";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import routes from "./routes";
import { sendSuccessResponse } from "./utils/response.util";


const app: Application = express();
const PORT = env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: "*",
    }),
);

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 5 minutes).
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
    // store: ... , // Redis, Memcached, etc. See below.
})


app.use(limiter)

app.get("/health", (_req: Request, res: Response) => {
    sendSuccessResponse(res, {
        data: {
            status: "healthy",
            timestamp: new Date().toISOString(),
        },
        message: "CRUDE Backend is running",
    });
});

app.use("/api/v1", routes);


app.use((_req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        timestamp: new Date().toISOString(),
    });
});

app.use(errorHandler);


const startServer = async () => {
    try {
        await connectDatabase();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();

export default app;

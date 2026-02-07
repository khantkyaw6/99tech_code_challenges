import cors from "cors";
import express, {
    type Application,
    type Request,
    type Response,
} from "express";
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

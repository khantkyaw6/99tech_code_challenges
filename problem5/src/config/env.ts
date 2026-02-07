import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { ZodError, z } from "zod";

expand(config());

const EnvSchema = z.object({
    PORT: z.coerce.number().int().positive().default(3000),
    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

});

export type Env = z.infer<typeof EnvSchema>;

let env: Env;
try {
    env = EnvSchema.parse(process.env);
} catch (error) {
    if (error instanceof ZodError) {
        let message = "❌ Invalid environment variables:\n";
        error.issues.forEach((issue) => {
            message += `  - ${issue.path[0]?.toString()}: ${issue.message}\n`;
        });
        const e = new Error(message);
        e.stack = "";
        throw e;
    } else {
        throw error;
    }
}

export { env };

import { type InferSchemaType, model, Schema } from "mongoose";
import { ResourceStatus } from "../../constants/resource.constant";

const ResourceSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 255,
            index: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
        status: {
            type: String,
            enum: Object.values(ResourceStatus),
            default: ResourceStatus.ACTIVE,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Optional: compound index for common list queries
ResourceSchema.index({ status: 1, createdAt: -1 });

export type Resource = InferSchemaType<typeof ResourceSchema>;

export const ResourceModel = model<Resource>("Resource", ResourceSchema);

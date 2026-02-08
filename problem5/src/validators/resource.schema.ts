import { z } from "zod";
import { ResourceStatus } from "../constants/resource.constant";

export const ResourceCreateSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "name is required")
        .max(255, "name must be at most 255 characters"),

    description: z
        .string()
        .trim()
        .max(1000, "description must be at most 1000 characters")
        .optional(),

    status: z.enum(ResourceStatus).optional(),

});

export const ResourceUpdateSchema = ResourceCreateSchema.partial();

export const ResourceListQuerySchema = z.object({
    status: z.enum(ResourceStatus).optional(),
    search: z.string().trim().min(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(10),
    page: z.coerce.number().int().min(0).default(0),
});

export type ResourceCreateInput = z.infer<typeof ResourceCreateSchema>;
export type ResourceUpdateInput = z.infer<typeof ResourceUpdateSchema>;
export type ResourceListQueryInput = z.infer<typeof ResourceListQuerySchema>;

import { z } from "zod";
import { ResourceStatus } from "../constants/resource.constant";
import {
    BaseFilterQuerySchema,
    buildDateRangeFilter,
    buildSearchFilter,
    mergeFilters,
    type MongoFilter,
} from "../utils/filter.util";

/**
 * Resource Filter Builder and Validator
 */

/**
 * Resource-specific filter query schema
 */
export const ResourceFilterQuerySchema = BaseFilterQuerySchema.extend({
    // Optional: a direct name filter (in addition to global `search`)
    name: z.string().min(1).max(255).optional(),

    // Status filter using your enum flow
    status: z.nativeEnum(ResourceStatus).optional(),
});

export type ResourceFilterQuery = z.infer<typeof ResourceFilterQuerySchema>;

/**
 * Build MongoDB filter object from validated query parameters
 */
export const buildResourceFilter = (
    query: Partial<ResourceFilterQuery>,
): MongoFilter => {
    const filters: MongoFilter[] = [];

    // Search filter - searches across name and description fields
    if (query.search) {
        filters.push(buildSearchFilter(query.search, ["name", "description"]));
    }

    // Date range filters (createdAt)
    const dateFilter = buildDateRangeFilter(
        query.createdBefore,
        query.createdAfter,
    );
    if (Object.keys(dateFilter).length > 0) {
        filters.push(dateFilter);
    }

    // Field-specific filters
    const fieldFilters: MongoFilter = {};

    if (query.name) {
        fieldFilters.name = new RegExp(query.name, "i");
    }

    if (query.status) {
        fieldFilters.status = query.status;
    }

    if (Object.keys(fieldFilters).length > 0) {
        filters.push(fieldFilters);
    }

    return mergeFilters(...filters);
};

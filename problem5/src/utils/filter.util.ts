import type { FilterQuery } from "mongoose";
import { z } from "zod";

/**
 * Filter utility types and helpers for building MongoDB filters from query parameters
 */

/**
 * MongoDB filter type - more specific than Record<string, any>
 */
export type MongoFilter = FilterQuery<unknown>;

/**
 * Common filter options interface
 */
export interface CommonFilterOptions {
	search?: string;
	createdBefore?: Date;
	createdAfter?: Date;
}

/**
 * Base filter query schema for common filters
 * These are common across all entities
 */
export const BaseFilterQuerySchema = z.object({
	search: z.string().min(1).max(100).optional(),
	createdBefore: z
		.string()
		.datetime()
		.optional()
		.transform((val) => (val ? new Date(val) : undefined)),
	createdAfter: z
		.string()
		.datetime()
		.optional()
		.transform((val) => (val ? new Date(val) : undefined)),
});

/**
 * Helper to build date range filter for MongoDB
 * Handles createdBefore (includes all of that day) and createdAfter
 */
export const buildDateRangeFilter = (
	createdBefore?: Date,
	createdAfter?: Date,
	fieldName: string = "createdAt",
): MongoFilter => {
	const dateFilter: { $lte?: Date; $gte?: Date } = {};

	if (createdBefore) {
		// Include all of the day of createdBefore by setting time to end of day
		const endOfDay = new Date(createdBefore);
		endOfDay.setHours(23, 59, 59, 999);
		dateFilter.$lte = endOfDay;
	}

	if (createdAfter) {
		dateFilter.$gte = createdAfter;
	}

	return Object.keys(dateFilter).length > 0 ? { [fieldName]: dateFilter } : {};
};

/**
 * Helper to build search filter for MongoDB using regex
 * Searches across multiple text fields (case-insensitive)
 */
export const buildSearchFilter = (
	search: string | undefined,
	searchFields: string[],
): MongoFilter => {
	if (!search || searchFields.length === 0) {
		return {};
	}

	const searchRegex = new RegExp(search, "i");
	return {
		$or: searchFields.map((field) => ({
			[field]: searchRegex,
		})),
	};
};

/**
 * Merge multiple filter objects into a single MongoDB filter
 */
export const mergeFilters = (...filters: MongoFilter[]): MongoFilter => {
	const mergedFilter: MongoFilter = {};
	const conditions: MongoFilter[] = [];

	for (const filter of filters) {
		if (Object.keys(filter).length === 0) continue;

		// If filter has $or, add it to conditions
		if (filter.$or) {
			conditions.push({ $or: filter.$or });
			continue;
		}

		// Otherwise merge directly
		Object.assign(mergedFilter, filter);
	}

	// If we have conditions, wrap everything in $and
	if (conditions.length > 0) {
		const baseConditions = Object.keys(mergedFilter).map((key) => ({
			[key]: mergedFilter[key],
		}));
		return {
			$and: [...baseConditions, ...conditions],
		};
	}

	return mergedFilter;
};

import type { Request } from "express";
import { z } from "zod";

export const PaginationQuerySchema = z.object({
	page: z
		.string()
		.regex(/^\d+$/)
		.transform(Number)
		.pipe(z.number().min(1))
		.optional(),
	limit: z
		.string()
		.regex(/^\d+$/)
		.transform(Number)
		.pipe(z.number().min(1).max(100))
		.optional(),
	sortBy: z.string().optional(),
	sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type PaginationQuery = {
	page: number;
	limit: number;
	sortBy?: string;
	sortOrder: "asc" | "desc";
};

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: PaginationMeta;
}

export const getPaginationParams = (req: Request): PaginationQuery => {
	const result = PaginationQuerySchema.safeParse(req.query);

	if (!result.success) {
		return {
			page: 1,
			limit: 10,
			sortOrder: "desc",
		};
	}

	return {
		page: result.data.page ?? 1,
		limit: result.data.limit ?? 10,
		sortBy: result.data.sortBy,
		sortOrder: result.data.sortOrder ?? "desc",
	};
};


export const calculatePaginationMeta = (
	page: number,
	limit: number,
	total: number,
): PaginationMeta => {
	const totalPages = Math.ceil(total / limit);

	return {
		page,
		limit,
		total,
		totalPages,
		hasNextPage: page < totalPages,
		hasPrevPage: page > 1,
	};
};


export const createPaginatedResponse = <T>(
	data: T[],
	page: number,
	limit: number,
	total: number,
): PaginatedResponse<T> => {
	return {
		data,
		pagination: calculatePaginationMeta(page, limit, total),
	};
};

export const calculateSkip = (page: number, limit: number): number => {
	return (page - 1) * limit;
};

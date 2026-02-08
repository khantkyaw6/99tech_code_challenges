import type { Request } from "express";
import { BadRequestError } from "./errors.util";

/**
 * Safely extracts and validates the id parameter from request params
 * Throws BadRequestError if id is missing or invalid
 */
export const getRequiredParam = (req: Request, paramName: string): string => {
	const value = req.params[paramName];
	if (!value || typeof value !== "string") {
		throw new BadRequestError(`${paramName} parameter is required`);
	}
	return value;
};

/**
 * Convenience function for getting the 'id' parameter (most common case)
 */
export const getIdParam = (req: Request): string => {
	return getRequiredParam(req, "id");
};

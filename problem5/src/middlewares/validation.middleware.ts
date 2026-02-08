import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { ValidatedQuery } from "../types/request.types";
import { ValidationError } from "../utils/errors.util";

/**
 * Convert Zod error messages to user-friendly messages
 */
const makeErrorMessageUserFriendly = (
	message: string,
	path: string,
): string => {
	// Handle "Invalid input: expected <type>, received <actual>" pattern
	const invalidInputMatch = message.match(
		/Invalid input: expected ([^,]+), received (.+)/i,
	);
	if (invalidInputMatch) {
		const expectedType = invalidInputMatch[1];
		const receivedType = invalidInputMatch[2];

		// Handle missing/undefined/null values
		if (receivedType === "undefined" || receivedType === "null") {
			if (expectedType === "string") {
				return `${path} is required and must be text`;
			} else if (expectedType === "number") {
				return `${path} is required and must be a number`;
			} else if (expectedType === "boolean") {
				return `${path} is required and must be true or false`;
			} else {
				return `${path} is required`;
			}
		}

		// Handle type mismatches
		if (expectedType === "string") {
			return `${path} must be text`;
		} else if (expectedType === "number") {
			return `${path} must be a number`;
		} else if (expectedType === "boolean") {
			return `${path} must be true or false`;
		} else {
			return `${path} must be a valid ${expectedType}`;
		}
	}

	// Handle "Required" errors
	if (message === "Required") {
		return `${path} is required`;
	}

	// Common patterns and their friendly messages
	if (message.includes("Invalid email")) {
		return "Please enter a valid email address";
	}
	if (
		message.includes("Too small") ||
		message.includes("too_small") ||
		message.includes("String must contain at least")
	) {
		// Handle "Too small: expected string to have >=N characters" format
		const match =
			message.match(/>=\s*(\d+)\s*characters?/) ||
			message.match(/at least (\d+)/);
		if (match) {
			return `${path} must be at least ${match[1]} characters long`;
		}
	}
	if (
		message.includes("Too big") ||
		message.includes("too_big") ||
		message.includes("String must contain at most")
	) {
		// Handle "Too big: expected string to have <=N characters" format
		const match =
			message.match(/<=\s*(\d+)\s*characters?/) ||
			message.match(/at most (\d+)/);
		if (match) {
			return `${path} must be at most ${match[1]} characters long`;
		}
	}
	if (message.includes("Invalid datetime")) {
		return `${path} must be a valid date and time (ISO 8601 format)`;
	}
	if (message.includes("Invalid enum value")) {
		const match = message.match(/Expected (.+?),/);
		if (match) {
			return `${path} must be one of: ${match[1]}`;
		}
	}

	// Return the original message if no friendly replacement found
	return message;
};

/**
 * Validation middleware for request body validation using Zod schemas
 */
export const validate = (schema: z.ZodSchema) => {
	return async (req: Request, _res: Response, next: NextFunction) => {
		try {
			await schema.parseAsync(req.body);
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				const errors = error.issues.map((err) => {
					const fieldName = err.path.join(".") || "field";
					return {
						field: fieldName,
						message: makeErrorMessageUserFriendly(err.message, fieldName),
					};
				});
				next(
					new ValidationError(
						"Please check the following fields and try again",
						errors,
					),
				);
			} else {
				next(error);
			}
		}
	};
};

/**
 * Validation middleware for query parameters validation using Zod schemas
 * Uses generics to maintain type safety throughout the validation process
 */
export const validateQuery = <T extends ValidatedQuery>(
	schema: z.ZodSchema<T>,
) => {
	return async (req: Request, _res: Response, next: NextFunction) => {
		try {
			const validated = await schema.parseAsync(req.query);
			// Store validated query in req for later use
			// The validated result is guaranteed to match T by Zod's runtime validation
			req.validatedQuery = validated;
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				const errors = error.issues.map((err) => {
					const fieldName = err.path.join(".") || "parameter";
					return {
						field: fieldName,
						message: makeErrorMessageUserFriendly(err.message, fieldName),
					};
				});
				next(
					new ValidationError(
						"Invalid query parameters. Please check your filters",
						errors,
					),
				);
			} else {
				next(error);
			}
		}
	};
};

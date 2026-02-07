import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError, ValidationError } from "../utils/errors.util";
import { sendErrorResponse } from "../utils/response.util";

/**
 * Global Error Handler Middleware
 * Handles all types of errors and sends consistent error responses
 */
export const errorHandler = (
	error: Error | AppError | ZodError,
	_req: Request,
	res: Response,
	_next: NextFunction,
): Response => {
	// Log error for debugging
	console.error("Error:", error);

	// Handle Zod validation errors
	if (error instanceof ZodError) {
		const errors = error.issues.map((err) => {
			const fieldName = err.path.join(".") || "field";
			let message = err.message;

			// Make messages more user-friendly
			if (message.includes("Invalid email")) {
				message = "Please enter a valid email address";
			} else if (message.includes("Required")) {
				message = `${fieldName} is required`;
			}

			return {
				field: fieldName,
				message,
			};
		});
		return sendErrorResponse(
			res,
			"Please check your input and try again",
			422,
			errors,
		);
	}

	// Handle custom application errors
	if (error instanceof AppError) {
		return sendErrorResponse(
			res,
			error.message,
			error.statusCode,
			error instanceof ValidationError ? error.errors : undefined,
		);
	}

	// Handle Mongoose/MongoDB errors with user-friendly messages
	if (error.name === "ValidationError") {
		return sendErrorResponse(
			res,
			"The data provided is not valid. Please check and try again",
			400,
		);
	}

	if (error.name === "CastError") {
		return sendErrorResponse(
			res,
			"The ID provided is not valid. Please check and try again",
			400,
		);
	}

	if (
		error.name === "MongoServerError" ||
		("code" in error && (error as { code: number }).code === 11000)
	) {
		return sendErrorResponse(
			res,
			"A record with this information already exists",
			409,
		);
	}

	// Handle generic errors
	const statusCode =
		"statusCode" in error &&
			typeof (error as { statusCode: number }).statusCode === "number"
			? (error as { statusCode: number }).statusCode
			: 500;
	const message =
		error.message || "An unexpected error occurred. Please try again later";

	return sendErrorResponse(res, message, statusCode);
};

/**
 * Async handler wrapper to catch async errors
 * Wraps async route handlers to catch errors and pass to error handler
 */
export const asyncHandler = (
	fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) => {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};

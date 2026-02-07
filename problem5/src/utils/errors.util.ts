import { StatusCodes } from "http-status-codes";
import type { ValidationErrors } from "../types/validation.types";


export class AppError extends Error {
	public statusCode: number;
	public isOperational: boolean;

	constructor(message: string, statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = true;
		Error.captureStackTrace(this, this.constructor);
	}
}

export class BadRequestError extends AppError {
	constructor(
		message: string = "The request is invalid. Please check your input",
	) {
		super(message, StatusCodes.BAD_REQUEST);
	}
}

/**
 * 401 Unauthorized Error
 */
export class UnauthorizedError extends AppError {
	constructor(
		message: string = "You need to be logged in to access this resource",
	) {
		super(message, StatusCodes.UNAUTHORIZED);
	}
}

/**
 * 403 Forbidden Error
 */
export class ForbiddenError extends AppError {
	constructor(
		message: string = "You do not have permission to access this resource",
	) {
		super(message, StatusCodes.FORBIDDEN);
	}
}

/**
 * 404 Not Found Error
 */
export class NotFoundError extends AppError {
	constructor(message: string = "The requested resource was not found") {
		super(message, StatusCodes.NOT_FOUND);
	}
}

/**
 * 409 Conflict Error
 */
export class ConflictError extends AppError {
	constructor(message: string = "This operation conflicts with existing data") {
		super(message, StatusCodes.CONFLICT);
	}
}

/**
 * 422 Validation Error
 */
export class ValidationError extends AppError {
	public errors?: ValidationErrors;

	constructor(
		message: string = "Please check your input and try again",
		errors?: ValidationErrors,
	) {
		super(message, StatusCodes.UNPROCESSABLE_ENTITY);
		this.errors = errors;
	}
}

/**
 * 500 Database Error
 */
export class DatabaseError extends AppError {
	constructor(message: string = "A database error occurred. Please try again") {
		super(message, StatusCodes.INTERNAL_SERVER_ERROR);
	}
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends AppError {
	constructor(
		message: string = "An unexpected error occurred. Please try again later",
	) {
		super(message, StatusCodes.INTERNAL_SERVER_ERROR);
	}
}

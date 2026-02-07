import type { Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { ValidationErrors } from "../types/validation.types";
import type { PaginationMeta } from "./pagination.util";

export interface ApiResponse<T = unknown> {
	success: boolean;
	message?: string;
	data?: T;
	errors?: ValidationErrors;
	timestamp: string;
}

export interface PaginatedData<T> {
	items: T;
	pagination: PaginationMeta;
}

export interface SendSuccessResponseOptions<T = unknown> {
	data: T;
	message?: string;
	statusCode?: number;
	pagination?: PaginationMeta;
	resourceKey?: string;
}

export const sendSuccessResponse = <T = unknown>(
	res: Response,
	options: SendSuccessResponseOptions<T>,
): Response => {
	const { data, message, statusCode = StatusCodes.OK, pagination, resourceKey } = options;

	const wrappedData = resourceKey ? { [resourceKey]: data } : data;

	const responseData = pagination
		? { items: wrappedData, pagination }
		: wrappedData;

	const response: ApiResponse<typeof responseData> = {
		success: true,
		message,
		data: responseData,
		timestamp: new Date().toISOString(),
	};

	return res.status(statusCode).json(response);
};

export const sendErrorResponse = (
	res: Response,
	message: string,
	statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
	errors?: ValidationErrors,
): Response => {
	const response: ApiResponse = {
		success: false,
		message,
		errors,
		timestamp: new Date().toISOString(),
	};

	return res.status(statusCode).json(response);
};

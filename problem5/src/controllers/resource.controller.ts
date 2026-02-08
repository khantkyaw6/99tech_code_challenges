import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { buildResourceFilter } from "../filters/resource.filter";
import { asyncHandler } from "../middlewares/error.middleware";
import { ResourceService } from "../services/resource.service";
import { calculatePaginationMeta, getPaginationParams } from "../utils/pagination.util";
import { getIdParam } from "../utils/params.util";
import { sendSuccessResponse } from "../utils/response.util";

export class ResourceController {

    private service: ResourceService;

    constructor() {
        this.service = new ResourceService();
    }

    create = asyncHandler(async (req: Request, res: Response) => {
        const admin = await this.service.createResource(req.body);
        sendSuccessResponse(res, {
            data: admin,
            message: "Resource created successfully",
            statusCode: StatusCodes.CREATED,
        });
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const resource = await this.service.getResourceById(getIdParam(req));
        sendSuccessResponse(res, { data: resource });
    });

    getAll = asyncHandler(async (req: Request, res: Response) => {

        const { page, limit, sortBy, sortOrder } = getPaginationParams(req);

        // Get validated filter query from middleware
        const filterQuery = req.validatedQuery || {};
        const filter = buildResourceFilter(filterQuery);

        const { resources, total } = await this.service.getAllResources(
            page,
            limit,
            sortBy,
            sortOrder,
            filter,
        );
        const pagination = calculatePaginationMeta(page, limit, total);


        sendSuccessResponse(res, {
            data: resources,
            message: "Resources retrieved successfully",
            pagination,
        });

    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const resource = await this.service.updateResource(getIdParam(req), req.body);
        sendSuccessResponse(res, {
            data: resource,
            message: "Resource updated successfully",
        });
    });

    delete = asyncHandler(async (req: Request, res: Response) => {
        await this.service.deleteResource(getIdParam(req));
        sendSuccessResponse(res, {
            data: null,
            message: "Resource deleted successfully",
        });
    });
}
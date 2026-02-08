import { ResourceRepository } from "../repositories/resource.repository";
import { NotFoundError } from "../utils/errors.util";
import type { MongoFilter } from "../utils/filter.util";
import { calculateSkip } from "../utils/pagination.util";
import type { ResourceCreateInput, ResourceUpdateInput } from "../validators/resource.schema";


export class ResourceService {

    private repository: ResourceRepository;

    constructor() {
        this.repository = new ResourceRepository();

    }

    async createResource(data: ResourceCreateInput) {

        return await this.repository.create(data)
    }

    async getAllResources(page: number = 1,
        limit: number = 10,
        sortBy?: string,
        sortOrder?: "asc" | "desc",
        filter: MongoFilter = {}) {

        const skip = calculateSkip(page, limit);
        const [resources, total] = await Promise.all([
            this.repository.findAll(
                skip,
                limit,
                sortBy,
                sortOrder,
                filter,
            ), this.repository.count(filter)

        ])

        return { resources, total };
    }

    async getResourceById(id: string) {
        const resource = await this.repository.findById(id);
        if (!resource) {
            throw new NotFoundError("Resource not found");
        }
        return resource;
    }


    async updateResource(id: string, data: ResourceUpdateInput) {
        const resource = await this.repository.update(id, { ...data }
        );
        if (!resource) {
            throw new NotFoundError("Resource not found");
        }
        return resource;
    }

    async deleteResource(id: string) {
        const resource = await this.repository.delete(id);
        if (!resource) {
            throw new NotFoundError("Resource not found");
        }
        return resource;
    }

}
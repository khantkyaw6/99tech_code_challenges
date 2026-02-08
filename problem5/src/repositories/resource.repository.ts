import { type Resource, ResourceModel } from "../db/models/resource.model";
import type { MongoFilter } from "../utils/filter.util";

export class ResourceRepository {
    async create(data: Partial<Resource>) {
        return await ResourceModel.create(data)
    }

    async findById(id: string) {
        return await ResourceModel.findById(id).lean();
    }

    async findAll(skip: number,
        limit: number,
        sortBy: string = "createdAt",
        sortOrder: "asc" | "desc" = "desc",
        filter: MongoFilter = {}) {
        const sortObj: Record<string, 1 | -1> = {
            [sortBy]: sortOrder === "asc" ? 1 : -1,
        };

        return await ResourceModel.find(filter)
            .sort(sortObj)
            .skip(skip)
            .limit(limit)
            .lean()
    }

    async count(filter: MongoFilter = {}) {
        return await ResourceModel.countDocuments(filter);
    }

    async update(id: string, data: Partial<Resource>) {
        return await ResourceModel.findByIdAndUpdate(id, data, { new: true })
    }

    async delete(id: string) {
        return await ResourceModel.findByIdAndDelete(id);
    }

}
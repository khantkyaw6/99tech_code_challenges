import type { ResourceListQueryInput } from "../validators/resource.schema";

// You can Union the validate query for other routes
export type ValidatedQuery = ResourceListQueryInput

declare global {
	namespace Express {
		interface Request {
			validatedQuery?: ValidatedQuery;
		}
	}
}

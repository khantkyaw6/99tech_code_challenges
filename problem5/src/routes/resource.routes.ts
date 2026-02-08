import { Router } from "express";
import { ResourceController } from "../controllers/resource.controller";
import { validate, validateQuery } from "../middlewares/validation.middleware";
import { ResourceCreateSchema, ResourceListQuerySchema, ResourceUpdateSchema } from "../validators/resource.schema";


const router = Router();
const controller = new ResourceController();


router.route("/")
    .post(
        validate(ResourceCreateSchema),
        controller.create)
    .get(
        validateQuery(ResourceListQuerySchema),
        controller.getAll
    )

router.route("/:id")
    .get(controller.getById)
    .put(
        validate(ResourceUpdateSchema),
        controller.update
    )
    .delete(controller.delete)



export default router;
import { Router } from "express";

import {
  listAdmins,
  createAdmin,
  deactivateAdmin,
  activateAdmin
} from "../controllers/admin.controller.js";

import {
  auth,
  requireRoles
} from "../middleware/auth.js";

const router = Router();

router.use(auth);
router.use(requireRoles("SUPER_ADMIN"));

router.get("/", listAdmins);

router.post("/", createAdmin);

router.patch("/:id/deactivate", deactivateAdmin);

router.patch("/:id/activate", activateAdmin);

export default router;

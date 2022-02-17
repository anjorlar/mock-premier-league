import { Router } from "express";
import * as FixtureController from "../controllers/FixtureController";
import { authToken, authAdmin, authUser, rateLimiter } from "../middlewares/Auth";
import { cachedFixture, cachedFixtures } from "../middlewares/Cache";

const router = Router();

router.post("/", authToken, authAdmin, FixtureController.newFixture);
router.get("/", authToken, authUser, rateLimiter, cachedFixtures, FixtureController.getAllFixtures);
router.get("/link/:id", authToken, cachedFixture, FixtureController.getFixture);
router.get("/:id", authToken, authUser, rateLimiter, cachedFixture, FixtureController.getFixture);
router.put("/:id", authToken, authAdmin, FixtureController.updateFixture);
router.delete("/:id", authToken, authAdmin, FixtureController.removeFixture);


export default router;
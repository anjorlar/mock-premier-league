import { Router } from "express";
import * as AdminController from "../controllers/AdminController";
import * as FixtureController from "../controllers/FixtureController";
import * as TeamController from "../controllers/TeamController";
import { authToken, authAdmin } from "../middlewares/Auth";
import { cachedTeam, cachedTeams, cachedFixture, cachedFixtures } from "../middlewares/Cache";

const router = Router();

router.post("/register", AdminController.createNewAdmin);
router.post("/login", AdminController.adminLogin);
router.get("/fixture/:id", authToken, authAdmin, cachedFixture, FixtureController.getFixtureAdmin);
router.get("/team/:id", authToken, authAdmin, cachedTeam, TeamController.getTeam);
router.get("/teams", authToken, authAdmin, cachedTeams, TeamController.getAllTeams);
router.get("/fixtures", authToken, authAdmin, cachedFixtures, FixtureController.getAllFixtures);

export default router;

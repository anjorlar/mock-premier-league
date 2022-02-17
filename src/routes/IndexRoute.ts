import { Router, Request, Response } from "express";
import { httpResponse } from "../utils/http_response"
import { createUser } from "../controllers/UserController"
import { loginUser } from "../controllers/UserController"
import { search } from "../controllers/TeamController"
import { cachedSearch } from "../middlewares/Cache"
import AdminRouter from "./AdminRoutes"
import TeamRouter from "./TeamRoute"
import FixtureRouter from "./FixturesRoute"


const router = Router();

router.use("/health", (req: Request, res: Response) => {
    return httpResponse.successResponse(res, [],
        "Mock Premier League Api is Up and Running")
})

//Sub Routes
router.post("/register", createUser)
router.post("/login", loginUser)
router.use("/admin", AdminRouter)
router.use("/teams", TeamRouter)
router.use("/fixtures", FixtureRouter)
router.get("/search", cachedSearch, search)

export default router;

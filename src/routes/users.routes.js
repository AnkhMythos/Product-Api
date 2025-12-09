import { Router } from "express";
import {getAllUsers , getUserById , createUserController, loginUser, updateUserController} from "../controller/user.controller.js"
import { checkAdmin, verifyToken } from "../middlewares/authJWT.js";
// import { authHeaders, soloAdmin } from "../middlewares/auth.js";
// import { basicAuth, checkAdmin } from "../middlewares/authBasic.js";
const router = Router()

router.get('/',verifyToken,checkAdmin, getAllUsers); // 
router.get('/:id',getUserById);

// router.post('/',authHeaders,soloAdmin ,createUserController);
router.post('/' ,createUserController);
router.post('/login',loginUser)

router.put('/:id', updateUserController);


export default router
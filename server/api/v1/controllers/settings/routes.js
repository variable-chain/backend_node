import Express from "express";
import auth from "../../../../helper/auth";
import controller from "./controller";


export default Express.Router()

    .use(auth.verifyToken)
    .put('/changeStatus', controller.changeStatus)

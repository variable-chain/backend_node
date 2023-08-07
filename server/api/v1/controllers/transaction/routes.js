import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";


export default Express.Router()

    .use(auth.verifyToken)

    .get('/list', controller.list)
    .get('/view/:_id', controller.view)








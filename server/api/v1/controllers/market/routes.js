import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";


export default Express.Router()

    .use(auth.verifyToken)

    .get('/graph', controller.graph)
    .post('/order', controller.createOrder)
    .get('/order/:orderId', controller.viewOrder)
    .get('/order', controller.orderList)







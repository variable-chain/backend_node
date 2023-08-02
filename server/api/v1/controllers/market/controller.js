import Joi from "joi";
import _ from "lodash";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import responseMessage from '../../../../../assets/responseMessage';
import commonFunction from '../../../../helper/util';
import status from '../../../../enums/status';
import userType from "../../../../enums/userType";
import actionType from '../../../../enums/actionType';
import orderType from '../../../../enums/orderType';
import orderStatus from '../../../../enums/orderStatus';



//************************** Importing Service file**********************/
import { userServices } from '../../services/user';
const { findUser } = userServices;

import { pairServices } from "../../services/pair";
const { createPair, findPair, updatePair } = pairServices;
import { graphServices } from "../../services/graph";
const { findGraph, graphList, listWithInterval, ohlcGraph } = graphServices;

import { orderServices } from "../../services/order";
const { createOrder, findOrder, updateOrder, orderList } = orderServices;

//***********************************************************************/


export class marketController {



    /**
     * @swagger
     * /market/graph:
     *   get:
     *     tags:
     *       - MARKET
     *     description: graph
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: interval
     *         description: interval ? integer value like, 1, 2, 3 .. etc
     *         in: query
     *         required: false
     *       - name: intervalType
     *         description: intervalType
     *         in: query
     *         enum: [minute, hour, day, week, month, year]
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async graph(req, res, next) {
        const validationSchema = {
            interval: Joi.string().optional(),
            intervalType: Joi.string().optional()
        }
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: userType.USER });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const data = await ohlcGraph(validatedBody);
            return res.json(new response(data, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    //************************ Order Api's ************************/

    /**
     * @swagger
     * /market/order:
     *   post:
     *     tags:
     *       - MARKET
     *     description: order
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: order
     *         description: orderType ? Limit || Market || Conditional && type? Buy || Sell
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/order'
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async createOrder(req, res, next) {
        const validationSchema = {
            symbol: Joi.string().required(),
            price: Joi.number().optional(),
            quantity: Joi.number().required(),
            orderType: Joi.string().allow([orderType.LIMIT, orderType.MARKET, orderType.CONDITIONAL]).required(),
            type: Joi.string().allow([actionType.BUY, actionType.SELL]).required(),
            takeProfitStopLoss: Joi.object().keys({
                takeProfit: Joi.string().optional(),
                stopLoss: Joi.string().optional(),
            })
        }
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            const userResult = await findUser({ _id: req.userId, userType: userType.USER });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const getPairDetails = await findPair({ symbol: validatedBody.symbol });
            if (getPairDetails) {
                validatedBody.pairId = getPairDetails._id;
            }
            validatedBody.price = validatedBody.orderType === orderType.MARKET ? getPairDetails.price : validatedBody.price;
            validatedBody.userId = userResult._id;
            const result = await createOrder(validatedBody);
            return res.json(new response(result, responseMessage.ORDER_CREATED));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /market/order/{orderId}:
     *   get:
     *     tags:
     *       - MARKET
     *     description: viewOrder
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: orderId
     *         description: orderId
     *         in: path
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async viewOrder(req, res, next) {
        const validationSchema = {
            orderId: Joi.string().required(),
        }
        try {
            const validatedBody = await Joi.validate(req.params, validationSchema);
            const userResult = await findUser({ _id: req.userId, userType: userType.USER });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const result = await findOrder({ _id: validatedBody.orderId, status: status.ACTIVE });
            if (!result) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(result, responseMessage.ORDER_DETAILS));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /market/order:
     *   get:
     *     tags:
     *       - MARKET
     *     description: orderList
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async orderList(req, res, next) {
        try {
            const userResult = await findUser({ _id: req.userId, userType: userType.USER });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const result = await orderList({ userId: userResult._id, status: status.ACTIVE });
            if (result.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }


}



export default new marketController()

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

import { orderServices } from "../../services/transaction";
const { findTransaction, transactionList } = orderServices;

//***********************************************************************/


export class transactionController {



    /**
     * @swagger
     * /transaction/list:
     *   get:
     *     tags:
     *       - TRANSACTION
     *     description: to get all users transaction list
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
    async list(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.userId, userType: userType.USER });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const data = await transactionList({ userId: userResult._id });
            if (data.length === 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(data, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }



    /**
     * @swagger
     * /transaction/view/{_id}:
     *   get:
     *     tags:
     *       - TRANSACTION
     *     description: view transaction via _id
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: _id
     *         description: _id
     *         in: path
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async view(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        }
        try {
            const validatedBody = await Joi.validate(req.params, validationSchema);
            const userResult = await findUser({ _id: req.userId, userType: userType.USER });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const result = await findTransaction({ _id: validatedBody._id, status: status.ACTIVE });
            if (!result) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(result, responseMessage.DATA_FOUND));
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



export default new transactionController()

import Joi from "joi";
import _ from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import bcrypt from 'bcryptjs';
import responseMessage from '../../../../../assets/responseMessage';
import commonFunction from '../../../../helper/util';
import jwt from 'jsonwebtoken';
import status from '../../../../enums/status';
import userType, { SUBADMIN } from "../../../../enums/userType";

//************************** Importing Service file**********************/

import { userServices } from '../../services/user';
const { createUser, findUser, updateUser, userList, list } = userServices;
import { socialLinkServices } from '../../services/socialLink';
import { create } from "joi/lib/errors";
const { findSocialLink, findAllSocialLink, updateSocialLink } = socialLinkServices;

//***********************************************************************/




export class subAdminController {

    /**
     * @swagger
     * /admin/addSubAdmin:
     *   post:
     *     tags:
     *       - SUB_ADMIN
     *     description: admin can add subAdmin
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: addSubAdmin
     *         description: addSubAdmin
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/addSubAdmin'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async addSubAdmin(req, res, next) {
        const validationSchema = {
            email: Joi.string().required(),
            name: Joi.string().required(),
            password: Joi.string().required(),
            permissions: Joi.object().keys({
                staticManagement: Joi.boolean().optional(),
                orderPairManagement: Joi.boolean().optional(),
                orderHistoryManagement: Joi.boolean().optional(),
                settingsManagement: Joi.boolean().optional(),
                transactionsManagement: Joi.boolean().optional()
            }),
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!userResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }

            let query = { $and: [{ email: validatedBody.email }] }
            var checkEmail = await findUser(query);
            if (checkEmail) {
                throw apiError.alreadyExist(responseMessage.EMAIL_EXIST);
            }
            if (validatedBody.password) validatedBody.password = bcrypt.hashSync(validatedBody.password);
            validatedBody.userType = userType.SUBADMIN;
            const createdRes = await createUser(validatedBody);
            // var token = await commonFunction.getToken({ _id: createdRes._id, email: createdRes.email, userType: createdRes.userType });
            // await commonFunction.sendMail(createdRes.email, createdRes.name, token)

            return res.json(new response(createdRes, responseMessage.SUBADMIN_CREATED));
        }
        catch (error) {
            return next(error);
        }
    }


    /**
     * @swagger
     * /admin/viewSubAdmin/{_id}:
     *   get:
     *     tags:
     *       - SUB_ADMIN
     *     description: viewSubAdmin details get by _id
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

    async viewSubAdmin(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        };
        try {
            const { _id } = await Joi.validate(req.params, validationSchema);

            const userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            const result = await findUser({ _id: _id, status: { $ne: status.DELETE } });
            if (!result) {
                throw apiError.notFound(responseMessage.SUB_ADMIN_NOT_FOUND);
            }
            return res.json(new response(result, responseMessage.USER_DETAILS));
        } catch (error) {
            return next(error);
        }
    }


    /**
     * @swagger
     * /admin/subAdminList:
     *   get:
     *     tags:
     *       - SUB_ADMIN
     *     description: subAdminList
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: fromDate
     *         description: fromDate
     *         in: query
     *         required: false
     *       - name: toDate
     *         description: toDate
     *         in: query
     *         required: false
     *       - name: page
     *         description: page
     *         in: query
     *         required: false
     *       - name: limit
     *         description: limit
     *         in: query
     *         required: false
     *       - name: search
     *         description: search
     *         in: query
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async subAdminList(req, res, next) {
        const validationSchema = {
            page: Joi.number().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            limit: Joi.number().optional(),
            search: Joi.string().optional()
        }
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            var userResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
            if (!userResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            var result = await list(validatedBody, userType.SUBADMIN);
            return res.json(new response(result, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error)
        }
    }


    /**
     * @swagger
     * /admin/editSubAdmin:
     *   put:
     *     tags:
     *       - SUB_ADMIN
     *     description: editSubAdmin
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: editSubAdmin
     *         description: editSubAdmin
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/editSubAdmin'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async editSubAdmin(req, res, next) {
        var validationSchema = {
            _id: Joi.string().required(),
            name: Joi.string().optional(),
            email: Joi.string().optional(),
            password: Joi.string().optional(),
            permissions: Joi.object().keys({
                staticManagement: Joi.boolean().optional(),
                orderPairManagement: Joi.boolean().optional(),
                orderHistoryManagement: Joi.boolean().optional(),
                settingsManagement: Joi.boolean().optional(),
                transactionsManagement: Joi.boolean().optional()
            }),
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            const adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            const getSubAdminRes = await findUser({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!getSubAdminRes) {
                throw apiError.notFound(responseMessage.SUB_ADMIN_NOT_FOUND);
            }
            if (validatedBody.email) {
                var emailResult = await findUser({ email: validatedBody.email, _id: { $ne: getSubAdminRes._id }, status: { $ne: status.DELETE } });
                if (emailResult) {
                    throw apiError.conflict(responseMessage.EMAIL_EXIST);
                }
            }
            if (validatedBody.mobileNumber) {
                var mobileResult = await findUser({ mobileNumber: validatedBody.mobileNumber, _id: { $ne: getSubAdminRes._id }, status: { $ne: status.DELETE } });
                if (mobileResult) {
                    throw apiError.conflict(responseMessage.MOBILE_EXIST);
                }
            }
            const result = await updateUser({ _id: getSubAdminRes._id }, { $set: validatedBody })
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }



    /**
     * @swagger
     * /admin/deleteSubAdmin/{_id}:
     *   delete:
     *     tags:
     *       - SUB_ADMIN
     *     description: deleteSubAdmin
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

    async deleteSubAdmin(req, res, next) {
        var validationSchema = {
            _id: Joi.string().required()
        };
        try {
            console.log("eeee==", req.params)
            const { _id } = await Joi.validate(req.params, validationSchema);
            let adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            const getSubAdminRes = await findUser({ _id: _id, status: { $ne: status.DELETE } });
            if (!getSubAdminRes) {
                throw apiError.notFound(responseMessage.SUB_ADMIN_NOT_FOUND);
            }

            var result = await updateUser({ _id: getSubAdminRes._id }, { status: status.DELETE })
            return res.json(new response(result, responseMessage.DELETE_SUCCESS));
        }
        catch (error) {
            console.log("error==>>", error);
            return next(error);
        }
    }


}

export default new subAdminController()


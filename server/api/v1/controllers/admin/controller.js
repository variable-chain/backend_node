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
import userType from "../../../../enums/userType";

//************************* Importing Service file ***********************/

import { userServices } from '../../services/user';
const { findUser, updateUser, userList } = userServices;
import { socialLinkServices } from '../../services/socialLink';
const { findSocialLink, findAllSocialLink, updateSocialLink } = socialLinkServices;
import { pairServices } from "../../services/pair";
const { createPair, findPair, updatePair, pairList } = pairServices;

//************************************************************************/




export class adminController {

    /**
     * @swagger
     * /admin/login:
     *   post:
     *     tags:
     *       - ADMIN
     *     description: login
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: login
     *         description: login
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/login'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async login(req, res, next) {
        const validationSchema = {
            email: Joi.string().required(),
            password: Joi.string().required()
        };
        try {
            const { email, password } = await Joi.validate(req.body, validationSchema);
            const query = { $and: [{ userType: userType.ADMIN }, { email: email }] };
            const userResult = await findUser(query);
            if (!userResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            if (!bcrypt.compareSync(password, userResult.password)) {
                throw apiError.invalid(responseMessage.INCORRECT_LOGIN);
            }

            const token = await commonFunction.getToken({ _id: userResult._id, email: userResult.email, userType: userResult.userType });
            const obj = {
                _id: userResult._id,
                name: userResult.name,
                email: userResult.email,
                token: token,
                userType: userResult.userType,
                permissions: userResult.permissions
            }
            return res.json(new response(obj, responseMessage.LOGIN));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/forgotPassword:
     *   post:
     *     tags:
     *       - ADMIN
     *     description: forgotPassword
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: forgotPassword
     *         description: forgotPassword
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/forgotPassword'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async forgotPassword(req, res, next) {
        const validationSchema = {
            email: Joi.string().required(),
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            const { email } = validatedBody;
            const userResult = await findUser({ email: email });
            if (!userResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            const token = await commonFunction.getToken({ _id: userResult._id, userName: userResult.userName, email: userResult.email, mobileNumber: userResult.mobileNumber, userType: userResult.userType });
            await commonFunction.sendMail(userResult.email, userResult.name, token)
            await updateUser({ _id: userResult._id }, { isReset: false })
            return res.json(new response({}, responseMessage.RESET_LINK_SEND));
        }
        catch (error) {
            return next(error);
        }
    }


    /**
     * @swagger
     * /admin/resetPassword/{token}:
     *   put:
     *     tags:
     *       - ADMIN
     *     description: resetPassword
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: path
     *         required: true
     *       - name: resetPassword
     *         description: resetPassword
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/resetPassword'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async resetPassword(req, res, next) {
        const validationSchema = {
            newPassword: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            const { token } = req.params;
            const result = jwt.verify(token, config.get('jwtsecret'));
            const userResult = await findUser({ _id: result._id });
            if (!userResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            if (userResult.isReset == true) {
                throw apiError.badRequest(responseMessage.LINK_EXPIRED);
            }
            await updateUser({ _id: userResult._id }, { isReset: true, password: bcrypt.hashSync(validatedBody.newPassword) })
            return res.json(new response({}, responseMessage.PWD_CHANGED));

        }
        catch (error) {
            return next(error);
        }
    }


    /**
     * @swagger
     * /admin/profile:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: profile
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

    async profile(req, res, next) {
        try {
            const userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            return res.json(new response(userResult, responseMessage.USER_DETAILS));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/editProfile:
     *   put:
     *     tags:
     *       - ADMIN
     *     description: editProfile
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: name
     *         description: name
     *         in: formData
     *         required: false
     *       - name: email
     *         description: email
     *         in: formData
     *         required: false
     *       - name: countryCode
     *         description: countryCode
     *         in: formData
     *         required: false
     *       - name: mobileNumber
     *         description: mobileNumber
     *         in: formData
     *         required: false
     *       - name: profilePic
     *         description: profilePic
     *         in: formData
     *         type: file
     *         required: false
     *       - name: coverImage
     *         description: coverImage
     *         in: formData
     *         type: file
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async editProfile(req, res, next) {
        var validationSchema = {
            name: Joi.string().optional(),
            email: Joi.string().optional(),
            countryCode: Joi.string().optional(),
            mobileNumber: Joi.string().optional(),
            profilePic: Joi.string().optional(),
            coverImage: Joi.string().optional(),
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            const adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            if (validatedBody.email) {
                const emailResult = await findUser({ email: validatedBody.email, _id: { $ne: adminResult._id }, status: { $ne: status.DELETE } });
                if (emailResult) {
                    throw apiError.conflict(responseMessage.EMAIL_EXIST);
                }
            }
            if (validatedBody.mobileNumber) {
                const mobileResult = await findUser({ mobileNumber: validatedBody.mobileNumber, _id: { $ne: adminResult._id }, status: { $ne: status.DELETE } });
                if (mobileResult) {
                    throw apiError.conflict(responseMessage.MOBILE_EXIST);
                }
            }
            if (req.files || req.files.length != 0) {
                validatedBody.profilePic = await commonFunction.getImageUrlByPathObj(req['files'].find((o) => { return o.fieldname == 'profilePic' }));
                validatedBody.coverImage = await commonFunction.getImageUrlByPathObj(req['files'].find((o) => { return o.fieldname == 'coverImage' }));
            }
            const result = await updateUser({ _id: adminResult._id }, { $set: validatedBody })
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/user/{_id}:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: viewUser
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

    async viewUser(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        }
        try {
            const { _id } = await Joi.validate(req.params, validationSchema);
            const adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            const result = await findUser({ _id: _id, status: { $ne: status.DELETE } });
            return res.json(new response(result, responseMessage.DETAILS_FETCHED));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/blockUnblockUser:
     *   patch:
     *     tags:
     *       - ADMIN
     *     description: blockUnblockUser
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: blockUnblockUser
     *         description: blockUnblockUser
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/blockUnblockUser'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async blockUnblockUser(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            status: Joi.string().valid(status.ACTIVE, status.BLOCK).required()
        }
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            const userResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
            if (!userResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            const subResult = await findUser({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!subResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const result = await updateUser({ _id: subResult._id }, { status: validatedBody.status })
            return res.json(new response(result, validatedBody.status == status.BLOCK ? responseMessage.BLOCK_SUCCESS : responseMessage.UNBLOCK_SUCCESS));
        }
        catch (error) {
            return next(error)
        }
    }

    /**
     * @swagger
     * /admin/user:
     *   delete:
     *     tags:
     *       - ADMIN
     *     description: deleteUser
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: _id
     *         description: _id
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async deleteUser(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        }
        try {
            const { _id } = await Joi.validate(req.query, validationSchema);
            const userResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
            if (!userResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            const subResult = await findUser({ _id: _id, status: { $ne: status.DELETE } });
            if (!subResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const result = await updateUser({ _id: subResult._id }, { status: status.DELETE })
            return res.json(new response(result, responseMessage.DELETE_SUCCESS));
        }
        catch (error) {
            return next(error)
        }
    }

    /**
     * @swagger
     * /admin/userList:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: userList
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

    async userList(req, res, next) {
        const validationSchema = {
            page: Joi.number().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            limit: Joi.number().optional(),
            search: Joi.string().optional()
        }
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            const userResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
            if (!userResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            const result = await userList(validatedBody);
            return res.json(new response(result, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error)
        }
    }


    /**
     * @swagger
     * /admin/socialLinkList:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: socialLinkList
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

    async socialLinkList(req, res, next) {
        try {
            const adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            const result = await findAllSocialLink({ status: { $ne: status.DELETE } });
            return res.json(new response(result, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/socialLink:
     *   put:
     *     tags:
     *       - ADMIN
     *     description: editSocialLink
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: editSocialLink
     *         description: editSocialLink
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/editSocialLink'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async editSocialLink(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            link: Joi.string().required()
        }
        try {
            const { _id, link } = await Joi.validate(req.body, validationSchema);
            const adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            const socialLinkResult = await findSocialLink({ _id: _id, status: status.ACTIVE });
            if (!socialLinkResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            const result = await updateSocialLink({ _id: socialLinkResult._id }, { $set: { link: link } });
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }
    //************************************** Pair Management *************************/

    /**
     * @swagger
     * /admin/pairLists:
     *   get:
     *     tags:
     *       - ADMIN PAIR DASHBOARD
     *     description: pairList
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

    async pairLists(req, res, next) {
        try {
            var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let result = await pairList({ status: { $ne: status.DELETE } });
            return res.json(new response(result, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }


    /**
     * @swagger
     * /admin/viewPair/{_id}:
     *   get:
     *     tags:
     *       - ADMIN PAIR DASHBOARD
     *     description: viewPair
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

    async viewPair(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        }
        try {
            const { _id } = await Joi.validate(req.params, validationSchema);
            const adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN })
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            const result = await findPair({ _id: _id, status: { $ne: status.DELETE } });
            if (!result) {
                throw apiError.notFound(responseMessage.PAIR_NOT_FOUND);
            }
            return res.json(new response(result, responseMessage.DETAILS_FETCHED));

        }
        catch (error) {
            return next(error)
        }
    }

    /**
     * @swagger
     * /admin/activeInactivePair:
     *   put:
     *     tags:
     *       - ADMIN PAIR DASHBOARD
     *     description: activeInactivePair
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: activeInactivePair
     *         description: activeInactivePair
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/activeInactivePair'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async activeInactivePair(req, res, next) {
        const validationSchema = {
            pairId: Joi.string().required()
        }
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            const adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            const findResult = await findPair({ _id: validatedBody.pairId, status: status.ACTIVE });
            if (!findResult) {
                throw apiError.notFound(responseMessage.PAIR_NOT_FOUND);
            }
            const action = findResult.isActive ? (findResult.isActive === true ? false : true) : true;
            const message = action === true ? "activated" : "deactivated";
            const result = await updatePair({ _id: findResult._id }, { isActive: action });
            return res.json(new response({}, responseMessage.PAIR_ACTION(message)));
        }
        catch (error) {
            return next(error);
        }
    }


    // /**
    //  * @swagger
    //  * /admin/editPair:
    //  *   put:
    //  *     tags:
    //  *       - ADMIN PAIR DASHBOARD
    //  *     description: editPair
    //  *     produces:
    //  *       - application/json
    //  *     parameters:
    //  *       - name: token
    //  *         description: token
    //  *         in: header
    //  *         required: true
    //  *       - name: editPair
    //  *         description: editPair
    //  *         in: body
    //  *         required: true
    //  *         schema:
    //  *           $ref: '#/definitions/editPair'
    //  *     responses:
    //  *       200:
    //  *         description: Returns success message
    //  */

    async editPair(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            // link: Joi.string().required()
        }
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            const adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            const findResult = await findPair({ _id: validatedBody._id, status: status.ACTIVE });
            if (!findResult) {
                throw apiError.notFound(responseMessage.PAIR_NOT_FOUND);
            }
            const result = await updateSocialLink({ _id: findResult._id }, validatedBody);
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }

}

export default new adminController()


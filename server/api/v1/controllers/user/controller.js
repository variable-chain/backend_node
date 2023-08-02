import Joi from "joi";
import _ from "lodash";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import responseMessage from '../../../../../assets/responseMessage';
import commonFunction from '../../../../helper/util';
import status from '../../../../enums/status';
import userType from "../../../../enums/userType";

//************************** Importing Service file**********************/
import { userServices } from '../../services/user';
const { createUser, findUser, updateUser } = userServices;
import { socialLinkServices } from '../../services/socialLink';
const { findAllSocialLink } = socialLinkServices;
//***********************************************************************/


export class userController {

    /**
     * @swagger
     * /user/connectWallet:
     *   post:
     *      tags:
     *       - USER
     *      description: connectWallet
     *      produces:
     *        - application/json
     *      parameters:
     *        - name: connectWallet
     *          description: connectWallet
     *          in: body
     *          required: true
     *          schema:
     *           $ref: '#/definitions/connectWallet'
     *      responses:
     *       200:
     *         description: Wallet connected successfully.
     *       500:
     *         description: Internal Server Error.
     *       501:
     *         description: Something went wrong!
     */
    async connectWallet(req, res, next) {
        const validationSchema = {
            walletAddress: Joi.string().required()
        }
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let resultRes = await findUser({ walletAddress: validatedBody.walletAddress, status: { $ne: status.DELETE } })
            if (resultRes) {
                var token = await commonFunction.getToken({ _id: resultRes._id, userType: resultRes.userType });
                var obj = {
                    _id: resultRes._id,
                    walletAddress: resultRes.walletAddress,
                    userType: resultRes.userType,
                    token: token
                }
                return res.json(new response(obj, responseMessage.LOGIN));
            }
            else {
                let saveRes = await createUser(validatedBody)
                var token = await commonFunction.getToken({ _id: saveRes._id, userType: saveRes.userType });
                var obj = {
                    _id: saveRes._id,
                    walletAddress: saveRes.walletAddress,
                    userType: saveRes.userType,
                    token: token
                }
                return res.json(new response(obj, responseMessage.LOGIN));
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/getProfile:
     *   get:
     *     tags:
     *       - USER
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
    async getProfile(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.userId, userType: userType.USER });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var result = {
                _id: userResult._id,
                walletAddress: userResult.walletAddress,
                name: userResult.name,
                email: userResult.email,
                userType: userResult.userType
            }
            return res.json(new response(result, responseMessage.USER_DETAILS));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/editProfile:
     *   put:
     *     tags:
     *       - USER
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
        try {
            let userResult = await findUser({ _id: req.userId, userType: userType.USER });
            if (!userResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            if (req.body.email && req.body.email != '') {
                var emailResult = await findUser({ email: req.body.email, _id: { $ne: userResult._id }, status: { $ne: status.DELETE } });
                if (emailResult) {
                    throw apiError.conflict(responseMessage.EMAIL_EXIST);
                }
            }
            if (req.body.mobileNumber && req.body.mobileNumber != '') {
                var mobileResult = await findUser({ mobileNumber: req.body.mobileNumber, _id: { $ne: userResult._id }, status: { $ne: status.DELETE } });
                if (mobileResult) {
                    throw apiError.conflict(responseMessage.MOBILE_EXIST);
                }
            }
            if (req.files && req.files.length != 0) {
                if (req['files'].find((o) => { return o.fieldname == 'profilePic' })) { req.body.profilePic = await commonFunction.getImageUrlByPathObj(req['files'].find((o) => { return o.fieldname == 'profilePic' })) };
                if (req['files'].find((o) => { return o.fieldname == 'coverImage' })) { req.body.coverImage = await commonFunction.getImageUrlByPathObj(req['files'].find((o) => { return o.fieldname == 'coverImage' })) };
            }
            var result = await updateUser({ _id: userResult._id }, { $set: req.body })
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        }
        catch (error) {
            return next(error);
        }
    }


    /**
    * @swagger
    * /user/socialLinks:
    *   get:
    *     tags:
    *       - USER
    *     description: getSocialLinks
    *     produces:
    *       - application/json
    *     responses:
    *       200:
    *         description: Returns success message
    */

    async getSocialLinks(req, res, next) {
        try {
            let result = await findAllSocialLink({ status: status.ACTIVE });
            return res.json(new response(result, responseMessage.DATA_FOUND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/uploadFile:
     *   post:
     *     tags:
     *       - USER
     *     description: uploadFile
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: file
     *         description: file
     *         in: formData
     *         type: file
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async uploadFile(req, res, next) {
        try {
            let result = await commonFunction.getImageUrl(req.files);
            return res.json(new response(result, responseMessage.UPLOAD_SUCCESS));

        }
        catch (error) {
            return next(error);
        }
    }

}



export default new userController()

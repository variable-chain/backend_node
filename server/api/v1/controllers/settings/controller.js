import Joi from "joi";
import _ from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import responseMessage from '../../../../../assets/responseMessage';

import status from '../../../../enums/status';



//************************** Importing Service file**********************/
import { settingsServices } from '../../services/settings';
const { findSettings, updateSettings } = settingsServices;

//***********************************************************************/

export class settingController {


    /**
     * @swagger
     * /setting/changeStatus:
     *   put:
     *     tags:
     *       - SETTINGS
     *     description: changeStatus, isServerMaintanance ? true || false
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: isServerMaintanance
     *         description: isServerMaintanance
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async changeStatus(req, res, next) {
        const validationSchema = {
            isServerMaintanance: Joi.boolean().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            const result = await findSettings({ status: { $ne: status.DELETE } });
            if (!result) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            const updatedRes = await updateSettings({ _id: result._id }, validatedBody);
            return res.json(new response(updatedRes, responseMessage.UPDATE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }



}

export default new settingController()
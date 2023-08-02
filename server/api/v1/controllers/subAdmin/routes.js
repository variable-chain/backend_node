import Express from "express";
import controller from "./controller";
import auth from '../../../../helper/auth';
import upload from '../../../../helper/uploadHandler';


export default Express.Router()

   

    .use(auth.verifyToken)
    .post('/addSubAdmin', controller.addSubAdmin)
    .get('/viewSubAdmin/:_id', controller.viewSubAdmin)
    .get('/subAdminList', controller.subAdminList)
    .delete('/deleteSubAdmin/:_id', controller.deleteSubAdmin)
    
    
    .use(upload.uploadFile)
    .put('/editSubAdmin', controller.editSubAdmin)
    // .put('/editProfile', controller.editProfile)

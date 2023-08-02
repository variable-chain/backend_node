import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';



export default Express.Router()
    .post('/connectWallet', controller.connectWallet)
    .get('/socialLinks', controller.getSocialLinks)
 
    .use(auth.verifyToken)
    .get('/getProfile', controller.getProfile)

 
    .use(upload.uploadFile)
    .put('/editProfile', controller.editProfile)
    .post('/uploadFile', controller.uploadFile)


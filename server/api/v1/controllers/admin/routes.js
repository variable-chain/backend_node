import Express from "express";
import controller from "./controller";
import auth from '../../../../helper/auth';
import upload from '../../../../helper/uploadHandler';


export default Express.Router()

    .post('/login', controller.login)
    .post('/forgotPassword', controller.forgotPassword)
    .put('/resetPassword/:token', controller.resetPassword)

    .use(auth.verifyToken)

    .get('/profile', controller.profile)
    .get('/user/:_id', controller.viewUser)
    .patch('/blockUnblockUser', controller.blockUnblockUser)
    .delete('/user', controller.deleteUser)
    .get('/userList', controller.userList)
    .get('/socialLinkList', controller.socialLinkList)
    .put('/socialLink', controller.editSocialLink)

    //*************** Pair Dashboard *******************/
    .get('/pairLists', controller.pairLists)
    .get('/viewPair/:_id', controller.viewPair)
    .put('/activeInactivePair', controller.activeInactivePair)
    .put('/editPair', controller.editPair)



    .use(upload.uploadFile)
    .put('/editProfile', controller.editProfile)

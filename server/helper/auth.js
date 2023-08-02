import config from "config";
import jwt from "jsonwebtoken";
import apiError from './apiError';
import responseMessage from '../../assets/responseMessage';
import userModel from '../models/user';
import status from '../enums/status';
import requestIp from 'request-ip';
const parseIP = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
module.exports = {
  verifyToken(req, res, next) {
    try {
      let ip = requestIp.getClientIp(req).match(parseIP);
      if (ip && ip.length != 0) {
        console.log('Request User IP Address', ip[0]);
      }
      if (req.headers.token) {
        jwt.verify(req.headers.token, config.get('jwtsecret'), (err, result) => {
          if (err) {
            throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
          }
          else {
            userModel.findOne({ _id: result._id }, (error, result2) => {
              if (error) {
                return next(error)
              }
              else if (!result2) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
              }
              else {
                if (result2.status == status.BLOCK) {
                  throw apiError.forbidden(responseMessage.BLOCK_BY_ADMIN);
                }
                else if (result2.status == status.DELETE) {
                  throw apiError.unauthorized(responseMessage.DELETE_BY_ADMIN);
                }
                else {
                  req.userId = result2._id;
                  req.userDetails = result
                  next();
                }
              }
            })
          }
        })
      } else {
        throw apiError.badRequest(responseMessage.NO_TOKEN);
      }
    } catch (error) {
      return next(error)
    }

  },
}

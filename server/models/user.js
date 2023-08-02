import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import bcrypt from "bcryptjs";
import tableName from "../enums/tableName";
import userType from "../enums/userType";
import status from '../enums/status';
import adminDetails from '../../config/adminDetails.json';

const options = {
    collection: tableName.user,
    timestamps: true,
};

const userModel = new Schema(
    {
        name: { type: String },
        walletAddress: { type: String },
        email: { type: String },
        isReset: { type: Boolean },
        countryCode: { type: String },
        mobileNumber: { type: String },
        country: { type: String },
        profilePic: { type: String, default: "" },
        coverImage: { type: String },
        deviceToken: { type: String },
        userType: { type: String, default: userType.USER, enum: [userType.USER, userType.ADMIN, userType.SUBADMIN] },
        password: { type: String },
        permissions: {
            staticManagement: { type: Boolean },
            orderPairManagement: { type: Boolean },
            orderHistoryManagement: { type: Boolean },
            settingsManagement: { type: Boolean },
            transactionsManagement: { type: Boolean },
        },
        status: {
            type: String,
            enum: [status.ACTIVE, status.BLOCK, status.DELETE],
            default: status.ACTIVE
        }

    },
    options
);
userModel.plugin(mongoosePaginate);
userModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model(tableName.user, userModel);

(async () => {
    const adminResult = await Mongoose.model(tableName.user, userModel).find({ userType: userType.ADMIN })
    if (adminResult.length != 0) {
        console.log("Default admin already created.");
    } else {
        let obj = {
            name: adminDetails.name,
            email: adminDetails.email,
            walletAddress: adminDetails.walletAddress,
            userType: userType.ADMIN,
            password: bcrypt.hashSync(adminDetails.password),
            countryCode: adminDetails.countryCode,
            mobileNumber: adminDetails.mobileNumber,
            country: adminDetails.country,
            permissions: {
                staticManagement: true,
                orderPairManagement: true,
                orderHistoryManagement: true,
                settingsManagement: true,
                transactionsManagement: true,
            }
        }

        let result = await Mongoose.model(tableName.user, userModel).create(obj);
        if (result) {
            console.log("Default admin created", result);
        }
    }

}).call();

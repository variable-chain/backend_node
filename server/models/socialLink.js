import Mongoose, { Schema } from "mongoose";
import status from '../enums/status';
import linkType from '../enums/socialLink';
import tableName from "../enums/tableName";

const options = {
    collection: tableName.staticLink,
    timestamps: true
};

const schemaDefination = new Schema(
    {
        title: { type: String },
        link: { type: String },
        status: { type: String, default: status.ACTIVE }
    },
    options
);

module.exports = Mongoose.model(tableName.staticLink, schemaDefination);

(async () => {
    const result = await Mongoose.model(tableName.staticLink, schemaDefination).find({ status: { $ne: status.DELETE } });
    if (result.length != 0) {
        console.log("Default social link already created.");
    } else {
        let obj1 = {
            title: linkType.socialEnum[0],
            link: linkType.Facebook
        }
        let obj2 = {
            title: linkType.socialEnum[1],
            link: linkType.Twitter
        }
        let obj3 = {
            title: linkType.socialEnum[2],
            link: linkType.Instagram
        }
        let obj4 = {
            title: linkType.socialEnum[3],
            link: linkType.Telegram
        }
        let obj5 = {
            title: linkType.socialEnum[4],
            link: linkType.Medium
        }
        const staticResult = await Mongoose.model(tableName.staticLink, schemaDefination).create(obj1, obj2, obj3, obj4, obj5);
        if (staticResult) {
            console.log("Default social link created.", staticResult)
        }
    }
}).call();



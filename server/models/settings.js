import Mongoose, { Schema } from "mongoose";
import status from '../enums/status';
import tableName from "../enums/tableName";

const options = {
    collection: tableName.settings,
    timestamps: true
};

const settingsModel = new Schema(
    {
        isServerMaintainance: { type: Boolean, default:false },
        status: { type: String, default: status.ACTIVE }
    },
    options
);

module.exports = Mongoose.model(tableName.settings, settingsModel);
(async () => {
    const result = await Mongoose.model(tableName.settings, settingsModel).find({});
    if (result.length != 0) {
        console.log("Default static settings created.")
    } else {

        const created = await Mongoose.model(tableName.settings, settingsModel).create({
            isServerMaintainance:false
        });
        if (created) console.log("Static content settings created.", created);
    }
}).call();


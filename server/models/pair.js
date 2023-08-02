import Mongoose, { Schema } from "mongoose";
import status from '../enums/status';
import currency from '../enums/currency';
import tableName from "../enums/tableName";

const options = {
    collection: tableName.pair,
    timestamps: true
};

const schemaDefination = new Schema(
    {
        symbol: { type: String },
        price: { type: Number },
        high: { type: Number },
        low: { type: Number },
        open: { type: Number },
        close: { type: Number },
        isActive: { type: Boolean },
        currencyType: { type: String, default: currency.USD },
        status: { type: String, default: status.ACTIVE }
    },
    options
);

module.exports = Mongoose.model(tableName.pair, schemaDefination);




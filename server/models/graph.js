import Mongoose, { Schema } from "mongoose";
import status from '../enums/status';
import currency from '../enums/currency';
import tableName from "../enums/tableName";

const options = {
    collection: tableName.graph,
    timestamps: true
};

const schemaDefination = new Schema(
    {
        pairId: { type: Schema.Types.ObjectId, ref: tableName.pair },
        symbol: { type: String },
        price: { type: Number },
        timestamp: { type: Date },
        currencyType: { type: String, default: currency.USD },
        status: { type: String, default: status.ACTIVE }
    },
    options
);

module.exports = Mongoose.model(tableName.graph, schemaDefination);




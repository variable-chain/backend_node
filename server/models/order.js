import Mongoose, { Schema } from "mongoose";
import status from '../enums/status';
import actionType from '../enums/actionType';
import orderType from '../enums/orderType';
import orderStatus from '../enums/orderStatus';

import tableName from "../enums/tableName";

const options = {
    collection: tableName.order,
    timestamps: true
};

const schemaDefination = new Schema(
    {
        userId: { type: Mongoose.Types.ObjectId, ref: tableName.user },
        pairId: { type: Mongoose.Types.ObjectId, ref: tableName.pair },
        symbol: { type: String },
        price: { type: Number },
        quantity: { type: Number },
        takeProfitStopLoss: {
            takeProfit: {
                type: String
            },
            stopLoss: {
                type: String
            }
        },
        orderType: { type: String, enum: [orderType.LIMIT, orderType.MARKET, orderType.CONDITIONAL] },
        type: { type: String, enum: [actionType.BUY, actionType.SELL] },
        orderStatus: { type: String, default: orderStatus.Pending },
        status: { type: String, default: status.ACTIVE }
    },
    options
);

module.exports = Mongoose.model(tableName.order, schemaDefination);




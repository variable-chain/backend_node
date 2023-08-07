import Mongoose, { Schema } from "mongoose";
import status from '../enums/status';
import transactionStatusType from '../enums/transactionStatusType';
import tableName from "../enums/tableName";

const options = {
    collection: tableName.transaction,
    timestamps: true
};

const schemaDefination = new Schema(
    {
        userId: { type: Mongoose.Types.ObjectId, ref: tableName.user },
        pairId: { type: Mongoose.Types.ObjectId, ref: tableName.pair },
        orderId: { type: Mongoose.Types.ObjectId, ref: tableName.order },
        price: { type: Number },
        transactionStatus: { type: String, enum: [transactionStatusType.SUCCESS, transactionStatusType.FAILED], default: transactionStatusType.SUCCESS },
        status: { type: String, default: status.ACTIVE }
    },
    options
);

module.exports = Mongoose.model(tableName.pair, schemaDefination);




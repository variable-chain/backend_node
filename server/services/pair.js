
import mongoose, { Mongoose } from "mongoose";
import pairModel from "../models/pair";
import tableName from "../enums/tableName";
import actionType from "../enums/actionType";
import orderType from "../enums/orderType";
import orderStatus from "../enums/orderStatus";


const pairServices = {

    createPair: async (insertObj) => {
        return await pairModel.create(insertObj);
    },

    findPair: async (query) => {
        return await pairModel.findOne(query);
    },

    updatePair: async (query, updateObj) => {
        return await pairModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    pairList: async (query) => {
        return await pairModel.find(query).select('-createdAt -updatedAt -__v -status -isActive');
    },


    pairOHLC: async (pairId) => {
        var twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);

        const data = await pairModel.aggregate([
            {
                $match: { _id: mongoose.Types.ObjectId(pairId) }
            },
            {
                $lookup: {
                    from: tableName.graph,
                    let: { pairId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$pairId", "$$pairId"] },
                                        // { $gte: ["$timestamp", twentyFourHoursAgo] },
                                        // { $lt: ["$timestamp", new Date()] }
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                open: { $first: "$price" },
                                high: { $max: "$price" },
                                low: { $min: "$price" },
                                close: { $last: "$price" }
                            }
                        }
                    ],
                    as: "ohlcData"
                }
            },
            {
                $unwind: "$ohlcData"
            },
            {
                $lookup: {
                    from: tableName.order,
                    let: { pairId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$pairId", "$$pairId"] },
                                type: actionType.BUY,
                                orderStatus: orderStatus.Pending
                            }
                        }
                    ],
                    as: "bids"
                }
            },
            {
                $lookup: {
                    from: tableName.order,
                    let: { pairId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$pairId", "$$pairId"] },
                                type: actionType.SELL,
                                orderStatus: orderStatus.Pending
                            }
                        }
                    ],
                    as: "asks"
                }
            },

            {
                $project: {
                    _id: 1,
                    symbol: 1,
                    price: 1,
                    currencyType: 1,
                    status: 1,
                    open: "$ohlcData.open",
                    close: "$ohlcData.close",
                    high: "$ohlcData.high",
                    low: "$ohlcData.low",
                    percentageChange: { $divide: [{ $subtract: ['$ohlcData.close', '$ohlcData.open'] }, '$ohlcData.open'] },
                    bids: ["$bids.price","$bids.quantity"],
                    // asks: 1
                    asks: ["$asks.price","$asks.quantity"]
                },
            },
        ]);
        return data.length > 0 ? data[0] : [];

    },

    pairListWithOHLC: async (query) => {
        var twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);

        return await pairModel.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "graph",
                    let: { pairId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$pairId", "$$pairId"] },
                                        // { $gte: ["$timestamp", twentyFourHoursAgo] },
                                        { $lt: ["$timestamp", new Date()] }
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                open: { $first: "$price" },
                                high: { $max: "$price" },
                                low: { $min: "$price" },
                                close: { $last: "$price" }
                            }
                        }
                    ],
                    as: "ohlcData"
                }
            },
            {
                $unwind: "$ohlcData"
            },
            {
                $project: {
                    _id: 1,
                    symbol: 1,
                    price: 1,
                    currencyType: 1,
                    status: 1,
                    open: "$ohlcData.open",
                    close: "$ohlcData.close",
                    high: "$ohlcData.high",
                    low: "$ohlcData.low",
                    percentageChange: { $divide: [{ $subtract: ['$ohlcData.close', '$ohlcData.open'] }, '$ohlcData.open'] }
                },
            },
        ]);

    }

}

module.exports = { pairServices };

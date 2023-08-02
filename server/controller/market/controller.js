
import _ from "lodash";
const cronJob = require("cron").CronJob;
import actionType from "../../enums/actionType";
import orderStatusType from "../../enums/orderStatus";

import matchCond from '../../helper/market/utils';

//******************** Importing services ********************/
import { orderServices } from "../../services/order";
import status from "../../enums/status";
const { createOrder, updateOrder, orderList } = orderServices;
//************************************************************/

class MatchingEngine {
    constructor() {
        this.buyOrderBook = [];
        this.sellOrderBook = [];
        this.stopOrders = [];
    }

    cronJob() {
        let limitCron = new cronJob('*/10 * * * * *', async function () {
            try {
                console.log("Order pool matching engine starting.....");
                let [buyOrderBook, sellOrderBook] = await Promise.all([
                    pool_orderList(actionType.BUY),
                    pool_orderList(actionType.SELL),
                ]);
                if (buyOrderBook.length > 0 && sellOrderBook.length > 0) {
                    const getMatchedPair = matchCond.matchPairs(buyOrderBook, sellOrderBook);
                    if (Object.keys(getMatchedPair).length > 0) {
                        const matchedata = matchCond.processOrders(getMatchedPair);
                        // limitCron.stop();
                    console.log('matchedata===.>>', matchedata);

                    return

                        await historyManage(matchedata)
                        limitCron.start();
                    }
                }
            } catch (error) {
                limitCron.stop();
                limitCron.start();
                console.log("error===>>>", error);
            }
        })
        limitCron.start();

        let marketCron = new cronJob('*/10 * * * * *', async function () {
            try {
                console.log("Order pool matching engine starting.....");
                let [buyOrderBook, sellOrderBook] = await Promise.all([
                    pool_orderList(actionType.BUY),
                    pool_orderList(actionType.SELL),
                ]);
                if (buyOrderBook.length > 0 && sellOrderBook.length > 0) {
                    const getMatchedPair = matchCond.matchPairs(buyOrderBook, sellOrderBook);
                    if (Object.keys(getMatchedPair).length > 0) {
                        const matchedata = matchCond.processOrders(getMatchedPair);
                        // marketCron.stop();
                    console.log('matchedata===.>>', matchedata);

                    return

                        await historyManage(matchedata)
                        marketCron.start();
                    }
                }
            } catch (error) {
                marketCron.stop();
                marketCron.start();
                console.log("error===>>>", error);
            }
        })
        marketCron.start();

    }



}

// to fetch records from database for both buy and sell pair
const pool_orderList = async (type) => {
    try {
        const poolRes = await orderList({ type: type, status: status.ACTIVE, orderStatus: orderStatusType.Pending });
        if (poolRes.length > 0) {
            return poolRes;
        } else {
            return [];
        }

    } catch (error) {
        console.log("getCoinList error==>>", error);
    }
}

const historyManage = async (matchedata) => {
    // console.log("matchdata==>", matchedata.fullyFilled);
    let remainingOrder;
    if (matchedata.partiallyFilled.length > 0) {
        await updateOrder({ _id: matchedata.partiallyFilled[0]._id }, { quantity: matchedata.fullyFilled[0].matchedQuantity, orderStatus: orderStatusType.PartiallyFilled });
    }
    if (matchedata.fullyFilled.length > 0) {
        if (matchedata.partiallyFilled.length === 0 && matchedata.remainingAmount.length === 0) {
            await Promise.all([
                updateOrder({ _id: matchedata.fullyFilled[0].buyOrder._id }, { orderStatus: orderStatusType.Filled }),
                updateOrder({ _id: matchedata.fullyFilled[0].sellOrder._id }, { orderStatus: orderStatusType.Filled })
            ]);
        } else {
            await updateOrder({ _id: matchedata.fullyFilled[0]._id }, { orderStatus: orderStatusType.Filled });
        }
    }
    if (matchedata.remainingAmount.length > 0) {
        matchedata.remainingAmount[0]["parentOrderId"] = matchedata.partiallyFilled[0]._id;
        remainingOrder = JSON.parse(JSON.stringify(matchedata.remainingAmount))[0];
        remainingOrder["orderStatus"] = orderStatusType.Pending;
        delete remainingOrder._id;
        delete remainingOrder.createdAt;
        delete remainingOrder.updatedAt;
        if (remainingOrder.quantity.toFixed(2) > 0) {
            await createOrder(remainingOrder)
        }
    }

    return true;

}





const matchingEngine = new MatchingEngine();


//*********************Cron scheduler***********************/
matchingEngine.cronJob(); // to match order at same pair and same price

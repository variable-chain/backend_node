
import _ from "lodash";
const cronJob = require("cron").CronJob;
import fetchPrice from "../helper/crypto/pairPrice";
import allPairs from "../helper/crypto/pairs.json";

//******************** Importing services ********************/
import { pairServices } from "../services/pair";
const { createPair, findPair, updatePair } = pairServices;
import { graphServices } from "../services/graph";
const { createGraph, findGraph, priceIn24Hour, openPrice, closePrice, graphList } = graphServices;
//************************************************************/


let pairJob = new cronJob('*/10 * * * * *', async function () {
    try {
        console.log("Cron starting.....");
        pairJob.stop();
        const requests = [];
        for (let i = 0; i < allPairs.length; i++) {
            requests.push(getPrice(allPairs[i]));
        }
        const results = await Promise.all(requests);
        // console.log("result==>>>", results);
        await updatePrice(results);
        pairJob.start();

    } catch (error) {
        pairJob.stop();
        pairJob.start();
        console.log("pairJob error===>>>", error);
    }

})
pairJob.start();

const updatePrice = async (data) => {
    try {
        for (let response of data) {
            let obj = { symbol: response.symbol, price: response.price }, result;
            const checkPair = await findPair({ symbol: response.symbol });
            if (checkPair) {
                result = await updatePair({ _id: checkPair._id }, { price: response.price });
            } else {
                result = await createPair({ symbol: response.symbol, price: response.price });
            }
            obj["pairId"] = result._id;
            obj["timestamp"] = Date.now();
            await priceStats(obj);
        }
        return true;
    } catch (error) {
        console.log("update price error in catch===>>>", error);
        return false;
    }
}

const priceStats = async (data) => {
    try {
        // const [high, low, open, close] = await Promise.all([
        //     get24HourHigh(data.pairId),
        //     get24HourLow(data.pairId),
        //     openPrice(data.pairId),
        //     closePrice(data.pairId)
        // ]);
        // data["high"] = high;
        // data["low"] = low;
        // data["open"] = open;
        // data["close"] = close;
        await Promise.all([
            createGraph(data),
            // updatePair({ _id: data.pairId }, data)
        ]);

        return true;
    } catch (error) {
        console.log("update price error in catch===>>>", error);
        return false;
    }
}

const get24HourHigh = async (pairId) => {
    try {
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        const query = { pairId: pairId, createdAt: { $gte: twentyFourHoursAgo } };
        const data = await priceIn24Hour(query, { price: -1 });
        return data.length > 0 ? (data[0]["price"] ? data[0]["price"] : 0) : 0;

    } catch (error) {
        console.log("get24HourHigh price ==>>", error);
        return 0;
    }
}

const get24HourLow = async (pairId) => {
    try {
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        const query = { pairId: pairId, createdAt: { $gte: twentyFourHoursAgo } };
        const data = await priceIn24Hour(query, { price: 1 });
        return data.length > 0 ? (data[0]["price"] ? data[0]["price"] : 0) : 0;
    } catch (error) {
        console.log("get24HourLow price ==>>", error);
        return 0;
    }
}

const getPrice = async (pair) => {
    try {
        // let result;
        let result = await fetchPrice.price(pair);
        // switch (pair) {
        //     case "BTC":
        //         result = await fetchPrice.price(pair);
        //         break;
        //     case "ETH":
        //         result = await fetchPrice.price(pair);
        //         break;
        //     case "LINK":
        //         result = await fetchPrice.price(pair);
        //         break;
        // }
        return result;

    } catch (error) {
        console.log("price error===>>>", error);
    }
}


// (async () => {
//     await getPrice("LINK");
// }).call();


// market price <= ask or bids  sell

// market price >= ask or bids buy
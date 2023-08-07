//******************** Importing services ********************/
import { pairServices } from "../services/pair";
const { createPair, findPair, updatePair, pairList, pairOHLC, pairListWithOHLC } = pairServices;
import { graphServices } from "../services/graph";
const { createGraph, findGraph, priceIn24Hour, graphList } = graphServices;

import { orderServices } from "../services/order";
import status from "../enums/status";
import orderStatus from "../enums/orderStatus";

const { createOrder, findOrder, updateOrder, orderList } = orderServices;
//************************************************************/


var responses;

module.exports = {

    async getExchangeList() {
        try {
            return new Promise(async (resolve, reject) => {
                const data = await pairListWithOHLC({ isActive: true });
                const returnOp = {
                    status: true,
                    code: 200,
                    message: "Exchange list has been fetched successfully.",
                    data: data,
                };
                responses = (returnOp);
                resolve(responses);
            })
        } catch (error) {
            responses = (error);
            reject(responses);
        }
    },

    async pairDetails(pairId) {
        try {
            return new Promise(async (resolve, reject) => {
                const data = await pairOHLC(pairId);
                const returnOp = {
                    status: true,
                    code: 200,
                    message: "Pair details has been fetched successfully.",
                    data: data,
                };
                responses = (returnOp);
                resolve(responses);
            })
        } catch (error) {
            responses = (error);
            reject(responses);
        }
    },

    async activeOrders(pairId) {
        try {
            return new Promise(async (resolve, reject) => {
                const data = await orderList({ pairId: pairId, orderStatus: orderStatus.Pending });
                const returnOp = {
                    status: true,
                    code: 200,
                    message: "Active orders details has been fetched successfully.",
                    data: data,
                };
                responses = (returnOp);
                resolve(responses);
            })
        } catch (error) {
            responses = (error);
            reject(responses);
        }
    }

}






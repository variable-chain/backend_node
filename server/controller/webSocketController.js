//******************** Importing services ********************/
import { pairServices } from "../services/pair";
const { createPair, findPair, updatePair, pairList,pairOHLC, pairListWithOHLC } = pairServices;
import { graphServices } from "../services/graph";
const { createGraph, findGraph, priceIn24Hour, graphList } = graphServices;
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
    }
}






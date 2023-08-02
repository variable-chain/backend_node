
import pairModel from "../../../models/pair";


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
        return await pairModel.find(query);
    },

}

module.exports = { pairServices };


import transactionModel from "../../../models/transactions";


const transactionServices = {

    createTransaction: async (insertObj) => {
        return await transactionModel.create(insertObj);
    },

    findTransaction: async (query) => {
        return await transactionModel.findOne(query);
    },

    updateTransaction: async (query, updateObj) => {
        return await transactionModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    transactionList: async (query) => {
        return await transactionModel.find(query);
    },

}

module.exports = { transactionServices };

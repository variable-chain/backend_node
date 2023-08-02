import orderModel from "../models/order";


const orderServices = {

    createOrder: async (insertObj) => {
        return await orderModel.create(insertObj);
    },

    findOrder: async (query) => {
        return await orderModel.findOne(query);
    },

    updateOrder: async (query, updateObj) => {
        return await orderModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    orderList: async (query) => {
        return await orderModel.find(query);
    },

}

module.exports = { orderServices };

import graphModel from "../models/graph";


const graphServices = {

    createGraph: async (insertObj) => {
        return await graphModel.create(insertObj);
    },

    findGraph: async (query) => {
        return await graphModel.findOne(query);
    },

    updateGraph: async (query, updateObj) => {
        return await graphModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    graphList: async (query) => {
        return await graphModel.find(query);
    },

    priceIn24Hour: async (query, options) => {
        return await graphModel.find(query).select('price').sort(options);
    },

    openPrice: async (pairId) => {
        let today = new Date(); // Current date and time
        today.setHours(0, 0, 0, 0); // Set time to midnight

        const data = await graphModel.find({
            pairId: pairId,
            createdAt: {
                $gte: today
            }
        })
        return data.lenght > 0 ? data[0]["price"] : 0;
        // return graphModel.aggregate([
        //     {
        //         $match: {
        //             timestamp: {
        //                 $gte: ISODate("2023-06-28T00:00:00Z"),
        //                 $lt: ISODate("2023-06-28T00:00:01Z")
        //             }
        //         }
        //     },
        //     {
        //         $project: {
        //             _id: 0,
        //             price: 1
        //         }
        //     }
        // ]);
    },

    closePrice: async (pairId) => {
        let today = new Date(); // Current date and time
        today.setHours(0, 0, 0, 0); // Set time to midnight

        const data = await graphModel.find({
            pairId: pairId,
            timestamp: {
                $lt: today
            }
        })
        return data.lenght > 0 ? data[0]["price"] : 0;
    }
}

module.exports = { graphServices };

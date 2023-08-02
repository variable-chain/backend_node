
import settingsModel from "../../../models/settings";


const settingsServices = {

    createSettings: async (insertObj) => {
        return await settingsModel.create(insertObj);
    },

    findSettings: async (query) => {
        return await settingsModel.findOne(query);
    },

    updateSettings: async (query, updateObj) => {
        return await settingsModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    settingsList: async (query) => {
        return await settingsModel.find(query);
    },

}

module.exports = { settingsServices };

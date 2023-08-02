import graphModel from "../../../models/graph";


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

  listWithInterval: async (data) => {
    const interval = data.interval ? data.interval : '5m';

    const intervalInMillis = {
      '1m': 60000, // 1 minute
      '5m': 300000, // 5 minutes
      '15m': 900000, // 15 minutes
      '30m': 1800000, // 30 minutes
      '1h': 3600000, // 1 hour
      '4h': 14400000, // 4 hour
      'D': 86400000, // 1 day
      'W': 604800000, // 1 week
      'M': 2592000000, // 1 month
      'Y': 31536000000 // 1 year
    };
    console.log("fdnbbf===>>>", new Date(Date.now() - intervalInMillis[interval]));





    // const query = [
    //   {
    //     $match: {
    //       timestamp: {
    //         $lte: new Date(Date.now() - intervalInMillis[interval])
    //       },
    //       status: "ACTIVE"
    //     }
    //   },
    //   {
    //     $group: {
    //       _id: {
    //         year: { $year: '$timestamp' },
    //         month: { $month: '$timestamp' },
    //         day: { $dayOfMonth: '$timestamp' },
    //         hour: { $hour: '$timestamp' },
    //         minute: {
    //           $subtract: [
    //             { $minute: '$timestamp' },
    //             { $mod: [{ $minute: '$timestamp' }, parseInt(interval)] }
    //           ]
    //         }
    //       },
    //       open: { $first: '$open' },
    //       high: { $max: '$high' },
    //       low: { $min: '$low' },
    //       close: { $last: '$close' },
    //       timestamp: { $last: '$timestamp' }
    //     }
    //   },
    //   {
    //     $sort: {
    //       timestamp: 1
    //     }
    //   },
    //   {
    //     $limit: 10
    //   }
    // ];


    const query = [
      {
        $match: {
          timestamp: {
            $gte: new Date(Date.now() - intervalInMillis['1Y'])
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' },
            hour: { $hour: '$timestamp' },
            minute: {
              $subtract: [
                { $minute: '$timestamp' },
                { $mod: [{ $minute: '$timestamp' }, 5] }
              ]
            }
          },
          open: { $first: '$open' },
          high: { $max: '$high' },
          low: { $min: '$low' },
          close: { $last: '$close' },
          timestamp: { $last: '$timestamp' }
        }
      },
      {
        $sort: {
          timestamp: 1
        }
      }
    ];


    const result = await graphModel.aggregate(query);
    return result;
  },

  ohlcGraph: async (data) => {
    const symbol = data.symbol ? data.symbol : "BTC";
    let query = {
      symbol: symbol
    };

    const interval = data.interval ? Number(data.interval) : 5;
    const intervalType = data.intervalType ? data.intervalType : 'm';
    const getMillis = await getMilliSecondsOfUnit(intervalType);

    const intervals = getMillis * interval;

    function generateAggregationPipeline(interval) {
      return [
        { $match: query },
        {
          $group: {
            _id: {
              $subtract: [
                { $subtract: ["$timestamp", new Date(0)] },
                {
                  $mod: [{ $subtract: ["$timestamp", new Date(0)] }, interval],
                },
              ],
            },
            open: { $first: "$price" },
            high: { $max: "$price" },
            low: { $min: "$price" },
            close: { $last: "$price" },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            _id: 0,
            timestamp: { $add: [new Date(0), "$_id"] },
            open: 1,
            high: 1,
            low: 1,
            close: 1,
            percentageChange: { $divide: [{ $subtract: ['$close', '$open'] }, '$open'] }
          },
        },
      ];

    }

    let result = await graphModel.aggregate(
      generateAggregationPipeline(intervals)
    );
    const graphData = result.map((item) => ({
      timestamp: item.timestamp,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      percentageChange: item.percentageChange
    }));

    return graphData;
  },

}

module.exports = { graphServices };


const getMilliSecondsOfUnit = async (unit) => {
  unit = unit.toLowerCase();
  switch (unit) {
    case "minute":
      return 60 * 1000;
    case "hour":
      return 60 * 60 * 1000;
    case "day":
      return 24 * 60 * 60 * 1000;
    case "week":
      return 7 * 24 * 60 * 60 * 1000;
    case "month":
      return 30 * 24 * 60 * 60 * 1000;
    case "year":
      return 365 * 24 * 60 * 60 * 1000;
  }
}
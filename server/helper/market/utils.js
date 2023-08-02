function matchPairs(buyData, sellData) {
    // Step 2: Sort both arrays based on the price rate
    buyData.sort((a, b) => a.price - b.price);
    sellData.sort((a, b) => a.price - b.price);

    const matchedPairs = {};

    // Step 4: Iterate through both arrays simultaneously
    let buyPointer = 0;
    let sellPointer = 0;

    while (buyPointer < buyData.length && sellPointer < sellData.length) {
        const currentBuy = buyData[buyPointer];
        const currentSell = sellData[sellPointer];

        // Step 5: Check if the price rates match
        if ((currentBuy.symbol === currentSell.symbol) && (currentBuy.price === currentSell.price)) {
            if (!matchedPairs[currentBuy.price]) {
                matchedPairs[currentBuy.price] = {
                    buy: [],
                    sell: [],
                };
            }

            matchedPairs[currentBuy.price].buy.push(currentBuy);
            matchedPairs[currentBuy.price].sell.push(currentSell);

            // Move pointers to the next elements in both arrays
            buyPointer++;
            sellPointer++;
        } else if (currentBuy.price < currentSell.price) {
            // If the buy price is lower, move the buy pointer to find a higher buy price match
            buyPointer++;
        } else {
            // If the sell price is lower, move the sell pointer to find a higher sell price match
            sellPointer++;
        }
    }

    return matchedPairs;
}


// function matchLimitPairs(buyData, sellData) {
//     // Step 2: Sort both arrays based on the price rate
//     buyData.sort((a, b) => a.price - b.price);
//     sellData.sort((a, b) => a.price - b.price);

//     const matchedPairs = {};

//     // Step 4: Iterate through both arrays simultaneously
//     let buyPointer = 0;
//     let sellPointer = 0;

//     while (buyPointer < buyData.length && sellPointer < sellData.length) {
//         const currentBuy = buyData[buyPointer];
//         const currentSell = sellData[sellPointer];

//         // Step 5: Check if the price rates match
//         if ((currentBuy.symbol === currentSell.symbol) && (currentBuy.price === currentSell.price)) {
//             if (!matchedPairs[currentBuy.price]) {
//                 matchedPairs[currentBuy.price] = {
//                     buy: [],
//                     sell: [],
//                 };
//             }

//             matchedPairs[currentBuy.price].buy.push(currentBuy);
//             matchedPairs[currentBuy.price].sell.push(currentSell);

//             // Move pointers to the next elements in both arrays
//             buyPointer++;
//             sellPointer++;
//         } else if (currentBuy.price < currentSell.price) {
//             // If the buy price is lower, move the buy pointer to find a higher buy price match
//             buyPointer++;
//         } else {
//             // If the sell price is lower, move the sell pointer to find a higher sell price match
//             sellPointer++;
//         }
//     }

//     return matchedPairs;
// }
// function matchPairs(buyData, sellData) {
//     console.log("buyData==>", buyData);
//     console.log("sellData==>", sellData);

//     // Separate limit and market orders for both buy and sell sides
//     const buyLimitOrders = buyData.filter(order => order.orderType === 'Limit');
//     const buyMarketOrders = buyData.filter(order => order.orderType === 'Market');
//     const sellLimitOrders = sellData.filter(order => order.orderType === 'Limit');
//     const sellMarketOrders = sellData.filter(order => order.orderType === 'Market');

//     console.table(buyLimitOrders);
//     console.table(sellLimitOrders);
//     console.table(buyMarketOrders);
//     console.table(sellMarketOrders);


//     // Sort limit orders based on the price rate
//     buyLimitOrders.sort((a, b) => a.price - b.price);
//     sellLimitOrders.sort((a, b) => a.price - b.price);

//     const matchedPairs = {};

//     // Match Limit Orders
//     let buyLimitPointer = 0;
//     let sellLimitPointer = 0;

//     while (buyLimitPointer < buyLimitOrders.length && sellLimitPointer < sellLimitOrders.length) {
//         const currentBuy = buyLimitOrders[buyLimitPointer];
//         const currentSell = sellLimitOrders[sellLimitPointer];

//         if (currentBuy.price === currentSell.price) {
//             // Matching logic for limit orders (your custom logic here)
//             if (!matchedPairs[currentBuy.price]) {
//                 matchedPairs[currentBuy.price] = {
//                     buy: [],
//                     sell: [],
//                 };
//             }

//             matchedPairs[currentBuy.price].buy.push(currentBuy);
//             matchedPairs[currentBuy.price].sell.push(currentSell);

//             // Move pointers to the next elements in both arrays
//             buyLimitPointer++;
//             sellLimitPointer++;
//         } else if (currentBuy.price < currentSell.price) {
//             // If the buy price is lower, move the buy pointer to find a higher buy price match
//             buyLimitPointer++;
//         } else {
//             // If the sell price is lower, move the sell pointer to find a higher sell price match
//             sellLimitPointer++;
//         }
//     }

//     // Match Market Orders
//     for (const buyOrder of buyMarketOrders) {
//         while (buyOrder.quantity > 0 && sellLimitOrders.length > 0) {
//             const bestSell = sellLimitOrders[0];
//             if (bestSell.price <= buyOrder.price) {
//                 // Execute the trade for market buy order
//                 const tradeQuantity = Math.min(buyOrder.quantity, bestSell.quantity);
//                 console.log(`Market Buy order ${buyOrder.id} matched with sell order ${bestSell.id} for ${tradeQuantity} shares at price ${bestSell.price}`);

//                 // Update the quantities for market buy and sell orders
//                 buyOrder.quantity -= tradeQuantity;
//                 bestSell.quantity -= tradeQuantity;

//                 // Remove the sell order if fully executed
//                 if (bestSell.quantity === 0) {
//                     sellLimitOrders.shift();
//                 }
//             } else {
//                 // No more compatible sell orders
//                 break;
//             }
//         }
//     }

//     for (const sellOrder of sellMarketOrders) {
//         while (sellOrder.quantity > 0 && buyLimitOrders.length > 0) {
//             const bestBuy = buyLimitOrders[buyLimitOrders.length - 1];
//             if (bestBuy.price >= sellOrder.price) {
//                 // Execute the trade for market sell order
//                 const tradeQuantity = Math.min(sellOrder.quantity, bestBuy.quantity);
//                 console.log(`Market Sell order ${sellOrder.id} matched with buy order ${bestBuy.id} for ${tradeQuantity} shares at price ${bestBuy.price}`);

//                 // Update the quantities for market sell and buy orders
//                 sellOrder.quantity -= tradeQuantity;
//                 bestBuy.quantity -= tradeQuantity;

//                 // Remove the buy order if fully executed
//                 if (bestBuy.quantity === 0) {
//                     buyLimitOrders.pop();
//                 }
//             } else {
//                 // No more compatible buy orders
//                 break;
//             }
//         }
//     }

//     console.log("match pair order ====>", matchedPairs);

//     return matchedPairs;
// }


// function toGetFullyFilledPartiallyFilled(){
function processOrders(data) {
    const fullyFilled = [];
    const partiallyFilled = [];
    const remainingAmount = [];
    let matchedQuantity;
    for (const key in data) {
        const buyOrders = data[key].buy;
        const sellOrders = data[key].sell;

        for (const buyOrder of buyOrders) {
            for (const sellOrder of sellOrders) {
                if (buyOrder.price === sellOrder.price) {
                    matchedQuantity = Math.min(buyOrder.quantity, sellOrder.quantity);
                    const id = buyOrder.quantity < sellOrder.quantity ? buyOrder._id : sellOrder._id;
                    fullyFilled.push({
                        _id: id,
                        price: buyOrder.price,
                        matchedQuantity,
                        buyOrder,
                        sellOrder,
                    });

                    buyOrder.quantity -= matchedQuantity;
                    sellOrder.quantity -= matchedQuantity;

                    if (buyOrder.quantity === 0) {
                        buyOrders.splice(buyOrders.indexOf(buyOrder), 1);
                    }

                    if (sellOrder.quantity === 0) {
                        sellOrders.splice(sellOrders.indexOf(sellOrder), 1);
                    }
                }
            }
        }
        remainingAmount.push(...buyOrders.filter((order) => order.quantity > 0));
        remainingAmount.push(...sellOrders.filter((order) => order.quantity > 0));
        if (remainingAmount.length > 0) {
            partiallyFilled.push({
                matchedQuantity: matchedQuantity,
                _id: remainingAmount[0]._id
            });
        }
        return {
            fullyFilled,
            partiallyFilled,
            remainingAmount,
        };
    }


}


module.exports = { matchPairs, processOrders };

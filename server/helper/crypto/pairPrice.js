import Config from "config";
import contractABI from "./ABI/abi.json";
// import ethABI from "./ABI/ethAbi.json";

const { Web3 } = require("web3");
const rpc = Config.get("RPC");
// const rpc = "https://goerli.infura.io/v3/2a337070a8ea423daa25f2184f13403e"; // aashu
// const rpc = "https://soft-attentive-hexagon.ethereum-goerli.quiknode.pro/e907c2de07d4c82a5f238d6d8be6bbe28c260337/"

const web3 = new Web3(rpc);


module.exports = {


    async price(symbol) {
        try {
            console.log("symbol==>>", symbol, Config.get(symbol));
            const getSymbolContract = Config.get(symbol);
            const contractAddress = getSymbolContract["contractAddress"];

            // Create a contract instance 
            const contract = new web3.eth.Contract(contractABI, contractAddress);
            // console.log("contract==>>>", contract);
            // const contract = new web3.eth.Contract(ethABI, contractAddress);

            // console.log("contract===>>>>", contract);

            // const value = await contract.methods.getLatestPrice().call();
            const value = await getPrice(symbol);
            console.log("value====>>", value);
            return {
                symbol: symbol,
                price: value
            };
        } catch (error) {
            console.log("from cotract call price error===>>", error);
            return {
                symbol: symbol,
                price: 0
            };
        }
    }
};


const getPrice = async (symbol) => {
    let price = 0;
    switch (symbol) {
        case "BTC":
            price = getRandomPrice(28000, 31000);
            break;
        case "ETH":
            price = getRandomPrice(1780, 1900);
            break;
        case "LINK":
            price = getRandomPrice(4, 10);
            break;
        default:
            price = 0;
            break;
    }
    return price;

}

function getRandomPrice(minPrice, maxPrice) {
    const randomDecimal = Math.random();
    const priceRange = maxPrice - minPrice;
    const randomPrice = (randomDecimal * priceRange) + minPrice;
    const decimalPlaces = 2;
    const roundedPrice = Number(randomPrice.toFixed(decimalPlaces));
    return roundedPrice;
}

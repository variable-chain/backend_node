import Config from "config";
import Server from "./common/server"; // cron server
// import Server from "./common/webServer"; // websocket server


const dbUrl = `mongodb://${Config.get("databaseHost")}:${Config.get(
	"databasePort"
)}/${Config.get("databaseName")}`;

const server = new Server()
	.configureDb(dbUrl)
	.then((_server) => _server.listen(Config.get("port")));

export default server;

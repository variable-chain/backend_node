import Express from "express";
import * as http from "http";
import mongoose from "mongoose";

const app = new Express();
const server = http.Server(app);

//***************************** Cron services *******************/
// import cron from '../controller/controller';
import matchingCron from '../controller/market/controller';

/****************************************************************/


class ExpressServer {
  constructor() {

  }

  configureDb(dbUrl) {
    return new Promise((resolve, reject) => {
      mongoose.connect(
        dbUrl,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        },
        (err) => {
          if (err) {
            console.log(`Error in mongodb connection ${err.message}`);
            return reject(err);
          }
          console.log("Mongodb connection established");
          return resolve(this);
        }
      );
    });
  }

  listen(port) {
    server.listen(port, () => {
      console.log(`Secure app is listening @port ${port} 🌎`);
    });
    return app;
  }
}


export default ExpressServer;

import Express from "express";
import * as http from "http";
import * as path from "path";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import useragent from "express-useragent";
import morgan from "morgan";
import mongoose from "mongoose";
import apiErrorHandler from "../helper/apiErrorHandler";
const app = new Express();
const server = http.Server(app);
const root = path.normalize(`${__dirname}/../..`);

class ExpressServer {
  constructor() {
    app.use(Express.json());
    app.use(
      Express.urlencoded({
        extended: true,
      })
    );

    app.use(morgan("dev"));
    app.use(
      helmet.contentSecurityPolicy({
        reportOnly: true,
      })
    );
    app.use(useragent.express());
    // app.use(Express.static(`${root}/views`));

    app.use(
      cors({
        allowedHeaders: ["Content-Type", "token", "authorization"],
        exposedHeaders: ["token", "authorization"],
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
      })
    );
  }
  router(routes) {
    routes(app);
    return this;
  }

  configureSwagger(swaggerDefinition) {
    const options = {
      swaggerDefinition,
      apis: [
        path.resolve(`${root}/server/api/v1/controllers/**/*.js`),
        path.resolve(`${root}/api.yaml`),
      ],
    };

    function requireLogin(request, response, next) {
      if (Date.now() - process.env.swaggerLogin < 15 * 60 * 1000 || true) {
        next();
      } else {
        console.log("else part\n\n");
        process.env.swaggerLogin = 0;
        response.sendFile(path.resolve(`${root}/views/login.html`));
      }
    }
    app.use(
      "/api-docs",
      requireLogin,
      swaggerUi.serve,
      swaggerUi.setup(swaggerJSDoc(options))
    );
    app.get("/postman-collection", function (req, res) {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerJSDoc(options));
    });
    return this;
  }

  handleError() {
    app.use(apiErrorHandler);
    return this;
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
  configureUI() {
    app.get("/admin/*", function (req, res) {
      res.sendFile(path.join(root, "build", "index.html"));
    });
    return this;
  }

  listen(port) {
    server.listen(port, () => {
      console.log(`Secure app is listening @port ${port} 🌎`);
    });
    return app;
  }
}


export default ExpressServer;

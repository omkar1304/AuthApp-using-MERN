import express from "express";
import cors from "cors";
import morgan from "morgan";
import { PORT } from "./config.js";
import connect from "./database/conn.js";
import router from "./router/route.js";

const app = express();

/* Middlwares */
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
app.disable("x-powered-by");

/* HTTP GET Request */
app.get("/", (request, response) => {
  response.status(201).json("Home GET Request");
});

app.use('/api', router)

/* Start Server only when we establish connection to MongoDB*/
connect()
  .then(() => {
    try {
      app.listen(PORT, () => {
        console.log(`Server connnected to http://localhost:${PORT}`);
      });
    } catch (error) {
      console.log("Unable to conect to server");
    }
  })
  .catch((error) => {
    console.log("Unable to connect to MongoDB");
  });

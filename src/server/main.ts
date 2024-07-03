import express from "express";
import bodyParser from "body-parser";
import ViteExpress from "vite-express";

const app = express();
app.use(bodyParser.json());

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);

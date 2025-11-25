import express from "express";
import cors from "cors";
import machinetimedownRouter from "./src/routes/machinetimedown.js";
import { swaggerSpec, swaggerUiMiddleware } from "./swagger.js";
import 'dotenv/config';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger Docs
app.use("/api-docs", swaggerUiMiddleware.serve, swaggerUiMiddleware.setup(swaggerSpec));

// CRUD Routes
app.use("/data", machinetimedownRouter);

app.listen(4000, () => {
  console.log("Server running → http://localhost:4000");
  console.log("Swagger → http://localhost:4000/api-docs");
});

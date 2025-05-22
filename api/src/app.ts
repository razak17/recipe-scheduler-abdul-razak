import express from "express";
import cors from "cors";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

export const initializeApp = async () => {
  try {
    const AppDataSource = new DataSource({
      type: "sqlite",
      database: "cooking_scheduler.sqlite",
      entities: [],
      synchronize: true,
    });

    AppDataSource.initialize()
      .then(() => {
        console.log("Data Source has been initialized!");
      })
      .catch((err) => {
        console.error("Error during Data Source initialization", err);
      });

    return app;
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw error;
  }
};

export default app;

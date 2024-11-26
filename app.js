import express from "express";
import authRoute from "./routes/auth.js";
import indexRoute from "./routes/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://kaleidoscopic-stardust-f36133.netlify.app",
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authRoute);
app.use("/", indexRoute);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error: " + err.stack
  });
});

app.listen(3000, () => {
  console.log("Sevrer listening at port 3000");
});

import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import authRoutes from './routes/auth.route';
import cors from 'cors';
import { errorHandler } from "./middlewares/errorHandler";
import productRoutes from "./routes/product.routes";

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Hello Issue");
});

app.use('/auth', authRoutes);
// product routes
app.use("/api/products", productRoutes);

// ดักจับข้อผิดพลาดทั่วไป
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


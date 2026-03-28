import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import authRoutes from './routes/auth.route';
import cors from 'cors';
import { errorHandler } from "./middlewares/errorHandler";
import productRoutes from "./routes/product.routes";
import allergenRoutes from './routes/allergen.routes';
import userRoutes from './routes/user.routes';
import chatRoutes from './routes/chat.routes';

const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envFile });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", true);
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Hello Issue");
});

app.use('/auth', authRoutes);
// product routes
app.use("/api/products", productRoutes);
// allergen routes
app.use("/api/allergens", allergenRoutes);
// user routes
app.use("/api/users", userRoutes);
// chat routes
app.use("/api/chat", chatRoutes);

// ดักจับข้อผิดพลาดทั่วไป
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

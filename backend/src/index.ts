import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Hello Issue");
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

import 'dotenv/config'; 
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(' Connected to MongoDB'))
  .catch(err => console.error(' MongoDB Connection Error:', err));

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true,
  })
);

app.use('/api', apiRoutes); 

app.listen(PORT, () => {
  console.log(` Backend server listening on http://localhost:${PORT}`);
});

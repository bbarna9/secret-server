import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import secretRoutes from './routes/secretRoutes.js';
import xmlparser from 'express-xml-bodyparser';

const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log('Connected to database'))
  .catch((err) => {
    console.log(err);
  });

app.use(express.json());
app.use(xmlparser());
app.use('/', secretRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

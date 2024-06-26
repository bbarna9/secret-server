import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import secretRoutes from './routes/secretRoutes.js';
import xmlparser from 'express-xml-bodyparser';

export const app = express();

dotenv.config();
const PORT = process.env.PORT || 5000;

// Setting up the connection to the MongoDB database through mongoose
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log('Connected to database'))
  .catch((err) => {
    console.log(err);
  });

//
/* app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

app.use(cors()); */

// Allowing both XML and JSON formats for the requests as well.
app.use(express.json());
app.use(xmlparser());

// Defining the routes of the application.
app.use('/', secretRoutes);

// Starting the server.
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

import express from 'express'
import dotenv from 'dotenv'
import { db } from './config/db';

import authRoutes from './routes/authRoutes'

//allow reading enviornment variables
dotenv.config();

const app = express();

app.use(express.json()); //allow json format

//db connection
db();

//Routes
app.use('/api/auth', authRoutes);


//Port and app starting
const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log('running in port ' + port);
})
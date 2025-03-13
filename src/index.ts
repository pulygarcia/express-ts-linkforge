import express from 'express'
import dotenv from 'dotenv'
import { db } from './config/db';
import cors from 'cors'

import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'

import { corsConfig } from './config/cors';

//allow reading enviornment variables
dotenv.config();

//db connection
db();

const app = express();

//Cors
app.use(cors(corsConfig));

app.use(express.json()); //allow json format


//Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);


//Port and app starting
const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log('running in port ' + port);
})
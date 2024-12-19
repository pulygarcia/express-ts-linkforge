import express from 'express'

import authRoutes from './routes/authRoutes'

const app = express();


//Routes
app.use('/api/auth', authRoutes);


//Port and app starting
const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log('running in port ' + port);
})
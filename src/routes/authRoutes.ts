import express from 'express'

const router = express.Router();

router.post('/register', (req, res) => {
    res.send('Registering');
});

export default router
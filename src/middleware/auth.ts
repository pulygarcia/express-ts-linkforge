import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../schemas/User.model';

 declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
 }

export const authMiddleware = async (req:Request, res:Response, next:NextFunction) => {
    const bearer = req.headers.authorization;

    if(!bearer){
        const error = new Error('Unauthorized access');

        return res.status(401).json({
            msg : error.message
        })
    }

    const token = bearer.split(' ')[1];

    if(!token){
        const error = new Error('Unauthorized access');

        return res.status(401).json({
            msg : error.message
        })
    }
 
    try {
        const decoded = jwt.verify(token, process.env.PRIVATE_KEY_JWT as string)

        if(typeof decoded === 'object' && decoded.id){
            const user = await User.findById(decoded.id).select(  //avoid return unncesseary data
                "-password -__v"
            );

            if(!user){
                const error = new Error('User not found');
        
                return res.status(404).json({
                    msg : error.message
                })
            }

            req.user = user;

            next()
        }
    } catch (error) {
        console.log(error);
    }
}

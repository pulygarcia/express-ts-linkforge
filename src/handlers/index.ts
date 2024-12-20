import {Request, Response} from "express";
import slug from "slug";
import User from "../schemas/User.model";
import { hashPassword } from "../utils/auth";


export const registerUser = async (req:Request, res:Response) => {
    if(Object.values(req.body).includes('')){
        const error = new Error('Empty fields not allowed');

        return res.status(400).json({
            msg : error.message
        })
    }

    //Avoid duplicates
    const userExists = await User.findOne({name: req.body.name}) //check in db
    if(userExists){
        const error = new Error('User already exists');

        return res.status(400).json({
            msg : error.message
        })
    }

    //Password extention
    const MIN_PASSWORD_LENGTH = 8;
    if(req.body.password.trim().length < MIN_PASSWORD_LENGTH){
        const error = new Error('Password should have at least 8 characters');

        return res.status(400).json({
            msg : error.message
        })
    }

    try {
        const user = new User(req.body);

        //encrypt pswrd
        user.password = await hashPassword(req.body.password);

        //user handle using slug
        const handle = slug(req.body.handle, '');
        user.handle = handle;
        
        await user.save();


        res.json({
            msg: "User registered correctly"
        })

    } catch (error) {
        console.log(error);
    }
}
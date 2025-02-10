import {Request, Response} from "express";
import { createJWT } from "../utils/jwt";
import slug from "slug";
import User from "../schemas/User.model";
import { hashPassword, checkPassword } from "../utils/auth";


export const registerUser = async (req:Request, res:Response) => {
    if(Object.values(req.body).includes('')){
        const error = new Error('Empty fields not allowed');

        return res.status(400).json({
            msg : error.message
        })
    }

    //Avoid duplicates
    const userExists = await User.findOne({email: req.body.email}) //check in db
    if(userExists){
        const error = new Error('User already exists');

        return res.status(409).json({
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
        const handle = slug(req.body.handle || 'user-handle-1', '');
        //make sure there are not repeated handlers
        if(await User.findOne({handle: handle})){
            const error = new Error('This handle is not available');

            return res.status(409).json({
                msg : error.message
            })
        }

        user.handle = handle;
        
        await user.save();


        res.json({
            msg: "User registered correctly"
        })

    } catch (error) {
        console.log(error);
    }
}


export const login = async (req:Request, res:Response) => {
    //is registered?
    const user = await User.findOne({email: req.body.email}) //check in db
    if(!user){
        const error = new Error('User not found');

        return res.status(400).json({
            msg : error.message
        })
    }

    //verify pswd
    if(!await checkPassword(req.body.password, user.password)){
        const error = new Error('Wrong password');

        return res.status(409).json({
            msg : error.message
        })
    }

    const userToken = createJWT({id: user._id})

    res.json({
        msg: `Welcome ${user.handle}`,
        token: userToken
    });
}

export const getUser = async (req:Request, res:Response) => {
    const user = req.user;

    res.json(
        user
    )
}

export const updateUser = async (req:Request, res:Response) => {
    try {
        const {description} = req.body;

        const handle = slug(req.body.handle, '');

        if(await User.findOne({handle: handle})){
            const error = new Error('This handle is not available');

            return res.status(409).json({
                msg : error.message
            })
        }
        //all ok, update
        req.user.description = description;
        req.user.handle = handle;

        await req.user.save();

        res.json({
            msg: "Updated correctly"
        })

    } catch (e) {
        const error = new Error('Could not update user');

        return res.status(500).json({
            msg : error.message
        })
    }
}
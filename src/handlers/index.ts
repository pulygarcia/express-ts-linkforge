import {NextFunction, Request, Response} from "express";
import { createJWT } from "../utils/jwt";
import slug from "slug";
import formidable from "formidable";
import User from "../schemas/User.model";
import { hashPassword, checkPassword } from "../utils/auth";
import cloudinary from '../config/cloudinary'
import { v4 as uuid } from "uuid";


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

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { description, handle: newHandle } = req.body;

        const currentHandle = req.user.handle;  // current user handle

        // if handle don't change is not necessary verify if exists
        if (newHandle !== currentHandle) {
            const handle = slug(newHandle, '');

            // Verificar si el nuevo handle está en uso
            const existingUser = await User.findOne({ handle: handle });
            if (existingUser) {
                const error = new Error('This handle is not available');
                return res.status(409).json({ msg: error.message });
            }

            req.user.handle = handle;  // assign the new handle if is valid
        }

        req.user.description = description;

        await req.user.save();

        res.json({
            msg: "Updated correctly"
        });

    } catch (e) {
        const error = new Error('Could not update user');
        return res.status(500).json({
            msg: error.message
        });
    }
};


export const uploadUserImage = async (req:Request, res:Response) => {
    const form = formidable({})
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    try {
        form.parse(req, (err, fields, files) => {
            if (!files.file || files.file.length === 0) {
                return res.status(400).json({ error: "No file uploaded" });
            }
            const file = files.file[0].filepath;
            //console.log(file);
            
            // Upload an image
            cloudinary.uploader.upload(file, {public_id: uuid()}, async function(error, result){
                if(error){
                    const error = new Error('Could not upload image');
                    return res.status(500).json({
                        msg : error.message
                    })
                }

                //save image url in user data wich is in the request thanks to middleware
                req.user.image = result?.secure_url;
                await req.user.save();
                res.json({
                    image: result?.secure_url
                })
            })
            
        });
    } catch (e) {
     const error = new Error('Could not upload image');

        return res.status(500).json({
            msg : error.message
        })
    }
}
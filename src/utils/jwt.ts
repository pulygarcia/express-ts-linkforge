import jwt, { JwtPayload } from 'jsonwebtoken';

export const createJWT = (payload:JwtPayload) => {
    const privateKey = process.env.PRIVATE_KEY_JWT;
    
    if (!privateKey) {
        throw new Error('Private key is not defined in the environment variables');
    }

    return jwt.sign( payload, privateKey,{
        expiresIn: '30d'
    });
}
import { CorsOptions } from "cors";

export const corsConfig:CorsOptions =  {
    origin: function(origin, callback){
        const whiteList = process.argv.includes('--postman') ? [process.env.FRONTEND_URL, undefined] : [process.env.FRONTEND_URL];

        if(whiteList.includes(origin)){
            //console.log('allow');
            callback(null, true);
        }else{
            callback(new Error('CORS Error'), false);
        }
    }
}
import jwt from 'jsonwebtoken';
import { JWTSECRET } from '../config.js';


export const Auth = async (request, response, next) => {
    try {
        
        // access authorize header to validate request
        const token = request.headers.authorization.split(" ")[1];

        // retrive the user details fo the logged in user
        const decodedToken = await jwt.verify(token, JWTSECRET);

        request.user = decodedToken;

        next()

    } catch (error) {
        response.status(401).json({ error : "Authentication Failed!"})
    }
}

export const localVariables = async (request, response, next) => {

    // request.app.locals -> to create application level variables(can be accessible by all APIs)
    // request.locals -> to create API level variables(can be accessible by only that API)

    request.app.locals = {
        OTP: null,
        resetSession: false
    }
    next()
}
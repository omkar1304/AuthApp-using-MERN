import UserModel from "../model/user.model.js"
import bcrypt from 'bcrypt';
import { JWTSECRET } from "../config.js";
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';


const verifyUser = async (request, response, next) => {

    try {
        const { username } = request.method == "GET" ? request.query : request.body
        let exist = await UserModel.findOne({username: username})
        if(!exist) return response.status(404).send({ error : "Can't find User!"});
        next()

    } catch (error) {
        return response.status(404).send({error: "Authentication error"})
    }
} 

/** POST: http://localhost:8080/api/register 
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "firstName" : "bill",
  "lastName": "william",
  "mobile": 8009860560,
  "address" : "Apt. 556, Kulas Light, Gwenborough",
  "profile": ""
}
*/
const register = async (request, response) => {
    try {
        
        const { username, password, profile, email } = request.body

        // check the existing user
        const existUsername = new Promise((resolve, reject) => {
            UserModel.findOne({username:username}, function(error, user){
                if(error) reject(new Error(error))
                if(user) reject({ error : "Please use unique username"});

                resolve();
            })
        })

        // check the existing email
        const existEmail = new Promise((resolve, reject) => {
            UserModel.findOne({email:email}, function(error, email){
                if(error) reject(new Error(error))
                if(email) reject({error: "Please use unique email"})

                resolve()
            })
        })

        Promise.all([existUsername, existEmail])
            .then(() => {
                if(password){
                    bcrypt.hash(password, 10)
                    .then((hashedPassword) => {
                        const user = new UserModel({
                            username:username,
                            password: hashedPassword,
                            profile: profile || "",
                            email: email
                        })

                        user.save()
                            .then((result) => response.status(201).send({msg: "User Registered Successfully"}))
                            .catch((error) => response.status(500).send({error}))
                    })
                    .catch((error) => {
                        return response.status(500).send({error: "Unable to hash password"})
                    })
                }
        })
        .catch((error) => {
            return response.status(500).send({error})
        })

    } catch (error) {
        return response.status(500).send({error})
    }
}

/** POST: http://localhost:8080/api/login 
 * @param: {
  "username" : "example123",
  "password" : "admin123"
}
*/
const login = async (request, response) => {
    try {
        const { username, password } = request.body

        UserModel.findOne({username: username})
            .then((user) => {
                bcrypt.compare(password, user.password)
                .then((passwordCheck) => {
                    // if password doesnt match then ->
                    if(!passwordCheck) return response.status(400).send({error: "Password doesn't match"})

                    // if password does match then -> 
                    const token = jwt.sign({
                        userId: user._id,
                        username : user.username
                    }, JWTSECRET , { expiresIn : "24h"});

                    return response.status(200).send({
                        msg: "Login Successful...!",
                        username: user.username,
                        token: token
                    })

                })
                .catch((error) => {
                    return response.status(400).send({error: "Password doesn't match"})
                })
            })
            .catch((error) => {
                return response.status(404).send({error: "Username not found"})
            })
        
    } catch (error) {
        return response.status(500).send({error})
    }
}

/** GET: http://localhost:8080/api/user/example123 */
const getUser = async (request, response) => {
    try {
        const { username } = request.params

        if(!username) return response.status(501).send({error: "Invalid username"})

        UserModel.findOne({ username: username}, function(error, user){
            if(error) return response.status(500).send({error})
            if(!user) return response.status(501).send({error: "Couldn't find user"})

            return response.status(200).send(user)
        })
        
    } catch (error) {
        return response.status(404).send({error: "Cannot find user data"})
    }
}

/** PUT: http://localhost:8080/api/updateuser 
 * @param: {
  "header" : "<token>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
const updateUser = async (request, response) => {
    try {
        
        // const { id } = request.query
        const { userId } = request.user;

        if(userId){
            const body = request.body;

            // update the data
            UserModel.updateOne({ _id : userId }, body, function(err, data){
                if(err) response.status(401).send({ error : "whilw updating data...!"});

                return response.status(201).send({ msg : "Record Updated...!"});
            })

        }else{
            return response.status(401).send({ error : "User Not Found...!"});
        }

    } catch (error) {
        return response.status(401).send({ error: "First catch" });
    }
}

/** GET: http://localhost:8080/api/generateOTP */
const generateOTP = async (request, response) => {
    request.app.locals.OTP = await otpGenerator.generate(6, {lowerCaseAlphabets: false, upperCaseAlphabets:false, specialChars:false})
    return response.status(201).send({code:request.app.locals.OTP })
}

/** GET: http://localhost:8080/api/verifyOTP */
const verifyOTP = async (request, response) => {
    const { code } = request.query
    if(parseInt(code) === parseInt(request.app.locals.OTP)){
        request.app.locals.OTP = null // reset the OTP value
        request.app.locals.resetSession = true // start session for reset password
        return response.status(200).send({msg:"Verified..."})
    }
    return response.status(400).send({error: "Invalid OTP"})
}

// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */
const createResetSession = async (request, response) => {
    if(request.app.locals.resetSession){
        request.app.locals.resetSession = false
        return response.status(200).send({msg: "Access granted!"})
    }
    return res.status(440).send({error : "Session expired!"})
}

// update the password when we have valid session
/** PUT: http://localhost:8080/api/resetPassword */
const resetPassword = async (request, response) => {
    try {

        if(!request.app.locals.resetSession) return response.status(440).send({error : "Session expired!"})

        const { username, password } = request.body

        try {
            UserModel.findOne({username: username})
                .then((user) => {
                    bcrypt.hash(password, 10)
                        .then((hashedPassword) => {
                            UserModel.updateOne({username:username}, {password: hashedPassword}, function(error, data){
                                if(error) response.status(401).send({error})
                                request.app.locals.resetSession = false
                                return response.status(200).send({ msg : "Record Updated...!"})
                            })
                        })
                        .catch((error) => {
                            return response.status(500).send({
                                error : "Enable to hashed password"
                            })
                        })
                })
                .catch((error) => {
                    return response.status(404).send({ error : "Username not Found"});
                })           
        } catch (error) {
            return response.status(500).send({ error })
        }
        
    } catch (error) {
        return response.status(401).send({error})
    }
}

export { register, login, getUser, generateOTP, updateUser, verifyOTP, createResetSession, resetPassword, verifyUser}
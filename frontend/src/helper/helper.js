import axios from 'axios'

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_DOMAIN

/** Make API Requests */

/** authenticate function */
export const authenticate = async (username) => {
    try {
        return await axios.post('/api/authenticate', {username:username})
    } catch (error) {
        return {error: "Username doesn't exists!"}
    }
}

/** get User details */
export const getUser = async ({username}) => {
    try {
        const { data } = await axios.get(`/api/user/${username}`)
        return { data }
    } catch (error) {
        return {error: "Username or Password is invalid!"}
    }
}

/** register user function */
export const registerUser = async (credentials) => {
    try {
        const { data: { msg }, status } = await axios.post('/api/register', credentials)

        let { username, email } = credentials

        if(status === 201){
            await axios.post('/api/registerMail', { username, userEmail : email, text : msg})
        }

        return Promise.resolve(msg)
        
    } catch (error) {
        return Promise.reject({error})
    }
}

/** login function */
export const verifyPassword = async ({ username, password }) => {
    try {
        if(username){
            const { data } = await axios.post('/api/login', { username: username, password: password})
            return Promise.resolve({data: data})
        }
    } catch (error) {
        return Promise.reject({ error : "Password doesn't Match...!"})
    }
}

/** update user profile function */
export const updateUser = async (response) => {
    try {
        const token = localStorage.getItem('token')
        const data = await axios.put('/api/updateuser', response, { headers: { "Authorization": `Bearer ${token}`}})
        return Promise.resolve({ data })
    } catch (error) {
        return Promise.reject({ error : "Couldn't Update Profile...!"})
    }
}

/** generate OTP */
export const generateOTP = async (username) => {
    try {
         const { data: { code }, status } = await axios.get('/api/generateOTP', { params: {username: username}})

         if(status === 201){
            let { data : { email }} = await getUser({ username });
            let text = `Your Password Recovery OTP is ${code}. Verify and recover your password.`;
            await axios.post('/api/registerMail', { username, userEmail: email, text, subject : "Password Recovery OTP"})
         }
         return Promise.resolve(code);
    } catch (error) {
        return Promise.reject({error: error})
    }
}

/** verify OTP */
export const verifyOTP = async ({ username, code }) => {
    try {
        const { data, status } = await axios.get('/api/verifyOTP', { params: { username: username, code: code}})
        return { data, status }
    } catch (error) {
        return Promise.reject(error)
    }
}

/** reset password */
export const resetPassword = async ({ username, password}) => {
    try {
        const { data, status } = await axios.put('/api/resetPassword', { username: username, password: password})
        return Promise.resolve({ data, status})
    } catch (error) {
        return Promise.reject({error})
    }
}
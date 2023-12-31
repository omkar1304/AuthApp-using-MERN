import mongoose from "mongoose";

export const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please provide unique Username"],
        unique: [true, "Username exist"]
    },
    password: {
        type: String,
        required: [true, "Please provide password"],
        unique: false
    },
    email: {
        type: String,
        required: [true, "Please provide unique email"],
        unique: true
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    mobile: {
        type: Number
    },
    address: {
        type: String
    },
    profile: {
        type: String
    }
})

export default mongoose.model.Users || mongoose.model("User", userSchema)
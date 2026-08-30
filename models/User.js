import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must contain at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                'Please provide a valid email'],

        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8,
                "Password must contain at least 8 characters"],
            select: false
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        emailOTP: {
            type: String,
            select: false
        },

        emailOTPExpires: {
            type: Date,
            select: false
        },



        resetPasswordOtp: {
            type: String,
            select: false,
        },

        resetPasswordExpires: {
            type: Date,
            select: false,
        },

        phone: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true
    }

)



userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt)

});


userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password)

}


userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.resetPasswordOtp;
    delete user.resetPasswordExpires;
    delete user.emailOTP;
    delete user.emailOTPExpires;
    return user;

};

const User = mongoose.model('User', userSchema, 'Login');
export default User;
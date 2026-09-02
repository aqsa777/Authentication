import User from "../models/User.js";
import generateOtp from "../utils/generateOtp.js";
import sendEmail from "../utils/sendEmail.js";
import generateToken from "../utils/generateToken.js";




// SIGNUP CONTROLLER
const signup = async (req, resp) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password || !phone) {
            return resp.status(400).json({
                success: false,
                message: "Name, email, password are required"
            })
        }

        const normalizedEmail = email.toLowerCase().trim();


        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return resp.status(409).json({
                success: false,
                message: "User with this email already exists"
            })
        }

        const otp = generateOtp();

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password,
            phone,
            emailOTP: otp,
            emailOTPExpires: new Date(Date.now() + 10 * 60 * 1000)
        });

        await sendEmail(
            user.email,
            "Verify Your Email",

            `
                <h2>Email Verification</h2>

                <p>
                    Hello ${user.name},
                </p>

                <p>
                    Your verification OTP is:
                </p>

                <h1>
                    ${otp}
                </h1>

                <p>
                    This OTP expires in 10 minutes.
                </p>
            `
        );

        return resp.status(201).json({
            success: true,
            message:
                "OTP sent to your email ",
            user
        })


    } catch (error) {
        console.error(`Signing error:${error}`);

        return resp.status(500).json({
            success: false,
            message: "Signup Failed"
        })

    }
}



// VERIFY EMAIL CONTROLLER

const verifyEmail = async (req, res) => {

    try {

        const {
            email,
            otp
        } = req.body;


        if (!email || !otp) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and OTP are required"
            });
        }


        const normalizedEmail =
            email
                .toLowerCase()
                .trim();


        const user =
            await User.findOne({
                email: normalizedEmail
            })
                .select(
                    "+emailOTP +emailOTPExpires"
                );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"
            });
        }


        if (user.isEmailVerified) {

            return res.status(400).json({

                success: false,

                message:
                    "Email is already verified"
            });
        }


        if (!user.emailOTP) {

            return res.status(400).json({

                success: false,

                message:
                    "Verification OTP not found"
            });
        }


        if (
            user.emailOTP !== otp
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid OTP"
            });
        }


        if (
            !user.emailOTPExpires ||
            user.emailOTPExpires < new Date()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "OTP has expired"
            });
        }


        user.isEmailVerified = true;

        user.emailOTP = undefined;

        user.emailOTPExpires = undefined;


        await user.save();


        return res.status(200).json({

            success: true,

            message:
                "Email verified successfully"
        });


    } catch (error) {

        console.error(
            "Verify email error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Email verification failed"
        });
    }
};



//  RESEND OTP CONTROLLER
const resendOtp = async (req, res) => {

    try {

        const { email } = req.body;


        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Email is required"
            });
        }


        const normalizedEmail =
            email
                .toLowerCase()
                .trim();


        const user =
            await User.findOne({
                email: normalizedEmail
            });


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"
            });
        }


        if (user.isEmailVerified) {

            return res.status(400).json({

                success: false,

                message:
                    "Email is already verified"
            });
        }


        const otp =
            generateOtp();


        user.emailOTP = otp;

        user.emailOTPExpires =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );


        await user.save();


        await sendEmail(

            user.email,

            "New Email Verification OTP",

            `
                <h2>Email Verification</h2>

                <p>
                    Hello ${user.name},
                </p>

                <p>
                    Your new verification OTP is:
                </p>

                <h1>
                    ${otp}
                </h1>

                <p>
                    This OTP expires in 10 minutes.
                </p>
            `
        );


        return res.status(200).json({

            success: true,

            message:
                "New verification OTP sent to your email"
        });


    } catch (error) {

        console.error(
            "Resend OTP error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to resend OTP"
        });
    }
};







// LOGIN CONTROLLER


const login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required"
            });
        }


        const normalizedEmail =
            email
                .toLowerCase()
                .trim();


        const user =
            await User.findOne({
                email: normalizedEmail
            })
                .select("+password");


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"
            });
        }


        const isPasswordCorrect =
            await user.matchPassword(
                password
            );


        if (!isPasswordCorrect) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"
            });
        }


        if (!user.isEmailVerified) {

            return res.status(403).json({

                success: false,

                message:
                    "Please verify your email before login"
            });
        }


        const token =
            generateToken(user._id.toString());


        return res.status(200).json({

            success: true,

            message:
                "Login successful",

            token,

            user
        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Login failed"
        });
    }
};



// GET ME CONTROLLER

const getMe = async (req, res) => {

    try {

        return res.status(200).json({

            success: true,

            user: req.user
        });


    } catch (error) {

        console.error(
            "Get user error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to get user details"
        });
    }
};



// UPDATE PROFILE CONTROLLER

const updateProfile = async (
    req,
    res
) => {

    try {

        const {
            name,
            phone
        } = req.body;


        if (
            name === undefined &&
            phone === undefined
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please provide name or phone"
            });
        }


        const user =
            await User.findById(
                req.user._id
            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"
            });
        }


        if (name !== undefined) {

            if (
                typeof name !== "string" ||
                name.trim().length < 2
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name must contain at least 2 characters"
                });
            }


            user.name =
                name.trim();
        }


        if (phone !== undefined) {

            user.phone =
                phone.trim();
        }


        await user.save();


        return res.status(200).json({

            success: true,

            message:
                "Profile updated successfully",

            user
        });


    } catch (error) {

        console.error(
            "Update profile error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update profile"
        });
    }
};


// CHANGE PASSWORD CONTROLLER
const changePassword = async (req, res) => {

    try {

        const {
            currentPassword,
            newPassword
        } = req.body;


        if (
            !currentPassword ||
            !newPassword
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Current password and new password are required"
            });
        }


        if (
            newPassword.length < 8
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "New password must contain at least 8 characters"
            });
        }


        if (
            currentPassword === newPassword
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "New password must be different from current password"
            });
        }


        const user =
            await User.findById(
                req.user._id
            )
                .select("+password");


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"
            });
        }


        const isCurrentPasswordCorrect =
            await user.matchPassword(
                currentPassword
            );


        if (
            !isCurrentPasswordCorrect
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Current password is incorrect"
            });
        }


        user.password =
            newPassword;


        await user.save();


        return res.status(200).json({

            success: true,

            message:
                "Password changed successfully"
        });


    } catch (error) {

        console.error(
            "Change password error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to change password"
        });
    }
};


// FORGOT PASSWORD CONTROLLER

const forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;


        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Email is required"
            });
        }


        const normalizedEmail =
            email
                .toLowerCase()
                .trim();


        const user =
            await User.findOne({
                email: normalizedEmail
            });

        if (!user) {

            return res.status(200).json({

                success: true,

                message:
                    "If an account exists with this email, a password reset OTP has been sent."
            });
        }


        const otp =
            generateOtp();


        user.resetPasswordOtp =
            otp;


        user.resetPasswordExpires =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );


        await user.save();


        await sendEmail(

            user.email,

            "Password Reset OTP",

            `
                <h2>Password Reset</h2>

                <p>
                    Hello ${user.name},
                </p>

                <p>
                    Your password reset OTP is:
                </p>

                <h1>
                    ${otp}
                </h1>

                <p>
                    This OTP expires in 10 minutes.
                </p>

                <p>
                    If you did not request a password reset,
                    you can ignore this email.
                </p>
            `
        );


        return res.status(200).json({

            success: true,

            message:
                "If an account exists with this email, a password reset OTP has been sent."
        });


    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to process password reset request"
        });
    }
};



// RESET PASSWORD CONTROLLER

const resetPassword = async (req, resp) => {

    try {

        const {
            email,
            otp,
            newPassword
        } = req.body;


        if (
            !email ||
            !otp ||
            !newPassword
        ) {

            return resp.status(400).json({

                success: false,

                message:
                    "Email, OTP and new password are required"
            });
        }


        if (
            newPassword.length < 8
        ) {

            return resp.status(400).json({

                success: false,

                message:
                    "New password must contain at least 8 characters"
            });
        }


        const normalizedEmail =
            email
                .toLowerCase()
                .trim();


        const user =
            await User.findOne({

                email:
                    normalizedEmail

            })
                .select(
                    "+resetPasswordOtp +resetPasswordExpires"
                );


        if (!user) {

            return resp.status(400).json({

                success: false,

                message:
                    "Invalid email or OTP"
            });
        }


        if (
            !user.resetPasswordOtp
        ) {

            return resp.status(400).json({

                success: false,

                message:
                    "Invalid or expired OTP"
            });
        }


        if (
            user.resetPasswordOtp !== otp
        ) {

            return resp.status(400).json({

                success: false,

                message:
                    "Invalid or expired OTP"
            });
        }


        if (
            !user.resetPasswordExpires ||
            user.resetPasswordExpires < new Date()
        ) {

            return resp.status(400).json({

                success: false,

                message:
                    "Invalid or expired OTP"
            });
        }


        user.password =
            newPassword;


        user.resetPasswordOtp =
            undefined;


        user.resetPasswordExpires =
            undefined;


        await user.save();


        return resp.status(200).json({

            success: true,

            message:
                "Password reset successfully"
        });


    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );


        return resp.status(500).json({

            success: false,

            message:
                "Failed to reset password"
        });
    }
};




export {
    signup,
    verifyEmail,
    login,
    getMe,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    resendOtp
};
import User from "../models/User.js";

import generateOtp
    from "../utils/generateOtp.js";

import sendEmail
    from "../utils/sendEmail.js";


const forgotPassword = async (
    req,
    res
) => {

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


        /*
         Do not reveal whether
         the email exists.
        */

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


export default forgotPassword;
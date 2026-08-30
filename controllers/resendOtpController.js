import User from "../models/User.js";

import generateOtp
    from "../utils/generateOtp.js";

import sendEmail
    from "../utils/sendEmail.js";


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


export default resendOtp;
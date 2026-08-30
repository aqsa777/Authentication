import User from "../models/User.js";


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


export default verifyEmail;
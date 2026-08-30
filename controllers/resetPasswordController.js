import User from "../models/User.js";


const resetPassword = async (
    req,
    res
) => {

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

            return res.status(400).json({

                success: false,

                message:
                    "Email, OTP and new password are required"
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

            return res.status(400).json({

                success: false,

                message:
                    "Invalid email or OTP"
            });
        }


        if (
            !user.resetPasswordOtp
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid or expired OTP"
            });
        }


        if (
            user.resetPasswordOtp !== otp
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid or expired OTP"
            });
        }


        if (
            !user.resetPasswordExpires ||
            user.resetPasswordExpires < new Date()
        ) {

            return res.status(400).json({

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


        return res.status(200).json({

            success: true,

            message:
                "Password reset successfully"
        });


    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to reset password"
        });
    }
};


export default resetPassword;
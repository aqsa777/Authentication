import User from "../models/User.js";


const changePassword = async (
    req,
    res
) => {

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


export default changePassword;
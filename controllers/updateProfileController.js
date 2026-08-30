import User from "../models/User.js";


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


export default updateProfile;
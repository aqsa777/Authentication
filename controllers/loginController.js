import User from "../models/User.js";

import generateToken
    from "../utils/generateToken.js";


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


export default login;
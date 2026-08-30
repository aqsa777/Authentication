import User from "../models/User.js";
import generateOtp from "../utils/generateOtp.js";
import sendEmail from "../utils/sendEmail.js";



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


export default signup;
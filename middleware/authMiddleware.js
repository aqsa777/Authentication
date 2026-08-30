import User from "../models/User.js";
import jwt from 'jsonwebtoken'


const protect = async (req, resp, next) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return resp.status(401).json({
                success: false,
                message: "Authorization token is required"
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return resp.status(401).json({
                success: false,
                message:
                    "Authorization token is missing"
            })
        }

        const decoded = jwt.verify(
            token, process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.id)

        if (!user) {
            return resp.status(401).json({
                success: false,
                message: "User beloging to this token no longer exists"
            })
        }

        req.user = user;
        next();


    } catch (error) {
        console.error(
            "Authentication error:",
            error.message
        );

        return resp.status(401).json({
            succcess: false,
            message: "Invalid or expired token"
        })
    }
}


export default protect;
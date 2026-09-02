import express from "express";
import {
    signup,
    verifyEmail,
    resendOtp,
    login,
    getMe,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();


router.post('/signup', signup);

router.post('/verifyemail', verifyEmail);

router.post('/resendotp', resendOtp);

router.post('/login', login);


router.get('/me', protect, getMe);

router.patch('/updateprofile', protect, updateProfile);

router.patch('/changepassword', protect, changePassword);

router.post('/forgotpassword', forgotPassword);

router.post('/resetpassword', resetPassword);

export default router;
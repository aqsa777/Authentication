import express from "express";
import signup from "../controllers/signupController.js";
import verifyEmail from "../controllers/verifyEmailController.js";
import resendOtp from "../controllers/resendOtpController.js";
import login from "../controllers/loginController.js";
import getMe from "../controllers/getMeController.js";
import protect from "../middleware/authMiddleware.js";
import updateProfile from "../controllers/updateProfileController.js";
import changePassword from "../controllers/changePasswordController.js";
import forgotPassword from "../controllers/forgetPasswordController.js";
import resetPassword from "../controllers/resetPasswordController.js";


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
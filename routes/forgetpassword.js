const express = require('express');
const User = require('../models/Users');
const { sendOTP, generateOTP, saveOTP } = require('../middleware/handleOtp');
const OTPModel = require('../models/otpModel');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

//Route 1: To generate OTP via email using POST: api/forgetpwd/request-otp 
router.post('/request-otp', [
    body('email', 'Enter a valid email').isEmail(),
], async (req, res) => {
    //If there are error return bad request
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    try {
        const email = req.body.email;
        let user = await User.findOne({ email: email });
        if (!user) {
            res.status(404).json({ success, error: 'User not found' });
        } else {
            const otp = generateOTP();
            await saveOTP(user._id, otp);
            await sendOTP(email, otp);
            success = true;
            res.status(200).json({ success, message: 'OTP sent to your email' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success, error: 'Internal Server error' });
    }
});

//Route 2: To veriry OTP using POST: api/forgetpwd/verify-otp
router.post('/verify-otp', [
    body('otp', 'otp must be 6 digit').isLength({ min: 6 }),
    body('email', 'Enter a registered email').isEmail(),
], async (req, res) => {
    //If there are error return bad request
    let success = false;
    const { email, otp} = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success, error: 'User not found' });
        }

        const otpRecord = await OTPModel.findOne({ userId: user._id, otp });

        if (!otpRecord || otpRecord.expirationTime < Date.now()) {
            await OTPModel.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ success, error: 'Invalid or expired OTP' });
        }

        // Optionally, delete the OTP record after successful password reset
        await OTPModel.deleteOne({ _id: otpRecord._id });
        success = true;
        res.status(200).json({ success, message: 'OTP is verified successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success, error: 'Internal Server error' });
    }
});

//Route 3: To change old password using POST: api/forgetpwd/changepassword
router.post('/changepassword', [
    body('email', 'Enter a registered email').isEmail(),
    body('newPassword', 'Password should be atleast 5 character').isLength({ min: 5 }),
], async (req, res) => {
    //If there are error return bad request
    let success = false;
    const { email, newPassword } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success, error: 'User not found' });
        }

        // Hashing the password for security
        const salt = await bcrypt.genSalt(10);
        const secPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password
        user.password = secPassword;
        await user.save();
        success = true;
        res.status(200).json({ success, message: 'Password has been reset successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success, error: 'Internal Server error' });
    }
});
module.exports = router;
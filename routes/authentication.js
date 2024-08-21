const express = require('express');
const User = require('../models/Users');
const SignupOTP = require('../models/SignupOtp');
const { sendOTP, generateOTP, saveSignupOtp } = require('../middleware/handleOtp');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchUser');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

//Route 1: Create a user using : POST "/api/auth/createuser" , No login required.
router.post('/createuser', [
    body('name','Name must be atleast 3 character').isLength({ min: 3 }),
    body('email','Enter a valid email').isEmail(),
    body('password','Password should be atleast 5 character').isLength({ min: 5 }),
], async (req, res) => {
    //If there are error return bad request
    let success =  false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({success, errors: errors.array() });
    }

    try {
        // Check whether the user with this email exists already
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({success, error: 'Sorry! A user with this email already exists' });
        }

        //hashing password by using bryptjs package
        const salt = await bcrypt.genSalt(10);
        const secPassword = await bcrypt.hash(req.body.password,salt);

        // Create new user
        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: secPassword
        });
        //waiting to save user in database
        await user.save();
        success = true;
        res.status(200).json({success});
    } catch (error) {
        console.error(error.message);
        res.status(500).json({success, error: 'Internal Server error'});
    }
});

//Route 2: Send email for verifiction : POST "/api/auth/sendemail" , No login required.
router.post('/sendemail', [
    body('email','Enter a valid email').isEmail()
], async (req, res) => {
    //If there are error return bad request
    let success =  false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({success, errors: errors.array() });
    }

    try {
        // Check whether the user with this email exists already
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({success, error: 'Sorry! A user with this email already exists' });
        }

        //Email verification process
        const otp = generateOTP();
        await saveSignupOtp(req.body.email, otp);
        await sendOTP(req.body.email, otp);
        success = true;
        res.status(200).json({success});
    } catch (error) {
        console.error(error.message);
        res.status(500).json({success, error: 'Internal Server error'});
    }
});

//Route 3: Verify OTP using : POST "/api/auth/verifyotp" , No login required.
router.post('/verifyotp', [
    body('otp', 'otp must be 6 digit').isLength({ max: 6 }),
    body('email','Enter a valid email').isEmail()
], async (req, res) => {
    //If there are error return bad request
    let success =  false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({success, errors: errors.array() });
    }

    try {
        //Email verification process
        const otpRecord = await SignupOTP.findOne({ email: req.body.email, otp: req.body.otp });
        if (!otpRecord || otpRecord.expirationTime < Date.now()) {
            await SignupOTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ success, error: 'Invalid or expired OTP' });
        }
        
        await SignupOTP.deleteOne({ _id: otpRecord._id });
        success = true;
        res.status(200).json({success});
    } catch (error) {
        console.error(error.message);
        res.status(500).json({success, error: 'Internal Server error'});
    }
});


//Route 4: Authenticate a user using : POST "/api/auth/login" , No login required.
router.post('/login', [
    body('email','Enter a valid email').isEmail(),
    body('password','Password can not be blank').exists(),
], async (req, res) => {
    let success = false;
    //If there are error return bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({success, errors: errors.array() });
    }

    const {email, password} = req.body;
    try {
        //Checking email is valid or not
        let user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({success,error:"Please enter valid credentials"});
        }
        
        //Checking password is valid or not
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({success,error:"Please enter valid credentials"});
        }

        const data={
            user:{
                id: user.id
            }
        }
        success = true;
        const authToken = jwt.sign(data,process.env.JWT_SECRET);
        res.json({success,authToken});

    } catch (error) {
        console.log(error.message);
        res.status(500).json({success, error: 'Internal Server error'});
    }
});

//Route 5: Get loggedin user details using : POST "/api/auth/getuser" . login required.
router.post('/getuser', fetchuser, async (req,res)=>{
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.status(200).send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
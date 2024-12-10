const User = require("../model/UserSchema");
const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const sendOtp = require("../utils/SendOtp");
const generateOtpEmail = require("../utils/Emailformat");
const sendToken = require("../utils/JwkToken");
const bcrypt = require("bcrypt");
// ! user register controller
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { fullName, email, password } = req.body;

  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    return next(new ErrorHandler(409, "User already registered"));
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpire = new Date();
  otpExpire.setMinutes(otpExpire.getMinutes() + 10);
  let message = generateOtpEmail(fullName, otp);
  try {
    await sendOtp({
      email: email,
      subject: "Your OTP is here",
      message,
    });
  } catch (error) {
    console.log("sendOtp error: " + error);
    return next(new ErrorHandler(500, "Failed to send OTP"));
  }

  const user = await User.create({
    fullName,
    email,
    password,
    otp,
    otpExpire,
  });
  user.password = undefined;
  sendToken(user, 201, res);
});

// ? Verify user Otp
exports.verifyOtp = asyncHandler(async (req, res, next) => {
  const { otp } = req.body;

  const user = await User.findOne({ otp });

  if (!user) {
    return next(new ErrorHandler(404, "User not found"));
  }

  if (!user.otp || user.otp !== otp) {
    return next(new ErrorHandler(400, "Invalid OTP"));
  }
  const currentTime = new Date();
  if (currentTime > user.otpExpire) {
    return next(
      new ErrorHandler(400, "OTP has expired. Please request a new one.")
    );
  }
  user.isVerified = true;
  user.otp = null;
  user.otpExpire = null;
  await user.save();
  res.status(200).json({
    success: true,
    message: "OTP verified successfully. You are now verified!",
  });
});

// ? Resend Otp controller
exports.resendOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler(404, "User not found"));
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpire = new Date();
  otpExpire.setMinutes(otpExpire.getMinutes() + 10);

  user.otp = otp;
  user.otpExpire = otpExpire;
  await user.save();

  let message = generateOtpEmail(user.firstName, user.lastName, otp);

  try {
    await sendOtp({
      email: user.email,
      subject: "Your New OTP",
      message,
    });
  } catch (error) {
    console.log("sendOtp error: " + error);
    return next(new ErrorHandler(500, "Failed to send OTP"));
  }

  res.status(200).json({
    success: true,
    message: "A new OTP has been sent to your email.",
  });
});

// ? login user controller
exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      new ErrorHandler(400, "Please enter a valid email and password")
    );
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler(401, "Invalid email or password"));
  }

  const isPasswordMatch = await user.isPasswordCorrect(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler(401, "Invalid password"));
  }

  sendToken(user, 200, res);
});

// ? Logout user controller

exports.logOutUser = asyncHandler(async (req, res, next) => {
  res.clearCookie("token", null, {
    expire: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    sucess: true,
    message: "User logged out",
  });
});

// ? Login with google auth

exports.googleLogin = asyncHandler(async (req, res, next) => {
  const { email, fullName, avatar } = req.body;
  let existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(200).json({
      message: "User logged in successfully",
      user: existingUser,
    });
  }

  const generatePassword =
    Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

  const hashedPassword = await bcrypt.hash(generatePassword, 10);

  const newUser = new User({
    fullName,
    email,
    password: hashedPassword,
    confirmPassword: hashedPassword,
    avatar,
    isVerified: true,
  });

  const savedUser = await newUser.save();

  res.status(201).json({
    message: "User registered and logged in successfully",
    user: savedUser,
  });
});

// ? update user profile

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, avatar, aboutUser, password, contactNumber, address } =
      req.body;
    const userId = req.params.id;
    const existingUser = await User.findOne({ _id: userId });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateFields = {};

    if (fullName !== undefined) updateFields.fullName = fullName;
    if (aboutUser !== undefined) updateFields.aboutUser = aboutUser;
    if (contactNumber !== undefined) updateFields.contactNumber = contactNumber;
    if (password !== undefined) {
      const hashPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashPassword;
    }

    if (avatar !== undefined) updateFields.avatar = avatar;
    if (address !== undefined) updateFields.address = address;

    const updatedUser = await User.findByIdAndUpdate(
      existingUser._id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(401)
        .json({ message: "You can only update with your own account" });
    }

    res.status(200).json({
      message: "Update user successfully",
      result: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.showUser = async (req, res) => {
  try {
    const user = await User.find({ role: "user" });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(404).json({ message: "sth went wrong" });
  }
};

const express = require("express");
const userRouter = express.Router();

const {
  registerUser,
  loginUser,
  logOutUser,
  verifyOtp,
  resendOtp,
  googleLogin,
  updateProfile,
  showUser,
} = require("../controller/userController");

const {
  createListing,
  updateListing,
  deleteListing,
  getUserListing,
  getAllListing,
  getListing,
} = require("../controller/userOperation/userListingController");

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").get(logOutUser);
userRouter.route("/verify/otp").post(verifyOtp);
userRouter.route("/resend/otp").post(resendOtp);
userRouter.route("/auth/google").post(googleLogin);
userRouter.route("/me/update/:id").put(updateProfile);

// ? todo: User listing routes is here
userRouter.route("/create/listing").post(createListing);
userRouter.route("/update/listing/:id").put(updateListing);
userRouter.route("/delete/listing/:id").delete(deleteListing);
userRouter.route("/single/listing/:id").get(getUserListing);
userRouter.route("/all/listing/:id").get(getAllListing);
//get all users

userRouter.route("/allUsers").get(showUser);

userRouter.route("/listing/:id").get(getListing);

module.exports = userRouter;

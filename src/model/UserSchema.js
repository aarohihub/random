const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      required: [true, "Please enter your first Name"],
    },

    email: {
      type: String,
      required: [true, "Please enter your email address"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 5,
    },
    avatar: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },
    otp: {
      type: String,
      required: false,
    },
    isVerified: { type: Boolean, default: false },
    role: {
      type: String,
      default: "user",
    },

    aboutUser: {
      type: String,
      default: "Hey there! I'm using Jagga Deal.",
    },

    contactNumber: {
      type: String,
      default: "Not Provided",
    },
    address: {
      type: String,
      required: false,
    },

    otpExpire: { type: Date, required: false },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },

  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10); // Corrected here
  next();
});
UserSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.getJWToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model("User", UserSchema);

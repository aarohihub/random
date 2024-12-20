const Auction = require("../model/AuctionListingSchema");
const AuctionParticipate = require("../model/AuctionParticipateSchema");
const UserModel = require("../model/UserSchema");
const nodemailer = require("nodemailer");
const generateAuctionEmail = require("../utils/email/newsLetter");
require("dotenv").config();
const autherEmail = process.env.SMPT_MAIL;
const autherPassword = process.env.SMPT_PASSWORD;

const participate = async (req, res) => {
  try {
    const { userDetails, auctionId, bidAmount } = req.body;

    const lastBid = await AuctionParticipate.findOne({ auctionId }).sort({
      createdAt: -1,
    });
    const auctionListing = await Auction.findOne({ _id: req.params.id });
    if (!auctionListing) {
      return res.status(404).json({ error: "Auction not found" });
    }

    if (lastBid && lastBid.userDetails.toString() === userDetails.toString()) {
      return res
        .status(400)
        .json({ error: "User made the last bid and cannot participate again" });
    }
    if (bidAmount <= auctionListing.MinimumPrice) {
      return res
        .status(400)
        .json({ error: "Bid amount must be higher than the minimum bid" });
    }

    const participation = new AuctionParticipate({
      userDetails,
      auctionId,
      bidAmount,
    });

    const savedParticipation = await participation.save();

    return res.status(201).json(savedParticipation);
  } catch (error) {
    console.error("Error participating in auction:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: autherEmail,
    pass: autherPassword,
  },
});

const getHighestBidder = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const highestBidAuction = await AuctionParticipate.findOne({ auctionId })
      .sort({ bidAmount: -1 })
      .populate("userDetails")
      .limit(1);

    if (!highestBidAuction) {
      return res.status(404).json({ error: "No bids found" });
    }

    const { userDetails, bidAmount, emailSent } = highestBidAuction;
    if (!emailSent) {
      const mailOptions = {
        from: "jaggadeal@gmail.com",
        to: userDetails.email,
        subject: "Congratulations! You are the highest bidder",
        text: `Dear ${userDetails.firstName},\n\nCongratulations! You are the highest bidder with a bid amount of ${bidAmount}.\n\nThank you for participating in the auction.\n\nBest regards,\nAuction Team \nContact us 9812121212`,
      };

      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
          highestBidAuction.emailSent = true;
          await highestBidAuction.save();
        }
      });
    }

    return res.status(200).json({ userDetails, bidAmount });
  } catch (error) {
    console.error("Error getting highest bidder:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const bidderUsers = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const user = await AuctionParticipate.findOne({ auctionId })
      .sort({
        bidAmount: -1,
      })
      .populate("userDetails");
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(403).json({ error: "Something went wrong", error });
  }
};

module.exports = { participate, getHighestBidder, bidderUsers };

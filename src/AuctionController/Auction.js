// const Auction = require("../model/AuctionListingSchema");
// const UserModel = require("../model/UserSchema");
// const createAuction = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       address,
//       bathrooms,
//       bedrooms,
//       furnished,
//       parking,
//       imageUrl,
//       userRef,
//       MinimumPrice,
//       endTime,
//     } = req.body;

//     if (new Date(endTime) <= new Date()) {
//       return res
//         .status(400)
//         .json({ message: "End time must be in the future" });
//     }

//     let auction = new Auction({
//       title,
//       description,
//       address,
//       bathrooms,
//       bedrooms,
//       furnished,
//       parking,
//       imageUrl,
//       userRef,
//       MinimumPrice,
//       endTime,
//     });
//     await auction.save();
//     res.status(201).json({ message: "Auction created successfully", auction });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };
const Auction = require("../model/AuctionListingSchema");
const UserModel = require("../model/UserSchema");
const nodemailer = require("nodemailer");
const { generateAuctionEmail } = require("../utils/email/newsLetter");
require("dotenv").config();
const autherEmail = process.env.SMPT_MAIL;
const autherPassword = process.env.SMPT_PASSWORD;
const createAuction = async (req, res) => {
  try {
    const {
      title,
      description,
      address,
      bathrooms,
      bedrooms,
      furnished,
      parking,
      imageUrl,
      userRef,
      MinimumPrice,
      endTime,
    } = req.body;

    if (new Date(endTime) <= new Date()) {
      return res
        .status(400)
        .json({ message: "End time must be in the future" });
    }

    let auction = new Auction({
      title,
      description,
      address,
      bathrooms,
      bedrooms,
      furnished,
      parking,
      imageUrl,
      userRef,
      MinimumPrice,
      endTime,
    });

    await auction.save();

    const users = await UserModel.find({}, "email");
    const emailList = users.map((user) => user.email);
    const innerHTML = await generateAuctionEmail(title, MinimumPrice);
    if (emailList.length > 0) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: autherEmail,
          pass: autherPassword,
        },
      });
      const mailOptions = {
        from: autherEmail,
        to: emailList.join(","),
        subject: "New Auction Updates",
        html: innerHTML,
      };
      await transporter.sendMail(mailOptions);
    }

    res.status(201).json({ message: "Auction created successfully", auction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const displayAuctionList = async (req, res) => {
  try {
    const result = await Auction.find();
    if (result) {
      return res.status(200).json(result);
    } else {
      return res.status(203).json({ message: "result not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const displaySingleAuctionList = async (req, res) => {
  try {
    const result = await Auction.findOne({ _id: req.params.id });
    if (result) {
      return res.status(200).json({ message: "result found", result });
    } else {
      return res.status(203).json({ message: "result not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "sth went wrong", error });
  }
};

const displayUniqueSingleList = async (req, res) => {
  try {
    let data = await Auction.find({ userRef: req.params.id });

    if (data) {
      return res.status(200).json(data);
    } else {
      return res.status(403).json({ message: "result not found" });
    }
  } catch (error) {
    res.status(404).json({ message: "sth went wrong", error });
  }
};

const deleteAuctionListing = async (req, res) => {
  try {
    const data = await Auction.deleteOne({ _id: req.params.id });
    if (!data) {
      return res.status(400).json({ message: "data is not found" });
    }
    return res
      .status(200)
      .json({ message: "data is successfully deleted" + data });
  } catch (error) {
    return res.status(402).json({ message: "Error deleting", error });
  }
};

const updateAuctionListing = async (req, res) => {
  try {
    const check = await Auction.findOne({ _id: req.params.id });
    if (!check) {
      return res.status(402).json({ message: "Listing not found" });
    }
    const api = await Auction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    return res.status(200).json(api);
  } catch (error) {
    return res.status(405).json({ message: "sth wrong", error });
  }
};

const newsLetter = async (req, res) => {
  try {
    const user = await UserModel.find({});
    const auction = await Auction.findOne;
    const emailList = user.map((user) => user.email);
    const innerHTML = await generateAuctionEmail(user, auction);
    const mailOptions = {
      from: autherEmail,
      to: user.email,
      subject: "New Auction Updates",
      innerHTML,
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
  } catch (error) {
    console.log("error in sending newsletter", error);
  }
};

module.exports = {
  createAuction,
  displayAuctionList,
  displaySingleAuctionList,
  displayUniqueSingleList,
  deleteAuctionListing,
  updateAuctionListing,
};

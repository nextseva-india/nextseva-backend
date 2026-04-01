const express = require("express");
const router = express.Router();

const User = require("../models/User");

// 🔥 Register API
router.post("/register", async (req, res) => {
  try {
    const { name, shop, mobile, email, address, dob, docType, docNo, password } = req.body;

    if (!mobile || !password) {
      return res.json({
        status: "error",
        message: "All fields required"
      });
    }

    const existingUser = await User.findOne({ mobile });

    if (existingUser) {
      return res.json({
        status: "error",
        message: "User already exists"
      });
    }

    const newUser = new User({
      name, shop, mobile, email, address, dob, docType, docNo, password
    });

    await newUser.save();

    res.json({
      status: "success",
      message: "Registration successful"
    });

  } catch (err) {
    console.log(err);
    res.json({
      status: "error",
      message: "Server error"
    });
  }
});

// 🔥 Login API
router.post("/login", async (req, res) => {
  const { mobile, password } = req.body;

  const user = await User.findOne({
    $or: [{ mobile: mobile }, { email: mobile }],
    password: password
  });

  if (user) {
    res.json({
      status: "success",
      message: "Login successful",
      user: user
    });
  } else {
    res.json({
      status: "error",
      message: "Invalid credentials"
    });
  }
});

module.exports = router;

// 🔥 SET MPIN
router.post("/set-mpin", async (req, res) => {
  try {
    const { mobile, mpin } = req.body;

    if (!mobile || !mpin) {
      return res.json({
        status: "error",
        message: "Missing data"
      });
    }

const user = await User.findOne({ mobile });

if (!user) {
  return res.json({
    status: "error",
    message: "User not found"
  });
}

// 🔥 set mpin
user.mpin = mpin;

// 🔥 profileComplete check
if (user.mpin && user.bankAccounts.some(b => b.primary)) {
  user.profileComplete = true;
} else {
  user.profileComplete = false;
}

await user.save();

res.json({
  status: "success",
  message: "MPIN saved",
  user: user
});

  } catch (err) {
    console.log(err);
    res.json({
      status: "error",
      message: "Server error"
    });
  }
});

// 🔥 ADD BANK ACCOUNT
router.post("/add-bank", async (req, res) => {
  try {
    const { mobile, name, accountNumber, ifsc } = req.body;

    if (!mobile || !name || !accountNumber || !ifsc) {
      return res.json({
        status: "error",
        message: "All fields required"
      });
    }

    const user = await User.findOne({ mobile });

    if (!user) {
      return res.json({
        status: "error",
        message: "User not found"
      });
    }

    // 🔥 LIMIT 3 BANK ACCOUNTS
    if (user.bankAccounts.length >= 3) {
      return res.json({
        status: "error",
        message: "Max 3 bank accounts allowed"
      });
    }

    // 🔥 ADD BANK
    user.bankAccounts.push({
      name,
      accountNumber,
      ifsc
    });

    await user.save();

    res.json({
      status: "success",
      message: "Bank added successfully",
      user: user
    });

  } catch (err) {
    console.log(err);
    res.json({
      status: "error",
      message: "Server error"
    });
  }
});

// 🔥 SET PRIMARY BANK
router.post("/set-primary-bank", async (req, res) => {
  try {
    const { mobile } = req.body;
    let { index } = req.body;

    index = Number(index);

    console.log("REQ:", mobile, index);

    // 🔒 validation
    if (!mobile || index === undefined) {
      return res.json({
        status: "error",
        message: "Mobile & index required"
      });
    }

    const user = await User.findOne({ mobile });

    if (!user) {
      return res.json({
        status: "error",
        message: "User not found"
      });
    }

    if (isNaN(index) || index < 0 || index >= user.bankAccounts.length) {
      return res.json({
        status: "error",
        message: "Invalid index"
      });
    }

    // 🔥 SET PRIMARY
   user.bankAccounts.forEach((b, i) => {
  b.primary = (i === Number(index));
});

// 🔥 ADD THIS
if (user.mpin && user.bankAccounts.some(b => b.primary)) {
  user.profileComplete = true;
} else {
  user.profileComplete = false;
}

await user.save();

    res.json({
      status: "success",
      message: "Primary updated",
      user: user
    });

  } catch (err) {
    console.log("SET PRIMARY ERROR:", err);
    res.json({
      status: "error",
      message: "Server error"
    });
  }
});
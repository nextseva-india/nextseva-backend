const express = require("express");
const router = express.Router();

const User = require("../models/User");

// 🔥 RETAILER ID
function generateRetailerId() {
  const now = new Date();

  const month = String(now.getMonth() + 1).padStart(2, "0"); // MM
  const year  = String(now.getFullYear()).slice(-2);        // YY

  // 🔤 random letter (a-z)
  const letter = String.fromCharCode(97 + Math.floor(Math.random() * 26));

  // 🔢 5 digit random
  const random = Math.floor(10000 + Math.random() * 90000);

  return `NS${month}${year}${letter}${random}`;
}

// 🔥 Register API
router.post("/register", async (req, res) => {
  try {
    const { name, shop, mobile, email, address, dob, docType, docNo, password } = req.body;

    if (!mobile || !password) {
      return res.json({
        status: "error",
        message: "Mobile and password required"
      });
    }

    // 🔒 DUPLICATE CHECK
    const existingUser = await User.findOne({
      $or: [
        { mobile: mobile },
        { email: email },
        { docNo: docNo }
      ]
    });

    if (existingUser) {

      let errorMsg = "User already exists";

      if (existingUser.mobile === mobile) {
        errorMsg = "Mobile number already registered";
      } else if (existingUser.email === email) {
        errorMsg = "Email already registered";
      } else if (existingUser.docNo === docNo) {
        errorMsg = "Document already registered";
      }

      return res.json({
        status: "error",
        message: errorMsg
      });
    }

// 🔥 GENERATE UNIQUE RETAILER ID
let retailerId;

while (true) {
  retailerId = generateRetailerId();

  const exists = await User.findOne({ retailerId });
  if (!exists) break;
}

    const newUser = new User({
      name,
      shop,
      mobile,
      email,
      address,
      dob,
      docType,
      docNo,
      password,
      retailerId
    });

    await newUser.save();

    res.json({
      status: "success",
      message: "Registration successful"
    });

  } catch (err) {

    // 🔥 Mongo duplicate error handle (extra safety)
    if (err.code === 11000) {
      return res.json({
        status: "error",
        message: "Duplicate data detected"
      });
    }

    console.log("Register error:", err);

    res.json({
      status: "error",
      message: "Server error"
    });
  }
});

// 🔥 Login API
router.post("/login", async (req, res) => {
  const { mobile: identifier, password } = req.body;

const user = await User.findOne({
  $or: [{ mobile: identifier }, { email: identifier }],
  password: password
});

 if (user) {

  // 🔥 BLOCK CHECK
  if (user.status === "blocked") {
    return res.json({
      status: "error",
      message: "Your account is blocked. Contact admin."
    });
  }

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

  }
  catch (err) {
  console.log("MPIN ERROR FULL:", err);
  res.json({
    status: "error",
    message: err.message
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

module.exports = router;
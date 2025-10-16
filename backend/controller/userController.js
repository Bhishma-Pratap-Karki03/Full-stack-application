const User = require("../model/userModel");
const Profile = require("../model/ProfileModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadsDir = path.join(__dirname, "..", "uploads", "profile-pictures");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Middleware for handling file upload
const uploadMiddleware = upload.single("profilePicture");

async function createUserController(req, res) {
  // First handle the file upload
  uploadMiddleware(req, res, async function (err) {
    try {
      if (err) {
        return res.status(400).json({
          message: err.message,
        });
      }

      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        // If file was uploaded but validation failed, remove it
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          message: "All Fields are required",
        });
      }

      const checkUser = await User.findOne({ email });
      if (checkUser) {
        // If file was uploaded but user exists, remove it
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          message: "User with this email already exists",
        });
      }

      const encryptPassword = await bcrypt.hash(password, 10);

      const userData = {
        name,
        email,
        password: encryptPassword,
        profilePicture: req.file ? req.file.filename : "", // Store only filename
      };

      const user = new User(userData);
      await user.save();

      // Create profile with profile picture if uploaded
      try {
        const profileData = {
          user: user._id,
          bio: "",
          profilePicture: req.file ? req.file.filename : "", // Store filename
          skills: [],
          github: "",
          linkedin: "",
          portfolioUrl: "",
        };
        const profile = new Profile(profileData);
        await profile.save();
      } catch (profileError) {
        console.log(
          "Profile creation skipped or failed:",
          profileError.message
        );
      }

      res.status(201).json({
        message: "User Created successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
        },
      });
    } catch (error) {
      console.error("Error creating user:", error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({
        message: "Internal server error",
      });
    }
  });
}

async function loginHandleController(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "All Fields are required",
    });
  }

  const checkUser = await User.findOne({ email }).select("+password");
  if (!checkUser) {
    return res.status(400).json({
      message: "User with this email does not exist",
    });
  }

  const comparePassword = await bcrypt.compare(password, checkUser.password);
  if (comparePassword) {
    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
      },
      process.env.AUTH_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      message: "Login Successful",
      accessToken: token,
    });
  } else {
    return res.status(400).json({
      message: "Invalid Credentials",
    });
  }
}

async function getUserListController(req, res) {
  try {
    const userList = await User.find().select("-password"); // Exclude password
    res.status(200).json({
      message: "User List",
      users: userList,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
}

// These functions need implementation
async function updateProfileMeController(req, res) {
  // Implementation needed
  res.status(501).json({ message: "Not implemented" });
}

async function viewMyProfileController(req, res) {
  const { id } = req.user;
  // Implementation needed
  res.status(501).json({ message: "Not implemented" });
}

async function viewProfileofUserController(req, res) {
  const { id } = req.params;
  // Implementation needed
  res.status(501).json({ message: "Not implemented" });
}

async function viewMyProfileController(req, res) {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profile = await Profile.findOne({ user: userId });

    // If profile doesn't exist, create a basic one
    if (!profile) {
      profile = new Profile({
        user: userId,
        bio: "",
        skills: [],
        github: "",
        linkedin: "",
        portfolioUrl: "",
      });
      await profile.save();
    }

    res.status(200).json({
      message: "Profile retrieved successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        bio: profile.bio,
        skills: profile.skills,
        github: profile.github,
        linkedin: profile.linkedin,
        portfolioUrl: profile.portfolioUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function updateProfileMeController(req, res) {
  uploadMiddleware(req, res, async function (err) {
    try {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const userId = req.user.id;
      const { bio, skills, github, linkedin, portfolioUrl } = req.body;

      let profile = await Profile.findOne({ user: userId });

      // If profile doesn't exist, create a new one
      if (!profile) {
        profile = new Profile({ user: userId });
      }

      // Update profile fields
      if (bio !== undefined) profile.bio = bio;
      if (skills !== undefined) profile.skills = JSON.parse(skills);
      if (github !== undefined) profile.github = github;
      if (linkedin !== undefined) profile.linkedin = linkedin;
      if (portfolioUrl !== undefined) profile.portfolioUrl = portfolioUrl;

      // Handle profile picture upload
      if (req.file) {
        // Delete old profile picture if exists
        if (profile.profilePicture) {
          const oldPicturePath = path.join(uploadsDir, profile.profilePicture);
          if (fs.existsSync(oldPicturePath)) {
            fs.unlinkSync(oldPicturePath);
          }
        }

        profile.profilePicture = req.file.filename;

        // Also update the user's profilePicture field
        await User.findByIdAndUpdate(userId, {
          profilePicture: req.file.filename,
        });
      }

      await profile.save();

      res.status(200).json({
        message: "Profile updated successfully",
        profile: {
          bio: profile.bio,
          skills: profile.skills,
          github: profile.github,
          linkedin: profile.linkedin,
          portfolioUrl: profile.portfolioUrl,
          profilePicture: profile.profilePicture,
        },
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}

async function viewProfileofUserController(req, res) {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = await Profile.findOne({ user: userId });

    res.status(200).json({
      message: "User profile retrieved successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        bio: profile?.bio || "",
        skills: profile?.skills || [],
        github: profile?.github || "",
        linkedin: profile?.linkedin || "",
        portfolioUrl: profile?.portfolioUrl || "",
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  createUserController,
  loginHandleController,
  getUserListController,
  updateProfileMeController,
  viewMyProfileController,
  viewProfileofUserController,
};
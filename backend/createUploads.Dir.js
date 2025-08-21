const fs = require("fs");
const path = require("path");

const uploadsDir = path.join(__dirname, "uploads", "profile-pictures");

// Create directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Uploads directory created:", uploadsDir);
} else {
  console.log("Uploads directory already exists:", uploadsDir);
}

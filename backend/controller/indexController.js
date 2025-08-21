function verifyUserController(res, req) {
  const user = req.user;
  if (user) {
    res.status(200).json({
      message: "User verified successfully",
    });
  } else {
    res.status(401).json({
      message: "User is not authenticated",
    });
  }
}

module.exports = {
  verifyUserController,
};

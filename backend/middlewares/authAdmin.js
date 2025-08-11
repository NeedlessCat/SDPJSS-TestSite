import jwt from "jsonwebtoken";

//admin authentication middleware..
const authAdmin = async (req, res, next) => {
  const { atoken } = req.headers;
  if (!atoken) {
    return res
      .status(401)
      .json({ success: false, message: "Not Authorized. Please login again." });
  }

  try {
    const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);
    // Attach the decoded admin info (id and role) to the request object
    req.admin = token_decode;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, message: "Error: Invalid Token" });
  }
};

export default authAdmin;

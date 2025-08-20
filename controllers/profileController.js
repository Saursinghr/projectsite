const Employee = require("../model/Employee");
const bcrypt=require('bcryptjs')
// GET Profile
const getProfile = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Employee.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User retrieved successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// UPDATE Profile
const postProfile = async (req, res) => {
  try {
    const { email, newPassword, name } = req.body;

    let user = await Employee.findOne({ email });
 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await Employee.updateOne(
      { email },
      { $set: { password: hashedPassword, name } }
    );

    user = await Employee.findOne({ email }); // fetch updated user

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { postProfile, getProfile };

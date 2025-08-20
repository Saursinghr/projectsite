const express = require("express");
const router = express.Router();
const Employee = require("../model/Employee");
const Attendance = require("../model/Attendance");
function getISODateWithOffset() {
  return new Date().toISOString().replace("Z", "+00:00");
}

//handle client clocks-in
router.post("/", async (req, res) => {
  try {
    const { email, location,siteId } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await Employee.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const id = user._id;
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    await Attendance.updateOne(
      { employeeId: id, date: todayMidnight ,siteId:siteId},
      { $set: { "clockOut.time": new Date(), "clockOut.location": location } }
    );

    res.status(200).json({ message: "clocked out Successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;

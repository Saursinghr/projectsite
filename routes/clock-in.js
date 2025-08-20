const express = require("express");
const router = express.Router();
const Employee = require("../model/Employee");
const Attendance = require("../model/Attendance");

//handle client clocks-in
router.post("/", async (req, res) => {
  try {  
    const { email, location ,siteId} = req.body;
  
    if (!email ) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await Employee.findOne({ email });
      console.log(user._id)
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const id = user._id;
    console.log(id)
    const record = new Attendance({
      employeeId : id,
      clockIn : {location : location},
      siteId:siteId
    });
    await record.save();
    res.status(200).json({message : "clocked in Successfully"});
  }
  catch (err) {
    res.status(500).json({message : err.message});
  }
}); 
module.exports = router;
const express = require("express");
const router = express.Router();
const weekController = require("../controllers/weekController");

router.get("/", weekController.getAllWeeks);
router.post("/", weekController.addWeek);
router.put("/task-status", weekController.updateTaskStatus);
router.post("/addDailyTask", weekController.addDailyTask);

// Add this route for updating a week by id
router.put("/:id", weekController.updateWeek);

module.exports = router;

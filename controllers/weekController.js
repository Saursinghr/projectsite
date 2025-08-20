const Week = require('../model/week');

exports.getAllWeeks = async (req, res) => {
  try {
    const { siteId } = req.query;
    let query = {};
    
    if (siteId) {
      query.siteId = siteId;
    }
    
    const weeks = await Week.find(query);
    res.json(weeks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addWeek = async (req, res) => {
  try {
    const { name, tasks, siteId } = req.body;
    const newWeek = new Week({ name, tasks, siteId });
    const savedWeek = await newWeek.save();
    res.status(201).json(savedWeek);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.addDailyTask = async (req, res) => {
  try {
    const { weekId, user, task } = req.body;
    const week = await Week.findById(weekId);
    if (!week) {
      return res.status(404).json({ message: 'Week not found' });
    }
    
    const newTask = { user, task, status: 'open' };
    week.tasks.push(newTask);
    await week.save();
    
    res.status(201).json(week);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { weekId, taskIndex, status } = req.body;
    const week = await Week.findById(weekId);
    if (!week) return res.status(404).json({ message: 'Week not found' });
    if (typeof taskIndex !== 'number' || !['open', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid task index or status' });
    }
    if (!week.tasks[taskIndex]) {
      return res.status(404).json({ message: 'Task not found in week' });
    }
    week.tasks[taskIndex].status = status;
    await week.save();
    res.json(week);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateWeek = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedWeek = await Week.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedWeek) {
      return res.status(404).json({ message: 'Week not found' });
    }
    res.json(updatedWeek);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}; 
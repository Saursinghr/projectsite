const Request = require('../model/ProcData');


const createRequest = async (req, res) => {
  try {
    const { Item, Quantity, Vendor, RequestDate, DeliveryDate, Status } = req.body;
    console.log('Received procurement POST:', req.body); // Debug log
    if (!Item || !Quantity || !Vendor || !RequestDate || !DeliveryDate ) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    const newRequest = new Request({
      Item,
      Quantity,
      Vendor,
      RequestDate,
      DeliveryDate,
      Status,
     
    });

    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    console.error('Error in createRequest:', error); // Debug log
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const updateRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    console.log('Received procurement PUT for ID:', requestId); // Debug log
    console.log('Received procurement PUT data:', req.body); // Debug log

    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      req.body,
      { new: true, runValidators: true } 
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const updateStatus = async (req, res, newStatus) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.Status = newStatus;
    await request.save();

    res.status(200).json({ message: `Status updated to ${newStatus}`, request });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const markAsTransit = (req, res) => updateStatus(req, res, 'Transit');
const markAsDelivered = (req, res) => updateStatus(req, res, 'Delivered');
const cancelRequest = (req, res) => updateStatus(req, res, 'Cancelled');


const getRequestStats = async (req, res) => {
  try {
    const total = await Request.countDocuments();

    const pending = await Request.countDocuments({ Status: 'Pending' });
    const approved = await Request.countDocuments({ Status: 'Approved' });
    const delivered = await Request.countDocuments({ Status: 'Delivered' });

    res.status(200).json({
      totalRequests: total,
      pending,
      approved,
      delivered
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find().sort({ RequestDate: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { 
  createRequest, 
  updateRequest,  
  markAsTransit,
  markAsDelivered,
  cancelRequest, 
  getRequestStats,
  getAllRequests 
};

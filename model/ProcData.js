const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  Item: { type: String, required: true },
  Quantity: { type: Number, required: true },
  Vendor: { type: String, required: true },
  RequestDate: { type: Date, required: true },
  DeliveryDate: { type: Date, required: true },
  Status: {
  type: String,
  enum: ['Pending', 'Approved', 'Rejected', 'Transit', 'Delivered', 'Cancelled'],
  default: 'Pending'
}


});

module.exports = mongoose.model('Request', requestSchema);
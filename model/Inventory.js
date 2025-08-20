const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    MaterialName : {
    type : String,
    required : true
   },
   MaterialType : {
    type : String,
    required : true
   },
   Quantity : {
    type : Number,
    required : true
   },
  Unit: {
    type : Number,
    required : true
   },
   LowStockThreshold: {
    type : Number,
    required : true
   },
   TargetStockLevel: {
    type : Number,
    required : true
   },
   VendorSupplier : {
    type : String,
    required : true
   },
   
   StorageLocation : {
    type : String,
    required : true
   },
   
   Description : {
    type : String,
    required : true
   },

}, { collection: 'Inventory' }); // Explicitly sets collection name

module.exports = mongoose.model('Inventory', InventorySchema);
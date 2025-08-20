const express = require('express');
const router = express.Router();
const {inventoryPost, GetData, removeMaterial} = require("../controllers/inventory");
const inventoryController = require("../controllers/inventory");

router.post("/", inventoryPost)
router.get("/", GetData)
router.post("/remove", removeMaterial)

router.post('/', inventoryController.inventoryPost);
router.get('/', inventoryController.GetData);
router.post('/remove', inventoryController.removeMaterial);
router.get('/transactions', inventoryController.getAllTransactions);
router.get('/transactions/date', inventoryController.getTransactionsByDate);
router.get('/transactions/project/:projectId', inventoryController.getTransactionsByProject);

// router.get('/', inventoryController.getAllTransactions);
// router.get('/', inventoryController.getTransactionsByDate);


module.exports = router;
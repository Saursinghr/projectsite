const express = require('express');
const router = express.Router();
const {purchasePost, GetData, getProcurementStats, getAllProcurements, updateProcurementStatus, updateProcurement } = require("../controllers/purchase")

router.post("/", purchasePost);
router.get("/", GetData);
router.get("/stats", getProcurementStats);
router.get("/all", getAllProcurements);
router.patch("/:id/status", updateProcurementStatus);
router.put("/:id", updateProcurement);

module.exports = router;
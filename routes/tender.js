const express = require("express");
const router = express.Router();
const Tender = require("../model/Tender");

router.post("/", async (req, res) => {
  try {
    console.log('Received tender data:', req.body);
    const { name, amount, emd, defectLiabilityPeriod, securityDeposit, status, rejectionReason } = req.body;
    const newTender = new Tender({
      name,
      amount,
      emd,
      defectLiabilityPeriod: defectLiabilityPeriod || 0,
      securityDeposit: securityDeposit || 0,
      status,
      rejectionReason,
    });
    const savedTender = await newTender.save();
    console.log('Saved tender:', savedTender);

    res.status(200).json({
      message: "Tender added" + savedTender,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const tenders = await Tender.find();
    console.log('Sending tenders:', tenders);
    res.json(tenders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tender/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedTender = await Tender.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedTender) {
      return res.status(404).json({ message: "Tender not found" });
    }

    res.json(updatedTender);
  } catch (error) {
    res.status(500).json({ message: "Error updating tender", error });
  }
});

// DELETE /api/tender/:id
router.delete('/:id', async (req, res) => {
  try {
    const tender = await Tender.findByIdAndDelete(req.params.id);
    if (!tender) {
      return res.status(404).json({ message: 'Tender not found' });
    }
    res.status(200).json({ message: 'Tender deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tender', error });
  }
});



module.exports = router;

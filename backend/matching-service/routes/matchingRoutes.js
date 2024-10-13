// routes/matchingRoutes.js
const express = require('express');
const { produceMessage } = require('../controllers/matchingController');

const router = express.Router();

// Route for producing a message to Kafka
router.post('/produce', produceMessage);

module.exports = router;

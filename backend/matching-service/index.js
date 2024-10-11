// index.js
const express = require('express');
const kafkaRoutes = require('./routes/matchingRoutes');
const { produceStartupMessage, runConsumer } = require('./controllers/matchingController');

// Create an Express app
const app = express();
const port = process.env.PORT || 3002;

// Middleware to parse JSON bodies
app.use(express.json());

// Use the Kafka routes
app.use('/matching', kafkaRoutes);

// Start the Express server and Kafka consumer
app.listen(port, async () => {
    console.log(`Matching service running on port ${port}`);

    // Produce a message on startup
    await produceStartupMessage();

    // Start consuming messages
    runConsumer().catch(console.error);
});

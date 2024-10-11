// controllers/matchingController.js
const { Kafka } = require('kafkajs');

// Kafka setup
const kafka = new Kafka({
    clientId: 'matching-service',
    brokers: ['kafka:9092'],  // 'kafka' is the service name from docker-compose
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'matching-group' });

// Produce a message to Kafka (used in the POST /produce route)
const produceMessage = async (req, res) => {
    const { message } = req.body;
    try {
        await producer.connect();
        await producer.send({
            topic: 'test-topic',
            messages: [{ value: message }],
        });
        await producer.disconnect();
        res.status(200).send(`Message produced: ${message}`);
    } catch (error) {
        console.error('Error producing message:', error);
        res.status(500).send('Failed to produce message');
    }
};

// Produce a startup message when the service starts
const produceStartupMessage = async () => {
    try {
        await producer.connect();
        const message = 'Hello from producer';
        await producer.send({
            topic: 'test-topic',
            messages: [{ value: message }],
        });
        console.log(`Produced startup message: ${message}`);
        await producer.disconnect();
    } catch (error) {
        console.error('Error producing startup message:', error);
    }
};

// Start consuming messages from Kafka
const runConsumer = async () => {
    try {
        await consumer.connect();
        await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log({
                    partition,
                    offset: message.offset,
                    value: message.value.toString(),
                });
            },
        });
    } catch (error) {
        console.error('Error running consumer:', error);
    }
};

module.exports = {
    produceMessage,
    produceStartupMessage,
    runConsumer,
};

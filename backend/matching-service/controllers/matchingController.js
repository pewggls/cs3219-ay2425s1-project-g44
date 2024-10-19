// controllers/matchingController.js
const { Kafka } = require('kafkajs');
const EventEmitter = require('events');
const QUEUE_TIME = 30000;
const BATCH_INTERVAL = 10000;

// Kafka setup
const kafka = new Kafka({
    clientId: 'matching-service',
    brokers: ['kafka:9092'],  // 'kafka' is the service name from docker-compose
});

process.on('SIGTERM', async () => {
    console.log('Shutting down...');
    await producer.disconnect();
    await consumer.disconnect();
    process.exit(0);
  });

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'matching-group' });

(async () => {
    try {
        await producer.connect();
        await consumer.connect();
    } catch(error) {
        console.error(error)
    }
})();

const eventEmitter = new EventEmitter();

const matchmakeUser = async (userId, username, questions) => {
    return new Promise((resolve, reject) => {
        produceMessage({
            userId: userId,
            username: username,
            questions: questions
        }, false);
        eventEmitter.once(`success-${userId}`, (peerUserId, peerUsername) => {
            const message = {
                status: 'success',
                userId: userId,
                peerUserId: peerUserId,
                peerUsername: peerUsername,
                message: `User ${userId} matched with User ${peerUserId} (username: ${peerUsername}).`
            };
        
            resolve(JSON.stringify(message));
        });
        eventEmitter.once(`dequeue-${userId}`, () => {
            const message = {
                status: 'dequeue',
                userId: userId,
                message: `User ${userId} dequeued from matchmaking.`
            };
        
            resolve(JSON.stringify(message));
        });
        setTimeout(() => {
            const message = {
                status: 'timeout',
                userId: userId,
                message: `No matches for ${userId}.`
            };
        
            reject(JSON.stringify(message));
        }, QUEUE_TIME);
    })
}

// Produce a message to Kafka (used in the POST /produce route)
const produceMessage = async (request, isRequeue = false) => {
    const msg = {
        userId: request.userId,
        username: request.username,
        questions: request.questions,
        enqueueTime: isRequeue ? request.enqueueTime : Date.now()
    }
    const stringifiedMsg = JSON.stringify(msg)
    const message = {
        topic: 'test-topic',
        messages: [
            {value: stringifiedMsg}
        ],
    }
    try {
        // await producer.connect();
        await producer.send(message).then(() => {
            console.log(`Enqueued message: ${stringifiedMsg}`)
        });
        // await producer.disconnect();
    } catch (error) {
        console.error('Error producing message:', error);
    }
};

// Produce a startup message when the service starts
const produceStartupMessage = async () => {
    try {
        // await producer.connect();
        const message = 'Hello from producer';
        // await producer.send({
        //     topic: 'test-topic',
        //     messages: [{ value: message }],
        // });
        console.log(`Produced startup message: ${message}`);
        // await producer.disconnect();
    } catch (error) {
        console.error('Error producing startup message:', error);
    }
};

let batch = [];
const batchProcess = () => {
    if (batch.length == 0) {
        console.log("No messages to process in this batch cycle.");
        return;
    }
    batch.sort((A, B) => A.questions.length - B.questions.length);
    console.log(`sorted batch is`, batch);
    let questionDict = new Map();
    let unmatchedUsers = new Map();
    batch.forEach((user) => {
        unmatchedUsers.set(user.userId, user);
    });
    for (const user of batch) {
        if (Date.now() - user.enqueueTime >= QUEUE_TIME) {
            // User has timed out.
            // TODO: send timeout event emitter.
            unmatchedUsers.delete(user.userId);
            continue;
        }
        if (!unmatchedUsers.has(user.userId)) {
            // User has already been matched.
            continue;
        }
        
        user.questions.forEach((question) => {
            const peerUser = questionDict.get(question);
            // Note: UserId cannot be 0, 
            // since 0 is falsy and would break this if-conditional.
            if (peerUser && unmatchedUsers.has(peerUser.userId)) {
                // Found match!!
                eventEmitter.emit(`success-${user.userId}`, peerUser.userId, peerUser.username)
                eventEmitter.emit(`success-${peerUser.userId}`, user.userId, user.username)
                unmatchedUsers.delete(user.userId);
                unmatchedUsers.delete(peerUser.userId);
            } else {
                // Else, keep looking
                questionDict.set(question, user)
            }
        })
    }
        for (const [key, user] of unmatchedUsers) {
            produceMessage(user, true)
            console.log(`User ${key} returned to queue.`)
        }
        batch = [];
};

// Start consuming messages from Kafka
const runConsumer = async () => {
    try {
        // await consumer.connect();
        // await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });
        await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });

        setInterval(batchProcess, BATCH_INTERVAL);

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const parsedJsonMsg = JSON.parse(message.value);
                batch.push(parsedJsonMsg);
            },
        });
    } catch (error) {
        console.error('Error running consumer:', error);
    }
};

module.exports = {
    runConsumer,
    matchmakeUser
};
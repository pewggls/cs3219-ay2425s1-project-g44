const WebSocket = require("ws");

const wss = new WebSocket.Server({port: 3002});
const { matchmakeUser, runConsumer, dequeueUser} = require("./controllers/matchingController");

runConsumer().catch(console.error);

wss.on("connection", (ws) => {
    console.log("New Client Connected");
    ws.send("Welcome to websocket server");

    ws.on('message', async (msg) => {
        // console.log(`Received message: ${msg}`);
        msg = JSON.parse(msg)
        let res;
        if (msg.event == "enqueue") {
            ws.userId = msg.userId;

            try {
                res = await matchmakeUser(msg.userId, msg.userName, msg.questions)
            } catch (failure) {
                res = failure
            }
            ws.send(res);
            ws.close();
        } else if (msg.event == "dequeue") {
            dequeueUser(msg.userId);
            console.log("User has been dequeued")
        }
    });

    ws.on("close", () => {
        console.log("Client has disconnected");
        if (ws.userId) {
            dequeueUser(ws.userId);
            console.log(`User ${ws.userId} dequeued due to disconnection`);
        }
    });
})
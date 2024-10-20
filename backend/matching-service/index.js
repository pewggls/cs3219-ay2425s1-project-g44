const WebSocket = require("ws");

const wss = new WebSocket.Server({port: 3002});
const { matchmakeUser, runConsumer, dequeueUser} = require("./controllers/matchingController");

console.log("Started Websocket server!!!");

runConsumer().catch(console.error);

wss.on("connection", (ws) => {
    console.log("New Client Connected");
    ws.send("Welcome to websocket server");

    ws.on('message', async (msg) => {
        msg = JSON.parse(msg)
        if (msg.event == "enqueue") {
            let res;
            try {
                res = await matchmakeUser(msg.userId, msg.username, msg.questions)
            } catch (failure) {
                res = failure
            }
            ws.send(res)
            ws.close()
        } else if (msg.event == "dequeue") {
            dequeueUser(msg.userId);
            ws.close();
            console.log("User has been dequeued")
        }
    });

    ws.on("close", () => {
        console.log("Client has disconnected")
    });
})
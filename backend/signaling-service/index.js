const WebSocket = require("ws");

const wss = new WebSocket.Server({port: 3003});

const rooms = new Map();

wss.on("connection", (ws) => {
    console.log("New Peer connected!");
    ws.send("Welcome to Signaling Service!")

    let currentRoom;
    ws.on("message", (message) => {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === 'join') {
            // Assign the user to the specified room
            currentRoom = parsedMessage.room;
            if (!rooms.has(currentRoom)) {
                rooms.set(currentRoom, []);
            }
            rooms.get(currentRoom).push(ws);
            console.log(`User joined room: ${currentRoom}`);
        } else {
            // Relay the message to other clients in the same room
            if (currentRoom && rooms.has(currentRoom)) {
                rooms.get(currentRoom).forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message.toString()); // Forward the message
                }
                });
            } else {
                ws.send("Sorry, please join a room first.");
            }
    }
    });
    ws.on('close', () => {
        if (currentRoom && rooms.has(currentRoom)) {
          const newRoom = rooms.get(currentRoom).filter((client) => client !== ws);
          if (newRoom.length === 0) {
            rooms.delete(currentRoom);
          }
          console.log(`User left room: ${currentRoom}`);
        }
      });
})
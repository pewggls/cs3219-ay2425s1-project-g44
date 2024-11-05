import { Hocuspocus } from "@hocuspocus/server";

const rooms = new Map();

const server = new Hocuspocus({
    port: 3003,

    onConfigure: data => {
        console.log('Connection being configured:', data.documentName);
    },
    onConnect: data => {
        console.log('Client connected:', data.documentName);
    },

    // onConnect(data) {
    //     const roomId = data.documentName;

    //     if (!rooms.has(roomId)) {
    //         rooms.set(roomId, new Set());
    //     }
    //     const connections = rooms.get(roomId);
    //     connections.add(data.connection);

    //     console.log('User connected:', data.connection.id);
    // },

    // onDisconnect(data) {
    //     const roomId = data.documentName;
    //     const connections = rooms.get(roomId);

    //     console.log("connections: ", connections);
    //     if (connections) {
    //         connections.delete(data.connection);
    //         console.log('User disconnected:', data.connection.id);

    //         if (connections.size === 1) {
    //             connections.forEach((conn) => {
    //                 conn.send(JSON.stringify({ type: 'sessionEnded', message: 'Other user has left, session has ended.' }));
    //             });
    //             rooms.delete(roomId);
    //             console.log(`Room ${roomId} is now empty and closed.`);
    //         }
    //     }
    // },

    // onDestroy(data) {
    //     rooms.delete(data.documentName);
    //     console.log(`Room ${data.documentName} destroyed.`);
    // },
});

server.listen();
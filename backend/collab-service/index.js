import { Hocuspocus } from "@hocuspocus/server";

const rooms = new Map();

const server = new Hocuspocus({
    port: 3003,

    async onAuthenticate(data) {
        const { token } = data;

        if (token !== "abc") {
            throw new Error("Not authorized!");
        }

        return
    },

    onConfigure: data => {
        console.log('Connection being configured:', data.documentName);
    },
    onConnect: data => {
        console.log('Client connected: ', data.documentName);
    },

    onDisconnect(data) {
        console.log(data)

        if (data.clientsCount == 1) {
            console.log('User disconnected');

            data.document.broadcastStateless("sessionEnded");
            data.document.destroy();
        }
    },
});

server.listen();
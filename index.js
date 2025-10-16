async function scheduled(event, env, ctx) {
    try {
        await env.D1DATABASE.exec("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT)");
    } catch (e) {
        console.error("D1 Error creating table:", e.message);
    }
}

class WebsocketExample {
    constructor(state, env) {
        this.state = state;
        this.env = env;
    }

    async fetch(request) {
        if (request.headers.get("Upgrade") != "websocket") {
            return new Response("Expected websocket", { status: 400 });
        }

        const pair = new WebSocketPair();
        const websocket = pair[0];
        const client = pair[1];

        client.accept();
        this.onOpen(client);

        client.addEventListener("message", async msg => {
            const text = (typeof msg.data === 'string') ? msg.data : new TextDecoder("utf-8").decode(msg.data);

            try {
                await this.env.D1DATABASE.exec("INSERT INTO messages (content) VALUES (?1)", [text]);
            } catch (e) {
                console.error("D1 Error:", e.message);
            }
            this.broadcast(text);
        });

        client.addEventListener("close", () => {
            console.log("Client disconnected");
        });

        client.addEventListener("error", () => {
            console.log("Client error");
        });

        return new Response(null, { status: 101, webSocket: websocket });
    }

    broadcast(msg) {
        console.log("Broadcasting message: " + msg);
        this.state.getWebSockets().forEach(ws => {
            ws.send(msg);
        });
    }

    async loadMessages() {
        try {
            const { results } = await this.env.D1DATABASE.prepare("SELECT content FROM messages ORDER BY id DESC LIMIT 10").all();
            return results ? results.map(row => row.content) : [];
        } catch (e) {
            console.error("D1 Error:", e.message);
            return [];
        }
    }

    async onOpen(client) {
        const messages = await this.loadMessages();
        messages.reverse().forEach(msg => {
            client.send(msg);
        });
    }
}

export default {
    async fetch(request, env, ctx) {
        let id = env.WEBSOCKETS.idFromName("websocket-example");
        let obj = env.WEBSOCKETS.get(id);

        return obj.fetch(request);
    },
    scheduled: scheduled // referencing the scheduled function
};

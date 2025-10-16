document.addEventListener("DOMContentLoaded", () => {
    const messagesDiv = document.getElementById("messages");
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-button");

    // Replace with your Cloudflare Worker WebSocket URL
    const websocketUrl = "wss://your-worker-url.example.com";
    const socket = new WebSocket(websocketUrl);

    socket.addEventListener("open", () => {
        console.log("WebSocket connection established");
    });

    socket.addEventListener("message", (event) => {
        const messageText = event.data;
            const messageElement = document.createElement("div");
        messageElement.textContent = messageText;
            messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });

    socket.addEventListener("close", () => {
        console.log("WebSocket connection closed");
    });
    sendButton.addEventListener("click", () => {
        const messageText = messageInput.value;
        if (messageText) {
            socket.send(messageText);
            messageInput.value = "";
        }
    });
});


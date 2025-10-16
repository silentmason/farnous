document.addEventListener("DOMContentLoaded", () => {
    const messagesDiv = document.getElementById("messages");
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-button");

    // Connect to WebSocket server
    const socket = io("http://localhost:3000");

    // Load existing messages
    socket.on("loadMessages", (messages) => {
        messages.forEach(message => {
            const messageElement = document.createElement("div");
            messageElement.textContent = message;
            messagesDiv.appendChild(messageElement);
        });
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });

    // Receive new messages
    socket.on("receiveMessage", (message) => {
        const messageElement = document.createElement("div");
        messageElement.textContent = message;
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });

    sendButton.addEventListener("click", () => {
        const messageText = messageInput.value;
        if (messageText) {
            socket.emit("sendMessage", messageText);
            messageInput.value = ""; // Clear the input
        }
    });
});

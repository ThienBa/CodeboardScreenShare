const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/view', (req, res) => {
    res.sendFile(__dirname + '/display.html');
})

io.on("connection", (socket) => {
    socket.on("join-message", (roomId) => {
        socket.join(roomId);
        console.log("User joined a room : " + roomId);
    })

    socket.on("screen-data", (data) => {
        const { room, image } = JSON.parse(data);
        socket.broadcast.to(room).emit("screen-data", image);
    })
})

const server_port = process.env.YOUR_PORT || process.env.PORT || 5000;
http.listen(server_port, () => {
    console.log("Start on " + server_port);
})
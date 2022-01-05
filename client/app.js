const { app, BrowserWindow, ipcMain } = require('electron')
const { v4: uuidv4 } = require('uuid');
const screenshot = require('screenshot-desktop');

const socket = require('socket.io-client')('http://localhost:5000');
let interval;

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 150,
        webPreferences: {
            nodeIntegration: true
        }
    })

    win.removeMenu()
    win.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

ipcMain.on("start-share", function (event, arg) {
    const uuid = uuidv4();
    socket.emit("join-message", uuid);
    event.reply("uuid", uuid);

    //Take continous screen shot
    interval = setInterval(function () {
        screenshot().then((img) => {
            let imgStr = new Buffer(img).toString('base64');
            let obj = {};
            obj.room = uuid;
            obj.image = imgStr;

            socket.emit("screen-data", JSON.stringify(obj));
        })
    }, 100)

    //Broadcast to all other user

})

ipcMain.on("stop-share", function (event, arg) {
    //Stop broadcasting & screenshot capturing
    clearInterval(interval);
})

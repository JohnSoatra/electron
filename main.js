const electron = require("electron");
const url = require("url");
const path = require("path");
const { Menu } = require("electron");

let mainWindow;
let addWindow;
const {app, BrowserWindow, ipcMain, ipcRenderer} = electron;
const isMac = process.platform === "darwin";
ipcMain.on('item:add', function(evt, item) {
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

const menuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                click: createAddWindow
            },
            {
                label: 'Clear Item',
                click() {
                    mainWindow.webContents.send("item:clear");
                }
            },
            {
                label: 'Quit',
                accelerator: isMac ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ],
    },
    {
        label: 'Reload',
        accelerator: isMac ? 'Command+R' : 'Ctrl+R',
        click(item, window) {
            window.reload();
        }
    }
];

app.on('ready', function() {
    const _url = url.format({
        pathname: path.join(__dirname, 'windows', 'main_window.html'),
        protocol: 'file:',
        slashes: true
    });
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.loadURL(_url);
    mainWindow.on('closed', function(evt) {
        app.quit();
    });
});

function createAddWindow() {
    if (!addWindow) {
        const width = Math.floor(543 * 0.8); 
        const height = Math.floor(394 * 0.8);
        addWindow = new BrowserWindow({
            width: width,
            height: height,
            title: 'Add Shopping List Item',
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });
        const _url = url.format({
            pathname: path.join(__dirname, 'windows', 'add_window.html'),
            protocol: 'file:',
            slashes: true
        });
        addWindow.loadURL(_url);
        addWindow.on('close', function() {
            addWindow = null;
        });
    }
}


// if on Mac
if (isMac) {
    menuTemplate.unshift({});
}

// if in development
if (process.env.NODE_ENV !== 'production') {
    menuTemplate.push({
        label: 'Toggle DevTools',
        accelerator: isMac ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
            focusedWindow.toggleDevTools();
        }
    })
}

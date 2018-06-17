const electron = require('electron');
const defaultMenu = require('electron-default-menu');
const {app, BrowserWindow, Menu, shell} = require('electron');
const path = require('path');
const url = require('url');
  
function createWindow () {
    const menu = defaultMenu(app, shell);

    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

    // Create the browser window.
    win = new BrowserWindow({width: 800, height: 600, icon: __dirname + '/dist/favicon.png'});
    win.maximize();

    // e viene caricato il file index.html della nostra app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
}

app.on('ready', createWindow);
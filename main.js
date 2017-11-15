const electron = require('electron');
// Module to control application life.
const ipcMain = require('electron').ipcMain;
const fs = require('fs');
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const path = require('path');
const url = require('url');

const piexif = require("piexifjs");


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

let mainMenu = [
    {
        label: 'NO-Exif',
        submenu: [
            {
                label: 'About No-Exif',
                role: 'about',
                selector: 'orderFrontStandardAboutPanel:',
            },
            {
                type: 'separator'
            },
            {
                label: 'Quit No-Exif',
                accelerator: 'Command+Q',
                selector: 'terminate:',
                click() {
                    mainWindow = null;
                    app.quit();
                }
            }
        ]
    },
    {
        role: 'window',
        submenu: [
            {
                role: 'minimize'
            },
            {
                role: 'close'
            }
        ]
    },
];

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
      width: 420, height: 400,
      titleBarStyle: 'hidden-inset',
      center: true, resizable: false,
      fullscreenable: false,
      maximizable: false});

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

    const menu = Menu.buildFromTemplate(mainMenu);

    if (process.platform==='darwin') {
        Menu.setApplicationMenu(menu);
    } else {
        mainWindow.setMenu(null);
    }
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
    app.quit()
  // }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

app.on('open-file', function (event, path){
    console.log(path);
});

ipcMain.on('newFile', function(event, arg) {
    console.log(arg);  // prints "ping"
    const { files } = arg;
    files.map(function (f) {
        try {
            const jpeg = fs.readFileSync(f);
            const data = jpeg.toString("binary");
            const exifObj = {"0th":{}, "Exif":{}, "GPS":{}};
            const exifbytes = piexif.dump(exifObj);
            const newData = piexif.insert(exifbytes, data);
            const newJpeg = new Buffer(newData, "binary");
            fs.writeFileSync(f, newJpeg);
            event.sender.send('fileResult', {ret: 0, message: `${f} ok!`});
        } catch (e) {
            event.sender.send('fileResult', {ret: -1, message: `${f} failed!`});
        }
    });
});
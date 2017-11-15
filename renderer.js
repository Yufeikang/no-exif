// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const ipcRenderer = require('electron').ipcRenderer;
const $ = require('./res/jquery-3.2.1.min');

window.ondrop= function (e) {
    const files = e.dataTransfer.files;
    e.preventDefault();
    e.stopPropagation();
    if (files.length===0){
        alert('请拖放一个或多个文件进入');
    }
    const fileArray = [];

    for(const i in files) {
        if(!isNaN(parseInt(i, 10)) && files[i].type.startsWith('image')){
            fileArray.push(files[i]);
        }
    }
    ipcRenderer.send('newFile', {files: fileArray.map((f)=>f.path)});
    return false;
};
window.ondragover = function(e){
    // If not st as 'copy', electron will open the drop file
    e.dataTransfer.dropEffect = 'copy';
    return false;
};

window.ondragend = function(e) {
    return false;
};

ipcRenderer.on('fileResult', function(event, arg) {
    const { ret, message} = arg;
    $('#message').text(message);
});
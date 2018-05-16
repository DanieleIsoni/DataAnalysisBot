const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const tmpPath = path.join(__dirname,'../../tmp');

module.exports.sessionHandler = (sessions, req) => {
    if (!sessions.has(req.sessionID)){
        sessions.set(req.sessionID, setTimeout(destroySession, 10*60*1000, req.sessionID, req.session));
    } else {
        clearTimeout(sessions.get(req.sessionID));
        sessions.set(req.sessionID, setTimeout(destroySession, 10*60*1000, req.sessionID, req.session));
    }
};

let destroySession = (sessionID, session) => {
    let sessionFolder = path.join(tmpPath, `/${sessionID}`);
    if(fs.existsSync(sessionFolder)){
        try {
            rimraf.sync(sessionFolder);
            console.log(`Session Folder deleted`)
        } catch (err) {
            console.error(`ERROR: error while deleting ${sessionFolder}.\n${err}`);
        }
    }
    session.destroy((err) => {
        if(err) {
            console.error(`ERROR: error while destroying the session.\n${err}`);
        } else {
            console.log(`Session destroyed`);
        }
    });
};
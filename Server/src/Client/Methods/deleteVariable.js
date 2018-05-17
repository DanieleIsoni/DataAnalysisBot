const path = require('path');
const fs = require('fs');
const PROJECT_ID = process.env.PROJECT_ID;
const gappCred = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const dialogflow = require('dialogflow');
const contextsClient = new dialogflow.ContextsClient({
    keyFileName: gappCred,
    projectId: PROJECT_ID
});

module.exports.deleteVariable = (req, res, tmpPath, dialogSessionId) => {

    let path_ = path.join(tmpPath,`/${req.sessionID}/${name}`);
    let ret;

    try {

        if (fs.existsSync(path_)) {
            fs.unlinkSync(path_);
        }

        let id = req.params.id;
        let name = req.session.datasets[id].name;
        req.session.datasets.splice(id,1);

        clearContexts(PROJECT_ID, dialogSessionId);

        ret = `Variable ${name} deleted`;
    } catch (e) {
        ret = `Variable ${name} not deleted due to some server errors`
        console.error(`ERROR: ${e}`);
        res.status(400);
    }

    res.write(ret);
    res.end();
};

function clearContexts(projectId, sessionId) {
  return listContexts(projectId, sessionId).then(contexts => {
    return Promise.all(
      contexts.map(context => {
        return deleteContext(context);
      })
    );
  });
}

function listContexts(projectId, sessionId) {

  // The path to identify the agent that owns the contexts.
  const sessionPath = contextsClient.sessionPath(projectId, sessionId);

  const request = {
    parent: sessionPath,
  };

  // Send the request for listing contexts.
  return contextsClient
    .listContexts(request)
    .then(responses => {
      return responses[0];
    })
    .catch(err => {
      console.error('Failed to list contexts:', err);
    });
}

function deleteContext(context) {

  const request = {
    name: context.name,
  };

  const contextId = contextsClient.matchContextFromContextName(context.name);

  // Send the request for retrieving the context.
  return contextsClient
    .deleteContext(request)
    .then(() => {
      console.log(`Context ${contextId} deleted`);
    })
    .catch(err => {
      console.error(`Failed to delete context ${contextId}`, err);
    });
}
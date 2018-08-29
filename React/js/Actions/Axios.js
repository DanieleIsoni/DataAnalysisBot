import axios from 'axios';
import uuidv1 from "uuid";
import store from "../Store/index";
import { addMessage, clearMessage, addHints, addDataset, setActiveDataset, deleteAllDatasets, deleteDataset } from "./index";
import { URL_HEROKU } from "./../Config/Url";
import { ActionCreators } from 'redux-undo'

/*
   Function called after every server call to change the type of hints
*/
const actionController = (action) => {
    /*
        The case equal the Dialogflow action intent name
     */
    switch(action){
        case "initial":
        case "input.welcome":
        case "input.unknown":
            if(store.getState().datasets.length > 0)
                store.dispatch(addHints("after_file"));
            else
                store.dispatch(addHints("initial"));
            break;
        case "data.description.request":
        case "data.received":
            store.dispatch(addHints("after_file"));
            break;
        case "plot.chart":
        case "plot.chart.fu.label":
        case "change.title":
            store.dispatch(addHints("after_plot"));
            break;
        case "test.request":
        case "test.request.fu.attribute":
        case "test.request.fu.test":
            store.dispatch(addHints("after_analysis"));
            break;
        default:
            store.dispatch(addHints("initial"));
    }
}

export const errorHandling = (error) => {
    store.dispatch(addMessage({id: uuidv1(), who: "bot", what: "markdown error", message: "Error not handled! " + error, output: []}));
}

export const sendMessage = (value, type) => {
    return new Promise((resolve, reject) => {
        /*
            Message sent from the user is added to the redux store with a optional date parameter
         */
        if(value !== "" && value !== "/start"){
            let date = new Date();
            let time = date.getHours() + ":" + date.getMinutes();
            store.dispatch(addMessage({id: uuidv1(), who: "me", what: (type !== "Py") ? "markdown" : "code", message: value, output: [], date: time}));
        }

        /*
            Check if the text written by the user is Python or a NL request
         */
        if(type === "Py"){
            sendPy(value).then((status) => {
                resolve(status);
            }).catch((error) => {
                errorHandling(error);
                reject(error);
            })
        }else{
            axios({
                url: URL_HEROKU + "/clientWebHook/",
                method: 'post', 
                validateStatus: function (status) {
                    return status < 500;
                },
                data: { "message": { "text": value },
                        "react": "true",
                        "variabile": (store.getState().active == null) ? "empty" : store.getState().active.name
                }, headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                store.dispatch(addMessage({id: uuidv1(), who: "bot", what: (response.status == 200) ?  "markdown" : "markdown error", message: response.data.message, output: response.data.outputs, code: response.data.code}));
                actionController(response.data.action);

                resolve(response);
            }).catch((error) => {
                errorHandling(error);
                reject(error);
            });
        }
    });
}

export const sendPy = (value) => {
    return new Promise((resolve, reject) => {
        axios({
            url: URL_HEROKU + "/python/",
            method: 'post', 
            validateStatus: function (status) {
                return status < 500;
            },
            data: { "message": { "text": value }, "react": "true", 
                    "variabile": (store.getState().active == null) ? "empty" : store.getState().active.name
            }, headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            store.dispatch(addMessage({id: uuidv1(), who: "bot", what: (response.status == 200) ?  "markdown" : "markdown error", message: response.data.message, output: response.data.outputs, code: value, who_code: "me"}));
            resolve(response.status);
        }).catch((error) => {
            reject(error);
        });
    });
}

export const clearMessages = (e) => {
    axios.get(URL_HEROKU + '/clear')
    .then(response => {
        store.dispatch(clearMessage());
        store.dispatch(ActionCreators.clearHistory())
    })
}

export const getAll = () => {
    return new Promise((resolve, reject) => {
        axios.get(URL_HEROKU + '/messages')
        .then(response => {

            /*
                If is the first time opening the app a "/start" command is sent to the server
             */
            if(response.data.messages.length == 0){
                sendMessage("/start", "NL");
            }

            /*
                Past messages in the session
             */
            response.data.messages.map(message => {
                store.dispatch(addMessage({id: uuidv1(), who: message.who, what: "markdown", message: message.message, output: message.outputs, code: message.code, date: message.date}));
            })

            /*
                Past datasets in the session
             */
            response.data.variables.map((dataset, n) => {
                var id = uuidv1();

                console.log(JSON.parse(dataset.describe));
                store.dispatch(addDataset({"name": dataset.name, "id": id, "attributes": dataset.attributes, "head": dataset.head, "describe": JSON.parse(dataset.describe)}));

                /*
                    If datasets is available i activate the context of the last one
                 */
                if(n == response.data.variables.length-1) store.dispatch(setActiveDataset({"name": dataset.name, "attributes": dataset.attributes, "head": dataset.head, "describe": JSON.parse(dataset.describe)}));
            })    

            /*
                When gathering all the information the system check if dataset has been uploaded. In this case the proper hints is loaded
             */
            if(response.data.variables.length > 0)
                actionController("data.received");
            else
                actionController("initial");

            resolve(response);
        }).catch(error => {
            errorHandling(error);
            reject(error);
        })
    });
}

/*
    Function to upload a dataset. He need the divider that is automatically detected by the csv reading.
    The head is nothing less than the first 10 rows of the dataset
 */
export const uploadFile = (file, divider, header, dataset) => {
    return new Promise((resolve, reject) => {

        /*
            Creation of the POST body request with the file
         */
        var formdata = new FormData();
        formdata.append('file', file);
        formdata.append('react', "true");
        formdata.append('divider', divider);
        formdata.append('head', JSON.stringify(dataset));
        formdata.append('variabile', (store.getState().active != null) ? store.getState().active.name : "empty");

        store.dispatch(addMessage({"id": uuidv1(), "who": "me", "what": "markdown", "message": "Uploading file...", "output": []}));

        axios({
            url: URL_HEROKU + '/upload',
            data: formdata,
            method: 'post', 
            validateStatus: function (status) {
                return status < 500; // Reject only if the status code is greater than or equal to 500
            }
        }).then(response => {
            if(response.status == 200){
                var id = uuidv1();

                getVariable(file.name).then(data => {
                    store.dispatch(addDataset({ "name": file.name, "id": id, "attributes": header, "head": dataset, "describe": data}));
                    store.dispatch(addMessage({"id": uuidv1(), "who": "bot", "what": "markdown", "message": response.data.message, "output": []}));
                    store.dispatch(setActiveDataset({"name": file.name, "attributes": header, "head": dataset, "describe": data}));
                })

            }else{
                store.dispatch(addMessage({"id": uuidv1(), "who": "bot", "what": "markdown error", "message": response.data.message, "output": []}));
            }    

            actionController(response.data.action);
            
            resolve(response.status);
        }).catch(error => {
            reject(error);
        });
    });
}

/*
    Function for gathering the describe of a loaded dataset
 */
export const getVariable = (name) => {
    return new Promise((resolve, reject) => {
        axios({
            url: URL_HEROKU + '/variable/' + name,
            method: 'get', 
            responseType: "json",
            validateStatus: function (status) {
                return status <= 500;
            }
        }).then(response => {
            /*
                Different network error code to handle different problems
             */
            console.log(response.data);

            if(response.status == 404){
                store.dispatch(addMessage({id: uuidv1(), who: "bot", what: "markdown", message: response.data, output: []}));
            }else if(response.status == 400){
                store.dispatch(deleteAllDatasets());
                store.dispatch(addMessage({id: uuidv1(), who: "bot", what: "markdown", message: "Session expired, all datasets was deleted!", output: []}));
            }else{
                resolve(response.data);
            }
        }).catch(error => reject(error))
    });
}

/*
    Function to delete a loaded dataset
 */
export const call_deleteVariable = (name) => {
    var n = store.getState().datasets.present.map(function(e) { return e.name; }).indexOf(name);
    axios({
        url: URL_HEROKU + '/delete/' + n,
        method: 'get', 
        validateStatus: function (status) {
            return status <= 500;
        }
    }).then(response => {
        let message = "";

        if(response.status === 500){
            message = response.data;
        }else if(response.status === 400){
            message = "Session expired, all variabile was deleted!";
            store.dispatch(deleteAllDatasets());
        }else{
            store.dispatch(deleteDataset(n));
            message = response.data;
        }

        store.dispatch(addMessage({id: uuidv1(), who: "bot", what: "markdown", message: message, output: []}));
    }) 
} 

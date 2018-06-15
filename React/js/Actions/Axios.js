import axios from 'axios';
import uuidv1 from "uuid";
import store from "../Store/index";
import { addMessaggio, clearMessaggi, addHints, addVariabile, setActiveVariable, deleteAllVariabile, deleteVariabile } from "./index";
import Action from '../Constants/Actions';
import { URL_HEROKU } from "./../Config/Url";
import { ActionCreators } from 'redux-undo'

const actionController = (azione) => {
    switch(azione){
        case "initial":
        case "input.welcome":
        case "input.unknown":
        case "data.description.request":
            if(store.getState().variabili.length > 0)
                store.dispatch(addHints(Action["after_file"]));
            else
                store.dispatch(addHints(Action["initial"]));
            break;
        case "data.received":
            store.dispatch(addHints(Action["after_file"]));
            break;
        case "plot.chart":
        case "plot.chart.fu.label":
            store.dispatch(addHints(Action["after_plot"]));
            break;
        case "test.request":
        case "test.request.fu.attribute":
        case "test.request.fu.test":
            store.dispatch(addHints(Action["after_analisys"]));
            break;
        default:
            store.dispatch(addHints(Action["initial"]));
    }
}

export const sendMessage = (value, type, activeVar, isVariableSelected) => {
    return new Promise((resolve, reject) => {
        if(value != "" && value != "/start"){
            var date = new Date();
            var time = date.getHours() + ":" + date.getMinutes();
            store.dispatch(addMessaggio({id: uuidv1(), who: "me", what: (type != "Py") ? "markdown" : "code", messaggio: value, output: [], date: time}));
        }

        if(!isVariableSelected){
            store.dispatch(addMessaggio({id: uuidv1(), who: "bot", what: "markdown", messaggio: "Specify a variable! Select it...", output: []}));
        }else{
            axios({
                url: URL_HEROKU + "/clientWebHook/",
                method: 'post', 
                validateStatus: function (status) {
                    return status < 500;
                },
                data: { "message": { "text": value }, "react": "true", 
                        "variabile": (activeVar == null) ? "empty" : activeVar
                        //"python": (this.state.type == "Py") ? "true" : "false"
                }, headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                console.log(response);
                store.dispatch(addMessaggio({id: uuidv1(), who: "bot", what: (response.status == 200) ?  "markdown" : "markdown error", messaggio: response.data.message, output: response.data.outputs, code: response.data.code}));
                actionController(response.data.action);
                resolve();
            }).catch((error) => {
                reject(error);
            });
        }
    });
}


export const clearMessages = (e) => {
    axios.get(URL_HEROKU + '/clear')
    .then(response => {
        store.dispatch(clearMessaggi());
        store.dispatch(ActionCreators.clearHistory())
    })
}

export const getAll = () => {
    return new Promise((resolve, reject) => {
        axios.get(URL_HEROKU + '/messages')
        .then(response => {
            if(response.data.messages.length == 0){
                sendMessage("/start", "NL", null, true);
            }

            response.data.messages.map(messaggio => {
                store.dispatch(addMessaggio({id: uuidv1(), who: messaggio.who, what: "markdown", messaggio: messaggio.message, output: messaggio.outputs, code: messaggio.code}));
            })
            response.data.variables.map((variabile, n) => {
                store.dispatch(addVariabile({"name": variabile.name, "id": uuidv1()}));

                if(n == response.data.variables.length-1) store.dispatch(setActiveVariable(variabile.name));
            })    

            actionController("initial"); //TODO Send me the action on start
            resolve();
        }).catch(error => {
            reject(error);
        })
    });
}

export const uploadFile = (file, send_active) => {
    return new Promise((resolve, reject) => {
        var formdata = new FormData();
        formdata.append('file', file);
        formdata.append('variabile',send_active);
        store.dispatch(addMessaggio({"id": uuidv1(), "who": "me", "what": "markdown", "messaggio": "Uploading file...", "output": []}));
        axios({ //TODO togliere il fatto che il server salva sulla sessione il messaggio di caricamento della variabile
            url: URL_HEROKU + '/upload',
            data: formdata,
            method: 'post', 
            validateStatus: function (status) {
                return status < 500; // Reject only if the status code is greater than or equal to 500
            }
        }).then(response => {
            if(response.status == 200){
                store.dispatch(addVariabile({ "name": file.name, "id": uuidv1() }));
                store.dispatch(addMessaggio({"id": uuidv1(), "who": "bot", "what": "markdown", "messaggio": response.data.message, "output": []}));
                store.dispatch(setActiveVariable(file.name));
            }else{
                store.dispatch(addMessaggio({"id": uuidv1(), "who": "bot", "what": "markdown error", "messaggio": response.data.message, "output": []}));
            }    

            actionController(response.data.action);
            
            resolve();
        }).catch(error => {
            reject(error);
        });
    });
}

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
            if(response.status == 404){
                store.dispatch(addMessaggio({id: uuidv1(), who: "bot", what: "markdown", messaggio: response.data, output: []}));
            }else if(response.status == 400){
                store.dispatch(deleteAllVariabile());
                store.dispatch(addMessaggio({id: uuidv1(), who: "bot", what: "markdown", messaggio: "Session expired, all variabile was deleted!", output: []}));
            }else{
                resolve(response.data);
            }
        }).catch(error => reject(error))
    });
}


export const deleteVariable = (n) => {
    axios({
        url: URL_HEROKU + '/delete/' + n,
        method: 'get', 
        validateStatus: function (status) {
            return status <= 500;
        }
    }).then(response => {
        var messaggio = "";
        if(response.status == 500){
            messaggio = response.data;
        }else if(response.status == 400){
            messaggio = "Session expired, all variabile was deleted!";
            store.dispatch(deleteAllVariabile());
        }else{
            store.dispatch(deleteVariabile(n));
            messaggio = response.data;
        }

        store.dispatch(addMessaggio({id: uuidv1(), who: "bot", what: "markdown", messaggio: messaggio, output: []}));
    }) 
} 
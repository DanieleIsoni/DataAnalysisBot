import React from "react";
import axios from 'axios';
import uuidv1 from "uuid";
import store from "../Store/index";
import { connect } from "react-redux";
import { addMessaggio, editMessaggio, clearMessaggi, addHints, addVariabile, setActiveVariable } from "./index";
import Action from '../Constants/Actions';
import { URL_HEROKU } from "./../Config/Url";

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
    if(value != ""){
        store.dispatch(addMessaggio({id: uuidv1(), who: "me", what: (type != "Py") ? "markdown" : "code", messaggio: value, output: []}));
    }

    if(!isVariableSelected){
        store.dispatch(addMessaggio({id: uuidv1(), who: "bot", what: "markdown", messaggio: "Specify a variable! Select it...", output: []}));
    }else{
        var udelete = uuidv1();
        store.dispatch(addMessaggio({id: udelete, who: "bot", what: "markdown", messaggio: <div className="loading"></div>, output: []}));
    
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
            store.dispatch(editMessaggio(udelete,{id: uuidv1(), who: "bot", what: (response.status == 200) ?  "markdown" : "markdown error", messaggio: response.data.message, output: response.data.outputs, code: response.data.code}));
            actionController(response.data.action);
        })
    }
}


export const clearMessages = (e) => {
    axios.get(URL_HEROKU + '/clear')
    .then(response => {
        store.dispatch(clearMessaggi());
    })
}

export const getAll = () => {
    axios.get(URL_HEROKU + '/messages')
    .then(response => {
        response.data.messages.map(messaggio => {
            store.dispatch(addMessaggio({id: uuidv1(), who: messaggio.who, what: "markdown", messaggio: messaggio.message, output: messaggio.outputs, code: messaggio.code}));
        })
        response.data.variables.map((variabile, n) => {
            store.dispatch(addVariabile({"name": variabile.name, "id": uuidv1()}));

            if(n == response.data.variables.length-1) store.dispatch(setActiveVariable(variabile.name));
        })    
    }); 

    actionController("initial"); //TODO Send me the action on start
}

export const uploadFile = (file, send_active) => {
    return new Promise((resolve, reject) => {
        var formdata = new FormData();
        formdata.append('file', file);
        formdata.append('variabile',send_active);
        store.dispatch(addMessaggio({"id": uuidv1(), "who": "me", "what": "markdown", "messaggio": "Uploading file...", "output": []}));
        axios({
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
        });
    });
}

export const getVariable = (name) => {
    return new Promise((resolve, reject) => {
        axios.get(URL_HEROKU + '/variable/' + name, {responseType: 'json'})
        .then(response => {
            resolve(response.data);
        }).catch(error => {
            reject(error);
        })
    });
}


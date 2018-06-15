import { ADD_VARIABLE, ADD_MESSAGE, EDIT_MESSAGE, CLEAR_MESSAGE, DELETE_VARIABLE, ADD_HINTS, SET_VAR, DELETE_ALL_VAR } from "../Constants/action-types";

// Variable action
export const addVariable = variable => ({ type: ADD_VARIABLE, payload: variable });
export const deleteVariable = variable => ({ type: DELETE_VARIABLE, payload: variable });
export const deleteAllVariables = () => ({ type: DELETE_ALL_VAR });

// Message action
export const addMessage = message => ({ type: ADD_MESSAGE, payload: message });
export const editMessage = (id, message) => ({ type: EDIT_MESSAGE, payload: {id: id, messaggio: message} });
export const clearMessage = () => ({ type: CLEAR_MESSAGE });

// Hints action
export const addHints = hints => ({type: ADD_HINTS, payload: hints});

// Active variable
export const setActiveVariable = variable => ({type: SET_VAR, payload: variable});

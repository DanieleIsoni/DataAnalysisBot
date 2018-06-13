import { ADD_VARIABILE,ADD_MESSAGGIO, EDIT_MESSAGGIO, CLEAR_MESSAGGI, DELETE_VARIABLE, ADD_HINTS, SET_VAR, DELETE_ALL_VAR } from "../Constants/action-types";

// Variable action
export const addVariabile = variabile => ({ type: ADD_VARIABILE, payload: variabile });
export const deleteVariabile = variabile => ({ type: DELETE_VARIABLE, payload: variabile });
export const deleteAllVariabile = () => ({ type: DELETE_ALL_VAR });

// Message action
export const addMessaggio = messaggio => ({ type: ADD_MESSAGGIO, payload: messaggio });
export const editMessaggio = (id, messaggio) => ({ type: EDIT_MESSAGGIO, payload: {id: id, messaggio: messaggio} });
export const clearMessaggi = () => ({ type: CLEAR_MESSAGGI });

// Hints action
export const addHints = hints => ({type: ADD_HINTS, payload: hints});

// Active variable
export const setActiveVariable = vari => ({type: SET_VAR, payload: vari});

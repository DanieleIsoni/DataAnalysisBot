import { ADD_DATASET, ADD_MESSAGE, EDIT_MESSAGE, CLEAR_MESSAGE, DELETE_VARIABLE, ADD_HINTS, SET_DATASET, DELETE_ALL_DATASET } from "../Constants/action-types";

// Dataset action
export const addDataset = dataset => ({ type: ADD_DATASET, payload: dataset });
export const deleteDataset = dataset => ({ type: DELETE_VARIABLE, payload: dataset });
export const deleteAllDatasets = () => ({ type: DELETE_ALL_DATASET });

// Message action
export const addMessage = message => ({ type: ADD_MESSAGE, payload: message });
export const editMessage = (id, message) => ({ type: EDIT_MESSAGE, payload: {id: id, message: message} });
export const clearMessage = () => ({ type: CLEAR_MESSAGE });

// Hints action
export const addHints = hints => ({type: ADD_HINTS, payload: hints});

// Active Dataset
export const setActiveDataset = dataset => ({type: SET_DATASET, payload: dataset});
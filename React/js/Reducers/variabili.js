import { ADD_VARIABILE, DELETE_VARIABLE, DELETE_ALL_VAR } from "../Constants/action-types";
import undoable from 'redux-undo'

const variabili = (state = [], action) => {
    switch (action.type) {
        case ADD_VARIABILE:
            return [...state, action.payload];
        case DELETE_VARIABLE:
            return [...state.slice(0, action.payload), ...state.slice(action.payload + 1)]
        case DELETE_ALL_VAR:
            return [];
        default:
            return state;
    }
};

const undoableVariabili = undoable(variabili);
export default undoableVariabili;
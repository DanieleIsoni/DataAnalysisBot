import { ADD_VARIABILE } from "../Constants/action-types";
import undoable from 'redux-undo'

const variabili = (state = [], action) => {
    switch (action.type) {
        case ADD_VARIABILE:
            return [...state, action.payload];
        default:
            return state;
    }
};

const undoableVariabili = undoable(variabili);

export default undoableVariabili;
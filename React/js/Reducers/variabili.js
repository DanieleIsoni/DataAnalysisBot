import { ADD_VARIABILE, DELETE_VARIABLE } from "../Constants/action-types";
import undoable from 'redux-undo'

const variabili = (state = [], action) => {
    switch (action.type) {
        case ADD_VARIABILE:
            return [...state, action.payload];
        case DELETE_VARIABLE:
        let  {[action.payload]: deleted, ...newState} = state;
            return newState;
        default:
            return state;
    }
};

const undoableVariabili = undoable(variabili);

export default undoableVariabili;
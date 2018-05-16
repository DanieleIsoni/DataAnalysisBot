import { ADD_MESSAGGIO } from "../Constants/action-types";
import { CLEAR_MESSAGGI } from "../Constants/action-types";
import undoable from 'redux-undo'

const messaggi = (state = [], action) => {
    switch (action.type) {
        case ADD_MESSAGGIO:
            return [...state, action.payload];
        case CLEAR_MESSAGGI:
            return [];
        default:
            return state;
    }
};

const undoableMessaggi = undoable(messaggi);

export default undoableMessaggi;
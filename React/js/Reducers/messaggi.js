import { ADD_MESSAGGIO, EDIT_MESSAGGIO, CLEAR_MESSAGGI } from "../Constants/action-types";
import undoable from 'redux-undo'

const messaggi = (state = [], action) => {
    switch (action.type) {
        case ADD_MESSAGGIO:
            return [...state, action.payload];
        case CLEAR_MESSAGGI:
            return [];
        case EDIT_MESSAGGIO:
            return state.map( (item, index) => {
                if(index !== state.length-1) {
                    return item;
                }
                
                return {
                    ...item,
                    output: action.payload.messaggio.output,
                    code: action.payload.messaggio.code,
                    messaggio: action.payload.messaggio.messaggio,
                    what: action.payload.messaggio.what
                }; 
            });

        default:
            return state;
    }
};

const undoableMessaggi = undoable(messaggi);

export default undoableMessaggi;
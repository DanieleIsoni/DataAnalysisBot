import { ADD_MESSAGE, EDIT_MESSAGE, CLEAR_MESSAGE } from "../Constants/action-types";
import undoable from 'redux-undo'

const messaggi = (state = [], action) => {
    switch (action.type) {
        case ADD_MESSAGE:
            return [...state, action.payload];
        case CLEAR_MESSAGE:
            return [];
        case EDIT_MESSAGE:
            return state.map( (item, index) => {
                if(index !== state.length-1) return item;
                                
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
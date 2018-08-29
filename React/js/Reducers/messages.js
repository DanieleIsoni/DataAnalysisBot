import { ADD_MESSAGE, EDIT_MESSAGE, CLEAR_MESSAGE } from "../Constants/action-types";
import undoable from 'redux-undo'

const messages = (state = [], action) => {
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
                    output: action.payload.message.output,
                    code: action.payload.message.code,
                    message: action.payload.message.message,
                    what: action.payload.message.what
                }; 
            });
        default:
            return state;
    }
};

const undoableMessages = undoable(messages);
export default undoableMessages;
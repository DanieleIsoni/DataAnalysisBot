import { ADD_HINTS } from "../Constants/action-types";
import undoable from 'redux-undo'

const hints = (state = "initial", action) => {
    switch (action.type) {
        case ADD_HINTS:
            return action.payload;
        default:
            return state;
    }
};

export default hints;
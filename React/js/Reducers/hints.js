import { ADD_HINTS } from "../Constants/action-types";
import undoable from 'redux-undo'

const hints = (state = [], action) => {
    switch (action.type) {
        case ADD_HINTS:
            return [...action.payload];
        default:
            return state;
    }
};

const undoableHints = undoable(hints);
export default undoableHints;
import { ADD_HINTS } from "../Constants/action-types";

const hints = (state = "initial", action) => {
    switch (action.type) {
        case ADD_HINTS:
            return action.payload;
        default:
            return state;
    }
};

export default hints;
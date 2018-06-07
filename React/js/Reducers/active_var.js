import { SET_VAR } from "../Constants/action-types";

const active_var = (state = null, action) => {
    switch (action.type) {
        case SET_VAR:
            return action.payload;
        default:
            return state;
    }
};

export default active_var;
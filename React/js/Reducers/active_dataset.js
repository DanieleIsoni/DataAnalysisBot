import { SET_DATASET } from "../Constants/action-types";

const active_dataset = (state = null, action) => {
    switch (action.type) {
        case SET_DATASET:
            return action.payload;
        default:
            return state;
    }
};

export default active_dataset;
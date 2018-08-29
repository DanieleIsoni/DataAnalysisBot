import { ADD_DATASET, DELETE_VARIABLE, DELETE_ALL_DATASET } from "../Constants/action-types";
import undoable from 'redux-undo'

const datasets = (state = [], action) => {
    switch (action.type) {
        case ADD_DATASET:
            return [...state, action.payload];
        case DELETE_VARIABLE:
            return [...state.slice(0, action.payload), ...state.slice(action.payload + 1)]
        case DELETE_ALL_DATASET:
            return [];
        default:
            return state;
    }
};

const undoableDatasets = undoable(datasets);
export default undoableDatasets;
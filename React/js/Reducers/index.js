import { ADD_VARIABILE } from "../Constants/action-types";
import { ADD_MESSAGGIO } from "../Constants/action-types";
import { CLEAR_MESSAGGI } from "../Constants/action-types";

const initialState = {
    variabili: [],
    messaggi: [],
};

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_VARIABILE:
            return { ...state, variabili: [...state.variabili, action.payload] };
        case ADD_MESSAGGIO:
            return { ...state, messaggi: [...state.messaggi, action.payload] };
        case CLEAR_MESSAGGI:
            return { ...state, messaggi: [] };
        default:
            return state;
    }
};

export default rootReducer;
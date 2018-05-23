import { ADD_VARIABILE } from "../Constants/action-types";
import { ADD_MESSAGGIO } from "../Constants/action-types";
import { EDIT_MESSAGGIO } from "../Constants/action-types";
import { CLEAR_MESSAGGI } from "../Constants/action-types";
import { DELETE_VARIABLE } from "../Constants/action-types";
import { ADD_HINTS } from "../Constants/action-types";

export const addVariabile = variabile => ({ type: ADD_VARIABILE, payload: variabile });
export const deleteVariabile = id => ({ type: DELETE_VARIABLE, payload: id });
export const addMessaggio = messaggio => ({ type: ADD_MESSAGGIO, payload: messaggio });
export const editMessaggio = (id, messaggio) => ({ type: EDIT_MESSAGGIO, payload: {id: id, messaggio: messaggio} });
export const clearMessaggi = () => ({ type: CLEAR_MESSAGGI });
export const addHints = hints => ({type: ADD_HINTS, payload: hints});
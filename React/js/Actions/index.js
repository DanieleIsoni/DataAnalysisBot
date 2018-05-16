import { ADD_VARIABILE } from "../Constants/action-types";
import { ADD_MESSAGGIO } from "../Constants/action-types";
import { CLEAR_MESSAGGI } from "../Constants/action-types";
import { DELETE_VARIABLE } from "../Constants/action-types";

export const addVariabile = variabile => ({ type: ADD_VARIABILE, payload: variabile });
export const deleteVariabile = id => ({ type: DELETE_VARIABLE, payload: id });
export const addMessaggio = messaggio => ({ type: ADD_MESSAGGIO, payload: messaggio });
export const clearMessaggi = () => ({ type: CLEAR_MESSAGGI });
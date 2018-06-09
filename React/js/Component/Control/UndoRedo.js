import { ActionCreators } from 'redux-undo'
import React from "react";
import { connect } from "react-redux";

const mapStateToProps = (state) => ({
    canUndo: state.messaggi.past.length > 0,
    canRedo: state.messaggi.future.length > 0
})
  
const mapDispatchToProps = dispatch => {
    return{
        onUndo: () => dispatch(ActionCreators.jump(-2)),
        onRedo: () => dispatch(ActionCreators.jump(2))
    }
}
  
let UndoRedo = ({ canUndo, canRedo, onUndo, onRedo }) => (
    <div>
        <button className="undoredo" onClick={onUndo} disabled={!canUndo}><i className="material-icons">keyboard_arrow_left</i></button>
        <button className="undoredo" onClick={onRedo} disabled={!canRedo}><i className="material-icons">keyboard_arrow_right</i></button>
    </div>
)

UndoRedo = connect(mapStateToProps, mapDispatchToProps)(UndoRedo);
export default UndoRedo;
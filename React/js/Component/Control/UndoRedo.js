import { ActionCreators } from 'redux-undo'
import React from "react";
import { connect } from "react-redux";

const mapStateToProps = (state) => ({
    canUndo: state.messaggi.past.length > 0,
    canRedo: state.messaggi.future.length > 0,
    message: state.messaggi.present
})
  
const mapDispatchToProps = dispatch => {
    return{
        onUndo: (step) => dispatch(ActionCreators.jump(-step)),
        onRedo: (step) => dispatch(ActionCreators.jump(step))
    }
}

class UndoRedo extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            step: 0,
            stepToRedo: [],
            stepToUndo: '2'
        }
        this.checkStep = this.checkStep.bind(this);
    }

    checkStep(e, action){ //Controllo se i messaggi tra bot e umano sono uguali altrimenti tolgo solo uno
        if(action == "undo"){
            let stepToDo = this.state.stepToUndo;

            let last = this.props.message[this.props.message.length-1];
            let prev = this.props.message[this.props.message.length-2];

            if(prev.who == last.who){
                stepToDo = 1;
            }

            this.setState({step: this.state.step + 1, stepToRedo: [...this.state.stepToRedo, stepToDo]});
            this.props.onUndo(stepToDo);
            console.log("Tolte: " + stepToDo);
        }else{
            let stepToDo = this.state.stepToRedo[this.state.step-1];
            this.setState({step: this.state.step - 1, stepToRedo: [...this.state.stepToRedo.slice(0, this.state.step-1), ...this.state.stepToRedo.slice(this.state.step)]});
            this.props.onRedo(stepToDo);
            console.log("Aggiunte: " + stepToDo);
        }
    }

    render(){
        return (
            <div>
                <button className="undoredo" onClick={(e) => this.checkStep(e, "undo")} disabled={!this.props.canUndo}><i className="material-icons">keyboard_arrow_left</i></button>
                <button className="undoredo" onClick={(e) => this.checkStep(e, "redo")} disabled={!this.props.canRedo}><i className="material-icons">keyboard_arrow_right</i></button>
            </div>
        );
    }
}
UndoRedo = connect(mapStateToProps, mapDispatchToProps)(UndoRedo);
export default UndoRedo;
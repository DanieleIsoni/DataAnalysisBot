import { ActionCreators } from 'redux-undo'
import React from "react";
import { connect } from "react-redux";

const mapStateToProps = (state) => ({
    canUndo: state.messages.past.length > 0 && state.messages.present.length > 0,
    canRedo: state.messages.future.length > 0,
    message: state.messages.present
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
            stepToRedo: []
        }
        this.checkStep = this.checkStep.bind(this);
    }

    checkStep(e, action){ //Check if count of bot and human is the same otherwise i delete only one row
        if(action == "undo"){
            let stepToDo = 2;

            let last = this.props.message[this.props.message.length-1];
            let prev = this.props.message[this.props.message.length-2];

            if(prev == null || prev.who == last.who){
                stepToDo = 1;
            }

            this.props.onUndo(stepToDo);
            this.setState({step: this.state.step + 1, stepToRedo: [...this.state.stepToRedo, stepToDo]}, () => {console.log("Array: " + this.state.stepToRedo);});
        }else{
            let stepToDo = this.state.stepToRedo[this.state.step-1];
            this.setState({step: this.state.step - 1, stepToRedo: [...this.state.stepToRedo.slice(0, this.state.step-1), ...this.state.stepToRedo.slice(this.state.step)]});
            this.props.onRedo(stepToDo);
        }
    }

    render(){
        return (
            <div className="group_undoredo">
                <button className="undoredo" onClick={(e) => this.checkStep(e, "undo")} disabled={!this.props.canUndo}><i className="material-icons">keyboard_arrow_left</i></button>
                <button className="undoredo" onClick={(e) => this.checkStep(e, "redo")} disabled={!this.props.canRedo}><i className="material-icons">keyboard_arrow_right</i></button>
            </div>
        );
    }
}
UndoRedo = connect(mapStateToProps, mapDispatchToProps)(UndoRedo);
export default UndoRedo;
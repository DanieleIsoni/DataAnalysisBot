import React from "react";
import { connect } from "react-redux";
import { addMessaggio } from "../Actions/index";
import uuidv1 from "uuid";

const mapAddMessaggioEvent = dispatch => {
    return {
      addMessaggio: messaggio => dispatch(addMessaggio(messaggio))
    };
};

class ConnectedLoadJupyter extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            label: " Jupyter"
        }

        this.handleChange = this.handleChange.bind(this);
    }

    readJSON(){

    }

    handleChange(files) {
        var file = files[0];
        this.setState({
            label: file.name.split( '.' )[0]
        });

        var reader = new FileReader();
        reader.readAsText(file);

        reader.onload = (function(f) {
            return function(evt) {
                var json = JSON.parse(evt.target.result);
                var cells = [];
                cells = json.cells;

                cells.map(el =>{
                    var outs = [];
                    if(typeof el.outputs != "undefined"){
                        el.outputs.map(op => {
                            var field_types = Object.keys(op.data);
                            var field = field_types.find((element) => {return element == "text" || element == "text/plain" || element == "image/png"});
                            outs.push({type: field, content: op.data[field][0]});
                        });
                    }                    

                    f.addMessaggio({id: uuidv1(), who: el.metadata.who, what: el.cell_type, messaggio: el.source.join(""), output: outs});
                });
            };
        })(this.props);
    
    }

    render(){
        return(
            <form className="button-board-lateral" action="/" method="POST" encType="multipart/form-data">
                <input type="file" name="file" id="jup" accept=".ipynb" className="hidden_input" onChange={ (e) => this.handleChange(e.target.files) }/>
                <label htmlFor="jup"><span><i className="material-icons">file_upload</i> {this.state.label}</span></label>
            </form>
        );
    }
}

const Jupyter = connect(null, mapAddMessaggioEvent)(ConnectedLoadJupyter);
export default Jupyter;
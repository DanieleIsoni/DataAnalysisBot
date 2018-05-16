import React from "react";
import { connect } from "react-redux";
import { addMessaggio } from "../../Actions/index";
import uuidv1 from "uuid";
import Jup from "../../Jupyter/Jupyter";

const mapAddMessaggioEvent = dispatch => {
    return {
      addMessaggio: messaggio => dispatch(addMessaggio(messaggio))
    };
};

class ConnectedLoadJupyter extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            label: " Load"
        }

        this.handleChange = this.handleChange.bind(this);
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
                var messaggi_jup = Jup.readJupyter(json.cells);

                messaggi_jup.map(mes => {
                    f.addMessaggio({id: uuidv1(), who: mes.who, what: mes.what, messaggio: mes.messaggio, output: mes.output});
                });
            };
        })(this.props);
    
    }

    render(){
        return(
            <form className="button-board-lateral" action="/" method="POST" encType="multipart/form-data">
                <input type="file" name="file" id="jup" accept=".ipynb" className="hidden_input" onChange={ (e) => this.handleChange(e.target.files) }/>
                <label htmlFor="jup"><span><i className="material-icons">cloud_upload</i> {this.state.label}</span></label>
            </form>
        );
    }
}

const Jupyter = connect(null, mapAddMessaggioEvent)(ConnectedLoadJupyter);
export default Jupyter;
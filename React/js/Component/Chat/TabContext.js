import React from "react";
import { connect } from "react-redux";
import { setActiveVariable} from "../../Actions/index";

const mapSetActive = dispatch => {
    return {
      setActiveVariable: vari => dispatch(setActiveVariable(vari))
    };
};

const mapVariable = state => {
    return { variabili: state.variabili.present, activeVar: state.active };
};

class TabContext extends React.Component {
    constructor(props){
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);
    }

    onMouseWheel(e) {
        const currentScrollDelta = this.scrollBars.scrollLeft;
        this.scrollBars.scrollLeft = currentScrollDelta + e.deltaY;
    }

    handleClick (e, el) {
        this.props.setActiveVariable({"name": el.name, "attributes": el.attributes, "head": el.head});
    }

    render(){

        return(
                <div className="tab_container" onWheel={(e) => this.onMouseWheel(e)} ref={(scroll) => this.scrollBars = scroll} >
                    {
                        (this.props.variabili.length) ? 
                            this.props.variabili.map((el, n) => (
                                (this.props.activeVar != null && this.props.activeVar.name != el.name) ? 
                                    <div key={el.id} className='tab_element' id={el.name} onClick={(e) => this.handleClick(e, el)}>
                                        <span>{el.name}</span>
                                    </div>
                                    :
                                    <div key={el.id} className='tab_element tab_active' id={el.name}>
                                        <span>{el.name}</span>
                                    </div>
                            ))
                        :                                    
                        <div className='tab_element tab_active'>
                            <span>No context</span>
                        </div>
                    }
                </div>
        );
    }
}


const TabContextConn = connect(mapVariable, mapSetActive)(TabContext);
export default TabContextConn;
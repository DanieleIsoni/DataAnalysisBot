import React from "react";
import { connect } from "react-redux";
import { setActiveDataset} from "../../Actions/index";

const mapSetActive = dispatch => {
    return {
      setActiveDataset: dataset => dispatch(setActiveDataset(dataset))
    };
};

const mapDatasets = state => {
    return {
        datasets: state.datasets.present, activeVar: state.active
    };
};

/*
   Top bar with browser-like tab to navigate through context (that coincide with the dataset selected)
*/
class TabContext extends React.Component {
    constructor(props){
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);
    }

    /*
        Event to scroll the tabs of the dataset
    */
    onMouseWheel(e) {
        const currentScrollDelta = this.scrollBars.scrollLeft;
        this.scrollBars.scrollLeft = currentScrollDelta + e.deltaY;
    }

    handleClick (e, el) {
        this.props.setActiveDataset({"name": el.name, "attributes": el.attributes, "head": el.head});
    }

    render(){
        return(
                <div className="tab_container" onWheel={(e) => this.onMouseWheel(e)} ref={(scroll) => this.scrollBars = scroll} >
                    {
                        (this.props.datasets.length) ?
                            this.props.datasets.map((el, n) => (
                                (this.props.activeVar != null && this.props.activeVar.name == el.name) ? 
                                    <div key={el.id} className='tab_element tab_active' id={el.name} onClick={(e) => this.handleClick(e, el)}>
                                        <span>{el.name}</span>
                                    </div>
                                    :
                                    <div key={el.id} className='tab_element' id={el.name} onClick={(e) => this.handleClick(e, el)}>
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

const TabContextConn = connect(mapDatasets, mapSetActive)(TabContext);
export default TabContextConn;
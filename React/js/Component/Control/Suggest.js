import React from "react";
import { connect } from "react-redux";

class Suggest extends React.Component{
    showValue(text, search){
        if(search != ""){
            let index = text.indexOf(search);
            if(index >= 0){
                return <div>{text.substring(0, index)} <span className="highlight">{text.substring(index, index + search.length)}</span> {text.substring(index+search.length)}</div>
            }
        }
        return text;
    }
    render(){
        const suggest_list = [...this.props.suggest].map((sug, n) => {
            return <span key={n*n} id={n*n} className="suggestion" style={{background: (this.props.select == this.props.suggest.size-n-1) ? "#444" : "#1e1e1e"}} onClick={(e) => this.props.handleSuggest(e, sug)}>{this.showValue(sug, this.props.input)}</span>
        })

        return (
            <div className="suggest" id="suggest" ref={sug => this.suggest = sug} style={{display: (this.props.type == "NL" && this.props.input.length > 0) ? "block" : "none" }}>
                {suggest_list}
            </div>
        );
    }
}

export default Suggest;
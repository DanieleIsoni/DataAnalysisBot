import React from "react";
import { connect } from "react-redux";

class Suggest extends React.Component{
    search(text, search){
        if(search == ""){
            return true;
        }
        var regex = new RegExp('^' + search + '')
        return regex.test(text);
    }
    showValue(text, search){
        let index = text.indexOf(search);
        if(index >= 0){
            return <div>{text.substring(0, index)} <span className="highlight">{text.substring(index, index + search.length)}</span> {text.substring(index+search.length)}</div>
        }
        return text;
    }
    render(){
        const suggest_list = [...this.props.suggest].map((sug, n) => {
            return <span key={n*n} style={{display: (this.search(sug, this.props.input)) ? "block" : "none"}} className="suggestion" onClick={(e) => this.props.handleSuggest(e, sug)}>{this.showValue(sug, this.props.input)}</span>
        })

        return (
            <div className="suggest"  ref={sug => this.suggest = sug} style={{display: (this.props.type == "NL" && this.props.input != "") ? "block" : "none" }}>
                {suggest_list}
            </div>
        );
    }
}

export default Suggest;
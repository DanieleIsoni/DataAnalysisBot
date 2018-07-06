import React from "react";

class Suggest extends React.Component{
    constructor(props){
        super(props);

        this.clearHistory = this.clearHistory.bind(this);
    }
    showValue(text, search){
        if(search != ""){
            let index = text.indexOf(search);
            if(index >= 0){
                return <div>{text.substring(0, index)} <span className="highlight">{text.substring(index, index + search.length)}</span> {text.substring(index+search.length)}</div>
            }
        }
        return text;
    }

    clearHistory(){
        if (typeof(Storage) !== "undefined") {
            localStorage.setItem('suggestion', JSON.stringify([]));
        }
    }

    render(){
        const suggest_list = [...this.props.suggest].map((sug, n) => {
            return <span key={n*n} id={n*n} className="suggestion" style={{background: (this.props.select == this.props.suggest.size-n-1) ? "#ddd" : "#fff"}} onClick={(e) => this.props.handleSuggest(e, sug)}>{this.showValue(sug, this.props.input)}</span>
        })

        return (
            (this.props.type == "NL" && this.props.input.length > 0) ? 
                <div className="suggest" id="suggest" ref={sug => this.suggest = sug}>
                    {suggest_list}
                    <span className="clear-history" style={{display: (this.props.type == "NL" && this.props.suggest.size > 0) ? "block" : "none" }} onClick={(e) => this.clearHistory(e)}>Clear<i class="material-icons">close</i></span>
                </div>
            :
            ""
        );
    }
}

export default Suggest;
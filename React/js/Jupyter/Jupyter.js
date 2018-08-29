var metadata = require('./metadata.js');

class Jupyter{
    constructor(){
        this.cells = [];
        this.metadata = metadata;
        this.nbformat = 4;
        this.nbformat_minor = 2;
    }

    //Message exchanged with the bot 
    addMarkdown(who, messaggio){
        if(who == "me")   
            this.cells.push({"cell_type": "markdown", "metadata": { "who": "me" }, "source": ["### &#x1F539; " + messaggio]});
        else
            this.cells.push({"cell_type": "markdown", "metadata": { "who": "bot" }, "source": ["&#x1F538; " + messaggio + "\n"]});
    }

    //Python code executed by the user with the built-in editor
    addUserCode(code){
        this.cells.push({"cell_type": "code", "execution_count": 1, "metadata": { "who": "me" }, "outputs": [], "source": [code]});
    }

    //Output of user interaction with the bot (can be text or image)
    addCode(outputs, code, who_code){
        var outs = [];
        outputs.map((output, i) => {
            var output_data = (output.type == "image/png") ? {"image/png": output.content} : {"text/plain": [output.content]}
            var result_type = (output.type == "image/png") ? "display_data" : "execute_result";
            var data_out = "";
            if(output.content != null){
                if(output.type == "image/png")
                    data_out = {"data": output_data, "metadata": {}, "output_type": result_type};
                else
                    data_out = {"data": output_data, "metadata": {}, "execution_count": 1, "output_type": result_type}
            }
            outs.push(data_out);
        });

        var wcode = (who_code == "me") ? {"who": "bot", "who_code": "me"} :  {"who": "bot"};
        this.cells.push({"cell_type": "code", "execution_count": 1, "metadata": wcode, "outputs": outs, "source": [code]});
    }

    //Read external Jupyter file
    static readJupyter(filejup){
        var messages = [];
        var code = null;

        filejup.map(el =>{
            var outs = [];

            if(typeof el.outputs != "undefined"){
                el.outputs.map(op => {
                    var field_types = Object.keys(op.data);
                    var field = field_types.find((element) => {return element == "text" || element == "text/plain" || element == "image/png"});
                    if(field == "text" || field == "text/plain" ){
                        outs.push({type: field, content: op.data[field][0]});
                    }else{
                        outs.push({type: field, content: op.data[field]});
                    }
                });   
            }
            
            var to_join_message = [];
            el.source.map(message => {
                var mes = "";
                if(el.cell_type == "markdown"){
                    mes = message.split(";")[1];
                }else{
                    code = el.source.join("");
                }
                to_join_message.push(mes);
            });

            if(el.metadata.who_code == "me"){
                messages.push({who: "me", what: "code", message: el.source.join(""), output: [], code: null});
                messages.push({who: "bot", what: "markdown", message: "Python result:", output: outs, code: null});
            }else{
                messages.push({who: el.metadata.who, what: "markdown", message: to_join_message.join(""), output: outs, code: code});
            }
        });
        
        //Return the list of cells that will be added to Redux state
        return messages;
    }
}

module.exports = Jupyter;
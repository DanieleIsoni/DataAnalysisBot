var metadata = require('./metadata.js');

class Jupyter{
    constructor(){
        this.cells = [];
        this.metadata = metadata;
        this.nbformat = 4;
        this.nbformat_minor = 2;
    }

    addMarkdown(who, messaggio){
        if(who == "me")   
            this.cells.push({"cell_type": "markdown", "metadata": { "who": "me" }, "source": ["### &#x1F539; " + messaggio]});
        else
            this.cells.push({"cell_type": "markdown", "metadata": { "who": "bot" }, "source": ["&#x1F538; " + messaggio + "\n"]});
    }

    addUserCode(code){
        this.cells.push({"cell_type": "code", "execution_count": 1, "metadata": { "who": "me" }, "outputs": [], "source": [code]});
    }

    addCode(outputs, code, who_code){
        var outs = [];
        outputs.map((output, i) => {
            var dati = (output.type == "image/png") ? {"image/png": output.content} : {"text/plain": [output.content]}
            var result_type = (output.type == "image/png") ? "display_data" : "execute_result";
            var data_out = "";
            if(output.content != null){
                if(output.type == "image/png")
                    data_out = {"data": dati, "metadata": {}, "output_type": result_type};
                else
                    data_out = {"data": dati, "metadata": {}, "execution_count": 1, "output_type": result_type}
            }
            outs.push(data_out);
        });

        var wcode = (who_code == "me") ? {"who": "bot", "who_code": "me"} :  {"who": "bot"};
        this.cells.push({"cell_type": "code", "execution_count": 1, "metadata": wcode, "outputs": outs, "source": [code]});
    }

    static readJupyter(filejup){
        var messaggi = [];
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
            
            var messages = [];
            el.source.map(message => {
                var mes = "";
                if(el.cell_type == "markdown"){
                    mes = message.split(";")[1];
                }else{
                    code = el.source.join("");
                }
                messages.push(mes);
            });

            if(el.metadata.who_code == "me"){
                messaggi.push({who: "me", what: "code", messaggio: el.source.join(""), output: [], code: null});
                messaggi.push({who: "bot", what: "markdown", messaggio: "Python result:", output: outs, code: null});
            }else{
                messaggi.push({who: el.metadata.who, what: "markdown", messaggio: messages.join(""), output: outs, code: code});
            }
        });
        return messaggi;
    }
}

module.exports = Jupyter;
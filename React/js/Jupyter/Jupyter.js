var metadata = require('./metadata.js');

class Jupyter{
    constructor(){
        this.cells = [];
        this.metadata = metadata;
        this.nbformat = 4;
        this.nbformat_minor = 2;
    }

    addMarkdown(who, messaggio){
        if(who == "me"){    
            this.cells.push({"cell_type": "markdown", "metadata": { "who": "me" }, "source": ["### &#x1F539; " + messaggio]});
        }else{
            this.cells.push({"cell_type": "markdown", "metadata": { "who": "bot" }, "source": ["&#x1F538; " + messaggio + "\n *** "]});
        }
    }

    addCode(outputs, code){
        var outs = [];

        outputs.map((output, i) => {
            var dati = (output.type == "image/png") ? {"image/png": output.content} : {"text": [output.content]}
            var result_type = (output.type == "image/png") ? "display_data" : "execute_result";
            var data_out = (output.content != null) ? {"data": dati, "metadata": {}, "execution_count": 1, "output_type": result_type} : "";

            outs.push(data_out);
        });


        this.cells.push({"cell_type": "code", "execution_count": 1, "metadata": { "who": "bot" }, "outputs": [outs], "source": [code]});
    }

    static readJupyter(filejup){
        var messaggi = [];

        filejup.map(el =>{
            var outs = [];
            if(typeof el.outputs != "undefined"){
                el.outputs.map(op => {
                    var field_types = Object.keys(op.data);
                    var field = field_types.find((element) => {return element == "text" || element == "text/plain" || element == "image/png"});
                    outs.push({type: field, content: op.data[field][0]});
                });
            }                    

            var messages = [];
            el.source.map(message => {
                if(el.cell_type == "markdown"){
                    var message = message.split(";")[1];
                }
                
                messages.push(message);
            });

            messaggi.push({who: el.metadata.who, what: el.cell_type, messaggio: messages.join(""), output: outs});
        });

        return messaggi;
    }
}

module.exports = Jupyter;
import React from "react";
var fileDownload = require('js-file-download');

class DownloadButton extends React.Component{
    downloadPlot(e){
        /*
            Conversion of the base64 image to a png file
         */
        var img = "data:image/png;base64," + this.props.content;
        var data = img.replace(/^data:image\/\w+;base64,/, "");
        var buf = new Buffer(data, 'base64');
        fileDownload(buf, "plot.png");
    }
    render() {
        return (
            <div className="download" onClick={(e) => this.downloadPlot(e)}>Download <i className="material-icons">bar_chart</i></div>
        );
    }
}

export default DownloadButton;
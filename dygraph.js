module.exports = function(RED) {
    function DygraphNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        var data = []; // array of datapoints, each dp is [x, y1, y2, ...]
        var labels = ["time"]; // series labels, [0] is x-axis label
        var options = {
            connectSeparatedPoints: true,
            labels: labels,
            title: config.title,
            xlabel: config.xlabel,
            ylabel: config.ylabel,
            drawPoints: config.dot,
        };
        //node.log("Defaults: " + JSON.stringify(config));
        if (config.ymin != '' && config.ymax != '')
            options.valueRange = [ parseFloat(config.ymin), parseFloat(config.ymax) ];

        // fixAt takes a time spec in millisecond, seconds or a Date object as input and
        // always returns an appropriate Date object for Dygraphs.
        fixAt = function(at) {
                if (at > 1400000000000) return at;
                else if (at > 1400000000) return at*1000
                else return Date.now();
        };

        // fixLabel takes a label or null and returns an index into the labels array.
        // It auto-adds new labels to the end of the labels array.
        fixLabel = function(label) {
            if (!label) {
                if (labels.length < 2) labels.push("data");
                return 1; // no label, must be the first one...
            }
            var ix = labels.indexOf(label);
            if (ix >= 0) return ix; // found label
            labels.push(label);
            for (var i=0; i<data.length; i++)
                while (data[i].length < labels.length) data[i].push(null);
            return labels.length-1; // new label, add it
        };

        node.on('input', function(msg) {
            //node.log("Dygraph: " + JSON.stringify(msg) + " (" + typeof msg.payload + ")");
            var out = null; // output message (constructed from scratch to fix the template)
            if (msg.payload && (typeof msg.payload == "number" ||
                    (typeof msg.payload == "array" && msg.payload.length == 3))) {
                var at = fixAt(msg.at);
                var ix = fixLabel(msg.topic);
                var datapoint = new Array(labels.length);
                datapoint[0] = at;
                datapoint[ix] = msg.payload;
                data.push(datapoint);
                var out = {data: data, options: options};
                if (msg.options) out.options = msg.options;
                //node.log("Dygraph " + data.length + ": " + JSON.stringify(options.labels));
                node.send(out);
            } else if (msg.payload && typeof msg.payload == "object") {
                var datapoint = new Array(labels.length);
                datapoint[0] = fixAt(msg.at);
                for (l in msg.payload) {
                    var ix = fixLabel(l);
                    if (ix >= datapoint.length) datapoint.push(msg.payload[l]);
                    else datapoint[ix] = msg.payload[l];
                }
                data.push(datapoint);
                var out = {data: data, options: options};
                if (msg.options) out.options = msg.options;
                node.send(out);
            } else if (msg.init) {
                data = msg.init.data;
                labels = msg.init.labels;
                node.send(msg.init);
            }
        });

        setTimeout(function() {
			node.send({template:
//'<script src="/js/dygraph.min.js"></script>\n'+
'<script src="//cdnjs.cloudflare.com/ajax/libs/dygraph/2.0.0/dygraph.min.js"></script>\n'+
'<div id="dygraph_' + node.id + '" style="margin: 0; width: 618px; height:339px;">' + config.nodata + '</div>\n'+
'<div class="ng-hide">{{msg}}</div>\n'+
'<script>\n'+
'(function(scope) {\n'+
'    var g;\n'+
'    scope.$watch("msg", function(msg) {\n'+
'        if (!msg || !msg.data) return;\n'+
'            //console.log(msg);\n'+
'        if (msg.data)\n'+
'            for (var i=0; i<msg.data.length; i++)\n'+
'                if (Array.isArray(msg.data[i]))\n'+
'                    msg.data[i][0] = new Date(msg.data[i][0]);\n'+
'        if (!g) {\n'+
'            g = new Dygraph(document.getElementById("dygraph_' + node.id + '"), msg.data, msg.options);\n'+
'        } else {\n'+
'            if (!msg.options) msg.options = {};\n'+
'            msg.options.file = msg.data;\n'+
'            g.updateOptions(msg.options);\n'+
'            g.resize();\n'+
'        }\n'+
'    });\n'+
'})(scope);\n'+
'</script>\n'+
'<style>'+
'.dygraph-annotation,.dygraph-legend{overflow:hidden}.dygraph-legend{position:absolute;font-size:14px;z-index:10;width:250px;background:#fff;line-height:normal;text-align:left}.dygraph-legend-dash,.dygraph-legend-line{display:inline-block;position:relative;bottom:.5ex;height:1px;border-bottom-width:2px;border-bottom-style:solid}.dygraph-legend-line{padding-left:1em}.dygraph-annotation,.dygraph-roller{position:absolute;z-index:10}.dygraph-default-annotation{border:1px solid #000;background-color:#fff;text-align:center}.dygraph-axis-label{z-index:10;line-height:normal;overflow:hidden;color:#000}.dygraph-title{font-weight:700;z-index:10;text-align:center}\n'+
'.dygraph-xlabel{text-align:center}.dygraph-label-rotate-left{text-align:center;transform:rotate(90deg);-webkit-transform:rotate(90deg);-moz-transform:rotate(90deg);-o-transform:rotate(90deg);-ms-transform:rotate(90deg)}.dygraph-label-rotate-right{text-align:center;transform:rotate(-90deg);-webkit-transform:rotate(-90deg);-moz-transform:rotate(-90deg);-o-transform:rotate(-90deg);-ms-transform:rotate(-90deg)}'+
'</style>'});
		}, 100);

    }
    RED.nodes.registerType("dygraph", DygraphNode);
}

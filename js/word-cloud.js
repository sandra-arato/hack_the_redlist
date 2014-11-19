// This code is 99% based on Julien Renaux's work
// http://julienrenaux.fr/2014/09/23/d3-js-responsive-word-cloud/
var tags = dataTags.cr;

var results = {
    ex: "Scientists have found that extinctions often happen on <em>islands</em> when species such as <em>rats</em> (latin <em>Rattus</em>), <em>cats</em>, and <em>cattle</em> either <em>predate</em> on the local species or <em>compete</em> with them for <em>habitat</em>. The local species have nowhere else to go and so go <em>extinct</em>.",
    en: "Our visualization suggests that threats to species in these categories are linked to <em>habitat</em> changes. One of the prime examples is <em>forest area loss due</em> to <em>deforestation</em> for <em>logging</em>, <em>plantations</em> or <em>mining</em>. However it also looks like animal <em>trade</em>, <em>poaching</em> and <em>hunting</em> are key factors.",
    cr: "Our visualization suggests that threats to species in these categories are linked to <em>habitat</em> changes. One of the prime examples is <em>forest area loss due</em> to <em>deforestation</em> for <em>logging</em>, <em>plantations</em> or <em>mining</em>. However it also looks like animal <em>trade</em>, <em>poaching</em> and <em>hunting</em> are key factors.",
    ew: "The data is not sufficient to come to a conclusion.",
    vu: "TBD"
}


var drawSvg = function() {

    var fill = d3.scale.category20c();

    var w = window.innerWidth,
            h = window.innerHeight;

    var max,
        fontSize;

    var layout = d3.layout.cloud()
            .timeInterval(Infinity)
            .size([w, h])
            .fontSize(function(d) {
                return fontSize(+d.value);
            })
            .text(function(d) {
                return d.key;
            })
            .on("end", draw);

    var svg = d3.select("#vis").append("svg")
            .attr("width", w)
            .attr("height", h);

    var vis = svg.append("g").attr("transform", "translate(" + [w >> 1, h >> 1] + ")");

    update();

    window.onresize = function(event) {
        update();
    };

    function draw(data, bounds) {
        var w = window.innerWidth,
            h = window.innerHeight;

        svg.attr("width", w).attr("height", h);

        scale = bounds ? Math.min(
                w / Math.abs(bounds[1].x - w / 2),
                w / Math.abs(bounds[0].x - w / 2),
                h / Math.abs(bounds[1].y - h / 2),
                h / Math.abs(bounds[0].y - h / 2)) / 2 : 1;

        var text = vis.selectAll("text")
                .data(data, function(d) {
                    return d.text.toLowerCase();
                });
        text.transition()
                .duration(1000)
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .style("font-size", function(d) {
                    return d.size + "px";
                });
        text.enter().append("text")
                .attr("text-anchor", "middle")
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .style("font-size", function(d) {
                    return d.size + "px";
                })
                .style("opacity", 1e-6)
                .transition()
                .duration(1000)
                .style("opacity", 1);
        text.style("font-family", function(d) {
            return d.font;
        })
                .style("fill", function(d) {
                    return fill(d.text.toLowerCase());
                })
                .text(function(d) {
                    return d.text;
                });

        vis.transition().attr("transform", "translate(" + [w >> 1, h >> 1] + ")scale(" + scale + ")");
    }

    function update() {
        layout.font('impact').spiral('archimedean');
        fontSize = d3.scale['sqrt']().range([10, 100]);
        if (tags.length){
            fontSize.domain([+tags[tags.length - 1].value || 1, +tags[0].value]);
        }
        layout.stop().words(tags).start();
    }

};

drawSvg();

 $('button').on('click', function(event){
        
        $('svg').remove();
        var tagId = event.currentTarget.id.split('-')[0]
        tags = dataTags[tagId];
        drawSvg();

        var text = $(event.currentTarget).attr('data-desc');


        $('h2').html(text);
        console.log($.parseHTML(results[tagId]));
        ($('h2 + p')).html('').append($.parseHTML(results[tagId]));

    })
(function() {
    class ScatterPlot {

        constructor() {
            this.context = d3.select("canvas").node().getContext("2d");
            console.log("berk: ", this.context);
        };

        zoomed() {
            let context = this.context;
            var transform = d3.event.transform,
                zx = transform.rescaleX(x),
                zy = transform.rescaleY(y);

            gx.call(xAxis.scale(zx));
            gy.call(yAxis.scale(zy));

            context.clearRect(0, 0, width, height);
            for (var j = 0, m = pointsets.length; j < m; ++j) {
                context.beginPath();
                context.fillStyle = d3.schemeCategory10[j];
                for (var points = pointsets[j], i = 0, n = points.length, p, px, py; i < n; ++i) {
                    p = points[i], px = zx(p[0]), py = zy(p[1]);
                    context.moveTo(px + 2.5, py);
                    context.arc(px, py, 2.5, 0, 2 * Math.PI);
                }
                context.fill();
            }
        };

        randomPointSets(num) {
            let num1 = num || 300
            let random = d3.randomNormal(0, 0.2);
            let sqrt3 = Math.sqrt(3);
            let points0 = d3.range(num1).map(() => [random() + sqrt3, random() + 1]);
            let points1 = d3.range(num1).map(() => [random() - sqrt3, random() + 1]);
            let points2 = d3.range(num1).map(() => [random(), random() - 1]);
            return [points0, points1, points2];
        }
    }
    const plot = new ScatterPlot();

    let pointsets = plot.randomPointSets(100);
    let points = d3.merge(pointsets);


    let svg = d3.select("svg");
    let width = +svg.attr("width");
    let height = +svg.attr("height");

    var k = height / width,
        x = d3.scaleLinear().domain([-4.5, 4.5]).range([0, width]),
        y = d3.scaleLinear().domain([-4.5 * k, 4.5 * k]).range([height, 0]),
        z = d3.schemeCategory10;

    var xAxis = d3.axisTop(x).ticks(12),
        yAxis = d3.axisRight(y).ticks(12 * height / width);

    var zoom = d3.zoom().on("zoom", plot.zoomed.bind(plot));

    var gx = svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + (height - 10) + ")")
        .call(xAxis);

    var gy = svg.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(10,0)")
        .call(yAxis);

    svg.selectAll(".domain")
        .style("display", "1");

    svg.call(zoom.transform, d3.zoomIdentity);
    let index = -1;

    d3.interval(function() {
        var pointset = pointsets[index = (index + 1) % (pointsets.length + 1)] || points,
            x0 = x(d3.min(pointset, function(d) { return d[0]; })),
            x1 = x(d3.max(pointset, function(d) { return d[0]; })),
            y0 = y(d3.max(pointset, function(d) { return d[1]; })),
            y1 = y(d3.min(pointset, function(d) { return d[1]; })),
            k = 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height),
            tx = (width - k * (x0 + x1)) / 2,
            ty = (height - k * (y0 + y1)) / 2;

        svg.transition()
            .duration(15000)
            .call(zoom.transform, d3.zoomIdentity
                .translate(tx, ty)
                .scale(k));
    }, 2500);

    // var image = new Image;
    // image.src = "fallback.svg";
    // image.onload = function() {
    //     context.drawImage(image, 0, 0);

    //     var a = document.createElement("a");
    //     a.download = "fallback.png";
    //     a.href = canvas.toDataURL("image/png");
    //     a.click();
    // };
})()
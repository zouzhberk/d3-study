(function() {
    /// <reference path="../typings/index.d.ts" />

    class MindMap {
        constructor(width, height) {}


        loadCSV(filepath) {
            const stratify = d3.stratify().parentId((d) => d.id.substring(0, d.id.lastIndexOf(".")));

            this.observable = Rx.Observable.create(subscribe => {
                d3.csv(filepath, (error, data) => {
                    if (error) {
                        subscribe.error(error);
                        return;
                    }
                    subscribe.next(data);
                    subscribe.complete();
                });
            }).map(data => stratify(data)).do(data => console.log(data));
        }

        loadJson(filepath) {
            this.observable = Rx.Observable.create(subscribe => {
                    d3.json(filepath, (error, data) => {
                        if (error) {
                            subscribe.error(error);
                            return;
                        }

                        subscribe.next(data);
                        subscribe.complete();
                    });
                })
                .map(data => d3.hierarchy(data))
                .do(data => console.log(data));
        }

        static transformToPolarCoordinates(x, y,width,height) {
            const angle = (x -90  ) / 180 * Math.PI;
            const radius = y;
            return [radius * Math.cos(angle) + width , radius * Math.sin(angle) + height ];

        }

        transform(width, height) {
           return (x,y) => MindMap.transformToPolarCoordinates(x, y,width,height);
           // return (x,y) =>[x, y];
        }

        render() {

            var svg = d3.select("svg");
            const width = +svg.attr("width");
            const height = +svg.attr("height");
            const g = svg.append("g")
                //.attr("transform", "translate(" + (width / 2 + 40) + "," + (height / 2 + 90) + ")");
            const project = this.transform(width/2,height/2);

            var tree = d3.tree()
                .size([width / 2, height / 2])
                .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

            this.observable.subscribe(data => {

                var root = tree(data);
                console.log(root);
                var link = g.selectAll(".link")
                    .data(root.descendants().slice(1))
                    .enter().append("path")
                    .attr("class", "link")
                    .attr("d", function(d) {
                        return "M" + project(d.x, d.y) +
                            "C" + project(d.x , d.y ) +
                            " " + project(d.parent.x, d.parent.y) +
                            " " + project(d.parent.x, d.parent.y);
                    });

                var node = g.selectAll(".node")
                    .data(root.descendants())
                    .enter().append("g")
                    .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
                    .attr("transform", function(d) { return "translate(" + project(d.x, d.y) + ")"; });

                node.append("circle")
                    .attr("r", 2.5);

                node.append("text")
                    .attr("dx", "0.31em")
                    //.attr("x", function(d) { return d.x < 180 === !d.children ? 6 : -6; })
                    //.style("text-anchor", function(d) { return d.x < 180 === !d.children ? "start" : "end"; })
                    //.attr("transform", function(d) { return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"; })
                    .attr("transform", function(d) { return "rotate(" + (90) + ")"; })
                    .text(function(d) {
                        return d.data.name;
                    });
            }, error => {
                console.error(error);
            });

        }
    }

    let mm = new MindMap();




    mm.loadCSV("data/flare.csv");
    mm.loadJson("data/learn.json");
    mm.render();

})()
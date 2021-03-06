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
            return this;
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
            return this;
        }

        static transformToPolarCoordinates(x, y, width, height) {
            const angle = (x / height - 1.5) * Math.PI * 4;
            const radius = y * 3 / 4;
            return [radius * Math.cos(angle) + width / 2, radius * Math.sin(angle) + height / 2];

        }

        transform(width, height) {
            return (x, y) => MindMap.transformToPolarCoordinates(x, y, width, height);
            //  return (x,y) =>[y+10, x];
        }

        selectSVG(element) {
            this.svg = d3.select(element);
            return this;
        }

        /**
         * Node => displayName
         */
        textMapper(mapper) {
            this.textMapper = mapper;
            return this;
        }
        render() {

            const svg = this.svg || d3.select("svg");
            const width = +svg.attr("width");
            const height = +svg.attr("height");
            const g = svg.append("g")
                //.attr("transform", function(d) { return "rotate(" + (0) + ")"; })
                //  .attr("transform", "translate(" + (width / 2 + 40) + "," + (height / 2 + 90) + ")");
            const project = this.transform(width, height);

            var tree = d3.tree().size([width / 2, height / 2])
                .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

            this.observable.subscribe(data => {
                const textMapper = this.textMapper || ((node) => node.data.id);
                var root = tree(data);
                var link = g.selectAll(".link")
                    .data(root.descendants().slice(1))
                    .enter().append("path")
                    .attr("class", "link")
                    .attr("d", function(d) {
                        const cp = project(d.x, d.y);
                        const pp = project(d.parent.x, d.parent.y);
                        return "M" + cp + "C" +
                            project(d.x, (d.y + d.parent.y) / 2) + " " +
                            project(d.x, (d.y + d.parent.y) / 2) + " " + pp;
                    }).attr("stroke", "#000000")
                    .attr("fill", "none")
                    .attr("style", "stroke-width: 2px;");

                var node = g.selectAll(".node")
                    .data(root.descendants())
                    .enter().append("g")
                    .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
                    .attr("transform", function(d) { return "translate(" + project(d.x, d.y) + ")"; });

                node.append("circle")
                    .attr("r", 2.5);

                node.append("text")
                    .attr("dx", "0.31em")
                    .attr("fill", "#ff0005")
                    //.attr("x", function(d) { return d.x < 180 === !d.children ? 6 : -6; })
                    // .style("text-anchor", function(d) { return d.x < 180 === !d.children ? "start" : "end"; })
                    //.attr("transform", function(d) { return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"; })
                    .attr("transform", function(d) {
                        //console.log(d)
                        //const angle = Math.atan( (d.x*2 - width/2 )/((d.y - height/2) ))*(180/Math.PI);
                        return "rotate(" + (0) + ")";
                    })
                    .text(this.textMapper);
            }, error => {
                console.error(error);
            });

        }
    }

    const mm = new MindMap();




    //mm.loadCSV("data/flare.csv").textMapper( node => node.data.id.split(".")[0] );
    mm.selectSVG(".svg1").loadJson("data/learn.json").textMapper(node => node.data.name).render();
    

})()
(function() {

    class MindMap {

        constructor(width, height, padding) {
            this.width = width || 800;
            this.height = height || 500;
            //边界空白
            this.padding = padding || { left: 80, right: 50, top: 20, bottom: 20 };
        }

        loadJson(jsonfile) {
            this.jsonfile = jsonfile;
            return this;
        }

        //切换开关，d 为被点击的节点
        static toggle(d) {
                if (d.children) { //如果有子节点
                    d._children = d.children; //将该子节点保存到 _children
                    d.children = null; //将子节点设置为null
                } else { //如果没有子节点
                    d.children = d._children; //从 _children 取回原来的子节点 
                    d._children = null; //将 _children 设置为 null
                }
            }
            //重绘函数
        redraw(root, source) {
            let svg = this.svg;
            const width = this.width;
            const height = this.height;
            const padding = this.padding;

debugger
            // const tree = d3.tree;
            // tree.size = [this.height, this.width];

            //应用布局，计算节点和连线
            let nodes = d3.hierarchy(root);
            let links = nodes.links();

            console.log("links = ", links.length);
            //对角线生成器
            const diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });

            /*
            （1） 计算节点和连线的位置
            */


            //重新计算节点的y坐标
            nodes.forEach(function(d) { d.y = d.depth * 180; });

            /*
            （2） 节点的处理
            */


            //获取节点的update部分
            var nodeUpdate = svg.selectAll(".node")
                .data(nodes, function(d) { return d.name; });

            //获取节点的enter部分
            var nodeEnter = nodeUpdate.enter();

            //获取节点的exit部分
            var nodeExit = nodeUpdate.exit();

            //1. 节点的 Enter 部分的处理办法
            var enterNodes = nodeEnter.append("g")
                .attr("class", "node")
                .attr("transform", d => "translate(" + source.y0 + "," + source.x0 + ")")
                .on("click", (d) => {
                    MindMap.toggle(d);
                    this.redraw(root, d);
                });

            enterNodes.append("circle")
                .attr("r", 0)
                .style("fill", (d) => (d._children ? "lightsteelblue" : "#fff"));

            enterNodes.append("text")
                .attr("x", function(d) { return d.children || d._children ? -14 : 14; })
                .attr("dy", ".35em")
                .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
                .text(function(d) { return d.name; })
                .style("fill-opacity", 0);


            //2. 节点的 Update 部分的处理办法
            var updateNodes = nodeUpdate.transition()
                .duration(500)
                .attr("transform", d => "translate(" + d.y + "," + d.x + ")");

            updateNodes.select("circle")
                .attr("r", 8)
                .style("fill", d => d._children ? "lightsteelblue" : "#fff");

            updateNodes.select("text").style("fill-opacity", 1);

            //3. 节点的 Exit 部分的处理办法
            var exitNodes = nodeExit.transition()
                .duration(500)
                .attr("transform", d => "translate(" + source.y + "," + source.x + ")")
                .remove();

            exitNodes.select("circle").attr("r", 0);

            exitNodes.select("text").style("fill-opacity", 0);

            /*
            （3） 连线的处理
            */

            //获取连线的update部分

            var linkUpdate = svg.selectAll(".link").data(links, d => d.target.name);

            //获取连线的enter部分
            var linkEnter = linkUpdate.enter();

            //获取连线的exit部分
            var linkExit = linkUpdate.exit();

            //1. 连线的 Enter 部分的处理办法
            linkEnter.insert("path", ".node")
                .attr("class", "link")
                .attr("d", (d) => {
                    var o = { x: source.x0, y: source.y0 };
                    return diagonal({ source: o, target: o });
                })
                .transition()
                .duration(500)
                .attr("d", diagonal);

            //2. 连线的 Update 部分的处理办法
            linkUpdate.transition()
                .duration(500)
                .attr("d", diagonal);

            //3. 连线的 Exit 部分的处理办法
            linkExit.transition()
                .duration(500)
                .attr("d", (d) => {
                    var o = { x: source.x, y: source.y };
                    return diagonal({ source: o, target: o });
                })
                .remove();


            /*
            （4） 将当前的节点坐标保存在变量x0、y0里，以备更新时使用
            */
            nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });

        }

        render() {

            const svgwidth = this.width + this.padding.left + this.padding.right;
            const svgheight = this.height + this.padding.top + this.padding.bottom;

            console.log(svgwidth, svgheight);
            this.svg = d3.select("body")
                .append("svg")
                .attr("width", svgwidth)
                .attr("height", svgheight)
                .append("g")
                .attr("transform", "translate(" + this.padding.left + "," + this.padding.top + ")");

            let that = this;
            //树状图布局



            d3.json(this.jsonfile, function(error, root) {

                if (error) {
                    console.error(error);
                    return;
                }
                console.log(root)



                that.root = root;

                //给第一个节点添加初始坐标x0和x1
                root.x0 = that.height / 2;
                root.y0 = 0;

                //以第一个节点为起始节点，重绘
                that.redraw(root, root);

            });
        }
    }

    const mm = new MindMap();
    mm.loadJson("data/learn.json").render();


})()
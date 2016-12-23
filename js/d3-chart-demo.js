(function(){

function renderChart01()
{
    var chartDataset = [ 5, 10, 15, 20, 25];
    d3.select('.datas')
    .selectAll('div')
    .data(chartDataset)
    .enter()
    .append('div')
    // +1. add class
    .attr('class', 'bar')
    // +2. style
    .style('height', d => (d * 10) + 'px');
    console.log("hellworld");

}


renderChart01()
})()
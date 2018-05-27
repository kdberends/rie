/* =========================================*/
/* Set-up scroll functionality*/
var scroll = scroller()
    .container(d3.select('section'));

// pass in .step selection as the steps
scroll(d3.selectAll('.step'));

// setup event handling
scroll.on('active', function (index) {
  // highlight current step text
  d3.selectAll('.step')
    .style('opacity', function (d, i) { return i === index ? 1 : 0.2; });

  // activate current section
  console.log("now at step: " + index)
  //plot.activate(index);
});
/*
scroll.on('progress', function (index, progress) {
  plot.update(index, progress);
});*/



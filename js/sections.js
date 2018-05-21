/**
 scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scrollVis = function () {
  // constants to define the size
  // and margins of the #vis div
  var aspect = [10 / 4];
  var width = 400;
  var height = width / aspect;

  var margin = { top: 40, left: 60, bottom: 40, right: 40 };

  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;

  // Sizing for the grid visualization
  var squareSize = 4;
  var squarePad = 2;
  var numPerRow = width / (squareSize + squarePad);

  // main svg used for visualization
  var svg = null;

  var colormap = ["#440154ff", "#440558ff", "#450a5cff", "#450e60ff", "#451465ff", "#461969ff",
                  "#461d6dff", "#462372ff", "#472775ff", "#472c7aff", "#46307cff", "#45337dff",
                  "#433880ff", "#423c81ff", "#404184ff", "#3f4686ff", "#3d4a88ff", "#3c4f8aff",
                  "#3b518bff", "#39558bff", "#37598cff", "#365c8cff", "#34608cff", "#33638dff",
                  "#31678dff", "#2f6b8dff", "#2d6e8eff", "#2c718eff", "#2b748eff", "#29788eff",
                  "#287c8eff", "#277f8eff", "#25848dff", "#24878dff", "#238b8dff", "#218f8dff",
                  "#21918dff", "#22958bff", "#23988aff", "#239b89ff", "#249f87ff", "#25a186ff",
                  "#25a584ff", "#26a883ff", "#27ab82ff", "#29ae80ff", "#2eb17dff", "#35b479ff",
                  "#3cb875ff", "#42bb72ff", "#49be6eff", "#4ec16bff", "#55c467ff", "#5cc863ff",
                  "#61c960ff", "#6bcc5aff", "#72ce55ff", "#7cd04fff", "#85d349ff", "#8dd544ff",
                  "#97d73eff", "#9ed93aff", "#a8db34ff", "#b0dd31ff", "#b8de30ff", "#c3df2eff",
                  "#cbe02dff", "#d6e22bff", "#e1e329ff", "#eae428ff", "#f5e626ff", "#fde725ff"];
  // d3 selection that will be used
  // for displaying visualizations
  var g = null;

  // define the line
  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);
  var zeroline = d3.line()
      .x(function(d) { return x(d.x); })
      .y(function(d) { return y(0); });
      //.curve(d3.curveCardinalOpen);
  var valueline = d3.line()
      .x(function(d) { return x(d.x); })
      .y(function(d) { return y(d.y); });
      //.curve(d3.curveCardinalOpen);
  // We will set the domain when the
  // data is processed.
  //var xAxisScale = d3.scaleLinear()
  //  .range([0, width]);

  // You could probably get fancy and
  // use just one axis, modifying the
  // scale, but I will use two separate
  // ones to keep things easy.
  //var xAxisBar = d3.axisBottom()
  //  .scale(xAxisScale);

  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
  var updateFunctions = [];

  
  /**
   * chart. Called by the display function 
   * and parsed rawData
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
  var chart = function (selection) {
    selection.each(function (rawData) {

      // Code below creates an <svg> element 
      // with a <g> element. Confusing:
      // why svgE necessary? 
      // how is parsedData already available before it's defined?
      var parsedData = parseData(rawData);
      svg = d3.select(this).selectAll('svg').data([parsedData]);

      var svgE = svg.enter().append('svg');
      svg = svg.merge(svgE);

      svg.attr('width', width + margin.left + margin.right);
      svg.attr('height', height + margin.top + margin.bottom);

      svg.append('g');

      // other elements.
      g = svg.select('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // perform some preprocessing on raw data
      

      // create
      setupVis(parsedData);

      setupSections();
    });
  };

  /**
   * activate -
   *
   * @param index - index of the activated section
   */
  chart.activate = function (index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function (i) {
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  /**
   * update
   *
   * @param index
   * @param progress
   */ 
  chart.update = function (index, progress) {
    updateFunctions[index](progress);
  };

  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   * @param wordData - data object for each word.
   * @param fillerCounts - nested data that includes
   *  element for each filler word type.
   * @param histData - binned histogram data
   */
  var setupVis = function (parseddata) {
    //g.append('g')
    //  .attr('class', 'x axis')
    //  .attr('transform', 'translate(0,' + height + ')')
    //  .call(xAxisBar);
    //g.select('.x.axis').style('opacity', 0.5);

    // Title
    // ======================================
    data = parseddata.data
    g.append('text')
      .attr('class', 'title openvis-title') // can assign multiple classes, apparently
      .attr('x', width / 2)
      .attr('y', height / 3)
      .text('Dotter');

    g.append('text')
      .attr('class', 'sub-title openvis-title')
      .attr('x', width / 2)
      .attr('y', (height / 3) + (height / 5))
      .text('Model-based design?');

    g.selectAll('.openvis-title')
      .attr('opacity', 0);

    // Graph MWE
    // ======================================

    
    

    

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.x; }));
    y.domain([-1, 0.1]);

    areas = []
    for (var i = 0; i < 4; i ++){
      var area = d3.area()
         .x(function(d) {return x(d.x)})
         .y0(function(d) {return y(d.p[i][1])})
         .y1(function(d) {return y(d.p[i][0])})
      areas.push(area)
    }

    var div = d3.select("body").append("div") 
              .attr("class", "tooltip")       
              .style("opacity", 0);


    // text label for the y axis
    g.append("text")
      .attr("class", "labels line")
      .attr("transform", "rotate(-90)")
      .attr("y", - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Flood level decrease [m]"); 

    g.append("text")
      .attr("class", "labels line")
      .attr("y", y(0.1))
      .attr("x", x(905))
      .style("text-anchor", "middle")
      .text("River coordinate [km]"); 
    
    for (var i = 0; i < 4; i ++){
      g.append("path")
       .datum(data)
       .attr("tooltip", parseddata.meta.tooltips[i])
       .attr("class", "area")
       .attr('index', i / 4 * colormap.length)
       .attr("fill", colormap[i / 4 * colormap.length])
       .attr("d", areas[i])
       .attr("opacity", 0)
       .on("mouseover", function(d) {
        if (d3.select(this).attr("opacity") != 0){
            d3.select(this).attr("class", "highlightedArea")
            // On hover, make other lines invisible
            var curId = d3.select(this).attr("index")
            svg.selectAll("path").each(function(){
                if (curId != d3.select(this).attr("index")){
                  d3.select(this).attr('opacity', 0.2)
                  }
                }
            )
            // Tooltip
            div.html(d3.select(this).attr("tooltip") + ' percent interval')
               .style("left", (d3.event.pageX) + "px")    
               .style("top", (d3.event.pageY - 28) + "px")
               .transition().duration(400).style("opacity", 1);  
         }
      }
        )
       .on("mouseout", function(d) {
        if (d3.select(this).attr("opacity") != 0){
        d3.select(this).attr("class", "area")
        d3.select(this).attr("fill", colormap[d3.select(this).attr("index")])
                       .attr("opacity", 1)
        svg.selectAll("path").each(function(){
          d3.select(this).attr('opacity', 1)
        })
        div.transition().duration(500).style("opacity", 0)
      }});
    }

    // median effect
    b = g.append("path")
      .data([data])
      .attr("class", "line valuelines")
      .attr("stroke", "red")
      .attr("stroke-width", "2")
      .attr("fill", "none")
      .attr("d", zeroline)
    

      // Add the X Axis
      g.append("g")
          .attr("transform", "translate(0," + y(0)+ ")")
          .attr("class", "axis line")
          .call(d3.axisBottom(x));

      // Add the Y Axis
      g.append("g")
          .attr("class", "axis line")
          .call(d3.axisLeft(y));
   

  };

  /**
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   *
   */
  var setupSections = function () {
    // activateFunctions are called each
    // time the active section changes

    activateFunctions[0] = showTitle;
    activateFunctions[1] = showFillerTitle;
    activateFunctions[2] = showGrid;

    // updateFunctions are called whileP
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for (var i = 0; i < activateFunctions.length; i++) {
      updateFunctions[i] = function () {};
    }
    //updateFunctions[7] = updateCough;
  };


  /**
   * ACTIVATE FUNCTIONS
   *
   * These will be called their
   * section is scrolled to.
   *
   * General pattern is to ensure
   * all content for the current section
   * is transitioned in, while hiding
   * the content for the previous section
   * as well as the next section (as the
   * user may be scrolling up or down).
   *
   */

  /**
   * showTitle - initial title
   *
   * hides: count title
   * (no previous step to hide)
   * shows: intro title
   *
   */
  function showTitle() {
    g.selectAll('.count-title')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    g.selectAll('.area')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    g.selectAll('.line')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    g.selectAll('.openvis-title')
      .transition()
      .duration(600)
      .attr('opacity', 1.0);

    g.selectAll('.valuelines')
    .transition()
    .duration(400)
    .attr("opacity", 0)
    .attr("fill", "none")
    .attr("d", zeroline);

    d3.select('body').transition().duration(750).style('background-color', 'powderblue')
  }

  /**
   * showFillerTitle - filler counts
   *
   * hides: intro title
   * hides: square grid
   * shows: filler count title
   *
   */
  function showFillerTitle() {
    g.selectAll('.openvis-title')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    g.selectAll('.line')
      .transition()
      .duration(500)
      .attr('opacity', 1);


    g.selectAll('.valuelines')
    .transition()
    .duration(1500)
    .attr("opacity", 1 )
    .attr("d", valueline);

    g.selectAll('.area')
      .transition()
      .duration(400)
      .attr('opacity', 0);
    g.selectAll('.count-title')
      .transition()
      .duration(600)
      .attr('opacity', 1.0);
    d3.select('body').transition().duration(750).style('background-color', 'white')
  }

  /**
   * showGrid - square grid
   *
   * hides: filler count title
   * hides: filler highlight in grid
   * shows: square grid
   *
   */
  function showGrid() {
    g.selectAll('.count-title')
      .transition()
      .duration(0)
      .attr('opacity', 0);

        g.selectAll('.area')
      .transition()
      .delay(function (d, i) { return 100 * (4-i);})
      .duration(750)
      .attr('opacity', 1);
  }

  

  // return chart function
  return chart;
};


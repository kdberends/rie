var protoCompareChart = function() {
	/* This chart will depict a one-dimensional figure of river flow
	 * It contains functions to demonstrate the effect of interventions
	 * and explain uncertainty
	 *
	 * To embed, first apply it to your context (e.g.):
	 * >> var LocalChart = {};
	 * >> protoSchematicRiverChart.apply(LocalChart);
	 * Next, set the canvas (this must be an SVG element in your html)
	 * >> LocalChart.setCanvas('#canvas')
	 * Initialize the figure
	 * >> LocalChart.init()
	 * All done. Now call specific functions to show elements
	 */
    var id = 0;
 	var canvas = 'body';
 	var margin = { top: 40, left: 60, bottom: 40, right: 40 };
 	var resizeTimer;
 	var svg = {};
 	var xScale = {};
 	var yScale = {};
 	var zeroline = {};
 	var valueline = {};
 	var xlim = [0, 0.3];
 	var ylim = [0, 0.3];
 	var interventions = ['relocation', 'smoothing', 'sidechannel', 'lowering', 'groynelowering', 'minemblowering'];
 	var index_accepteduncertainty = 49;
 	var desiredeffect = 0.25;
 	var data = {};
 	var xAxisConstructor = d3.axisBottom;
 	var width = null;
 	var height = null;
 	var g = null 
  var colormap = ["#FF9F1C", "#9CE2EA", "#D77B5A", "#B37FCF", "#828AB6", "#000103"];
    
    var line = d3.line()
		      .x(function(d) { return xScale(d.x); })
		      .y(function(d) { return yScale(d.y); });

    var pline= {};
    /* /////////////////////////////////////////////////////////////
	//// Initialisation & general methods
    *///////////////////////////////////////////////////////////////
 	
    this.setCanvas = function(name){
    	canvas = name
    };

    this.removeAll = function(){
   		s = d3.select(canvas).select('g')
	    s = s.remove();	    
   	};

    this.resize = function(){
        //this.removeAll()
	    this.updateScales()
	    this.updatePaths()
	    this.updateAxis()
    };
    
    this.init = function(){
    	// initialises figure
    	this.updateScales()

    	d3.select(canvas).append('g');

	    // other elements.
	    g = d3.select(canvas).select('g')
	     .style('pointer-events', 'inherit')
	     .attr('transform', 'translate(' + 10 + ',' + 10 + ')');

		var crosshair = d3.line()
		      .x(function(d) { return xScale(d.x); })
		      .y(function(d) { return yScale(d.y); });
		
		// Scale the range of the data
		this.updateScales()
	  this.drawAxis()
	};

	this.updateScales = function(){
 		width = parseFloat(d3.select(canvas).style('width'))
 		height = parseFloat(d3.select(canvas).style('height'))
	 	
	 	xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
		yScale = d3.scaleLinear().range([height-margin.bottom, margin.top]);
		
		// fixed limits (no dynamic resizing)
		yScale.domain(ylim)
		xScale.domain(xlim)

		/*
		xScale.domain(d3.extent(data.data, function(d) { return d.x; }));
		
		if (data.extent){
	    	yScale.domain(data.extent);
	    } else {
	    	yScale.domain(d3.extent(data.data, function(d) { return d.y; }));
		};
		*/
	};

	/* /////////////////////////////////////////////////////////////
	//// Data methods
    *///////////////////////////////////////////////////////////////
    
    /* Call this before initialisation */
    this.setData = function(rawData){
    	// This datafile is already suitably parsed..
    	data = rawData;
    };

    /* Call this to dynamically change data after figure creation */
    this.updateData = function(rawData){    	
    	// parse raw data from json
    	data = parseData(rawData)
    	
    	// update scales
    	this.updateScales()
    	this.updateAxis()
    	this.updatePaths()

    	// Update confidence limits
    	DB = this.drawBands
    	SB = this.showBands
		
    	// remove current bands, then change line
    	g.selectAll(".area")
         .remove()
         .on("end", function () {
	        console.log('kaaan')    
			    d3.select(canvas).selectAll('.valueline')
			    .datum(data.data)
			    .transition()
			    .duration(500)
			    .attr("d", valueline)
    		});
         DB()
         SB()
    };

    /* Change exceedance frequency*/
    this.updateUncertainty = function (newUncertainty) {
    index_accepteduncertainty = newUncertainty;

    	// redraw line
    	
    	this.drawInterventionLine()


    };

    /* Change Desired Effect*/
    this.updateDesiredEffect = function (newEffect) {
	    desiredeffect = newEffect;
	    ylim = [0, newEffect * 2];
	    xlim = [0, newEffect * 2];
	    

	   	// redraw line
	   	this.updateScales()
	   	this.drawInterventionLine()
	   	this.drawDesiredEffect()
	   	this.updateAxis()
	   	//this.highlightInterventions()
	   	
    };

	/* /////////////////////////////////////////////////////////////
	//// Axis methods
    *///////////////////////////////////////////////////////////////

	this.drawAxis = function(){
		let xticks = Math.round(width / 60)
    	let yticks = Math.round(height / 40)

	    var div = d3.select("body").append("div") 
	                .attr("class", "tooltip")       
	                .style("opacity", 0);
    
	    // text labels
	    g.append("text")
	      .attr("id", "YLabel")
	      .attr("class", "Figurelabels")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 0 )
	      .attr("x",0 - (height / 2))
	      .attr("dy", "1em")
	      .style("text-anchor", "middle")
	      .text("Desired effect [m]"); 

	    g.append("text")
	      .attr("id", "XLabel")
	      .attr("class", "Figurelabels")
	      .attr("y", yScale(-0.3))
	      .attr("x", xScale(0.6))
	      .style("text-anchor", "middle")
	      .text("Expected effect [km]"); 
	    	   
	      // Add the X Axis
	      g.append("g")
	          .attr('id', 'CompXAxis')
	          .attr("transform", "translate(0," + yScale(0) + ")")
	          .attr("class", "FigureAxes")
	          .call(d3.axisBottom(xScale).ticks(xticks));

	      // Add the Y Axis
	      g.append("g")
	      	 .attr("id", "CompYAxis")
	         .attr("class", "FigureAxes")
	         .attr("transform", "translate(" + xScale(0)+ ",0)")
	         .call(d3.axisLeft(yScale).ticks(yticks));

	      // transparent back-rectangle to capture mousemove events
	      g.append("rect")
	      	  .style("opacity", 0)
	      	  .style("fill", 'red')
		      .attr("x", 0)
		      .attr("y", 0)
		      .attr("width", width)
		      .attr("height", height);

		  // 'crosshair' to visualise where we are pointing
		  g.append("line")
		  	  .attr("class", "crosshair chx")
		  	  .attr("x1", xScale(xScale.domain()[0]))
		  	  .attr("y1", yScale(yScale.domain()[1]))
		  	  .attr("x2", xScale(xScale.domain()[0]))
		  	  .attr("y2", yScale(yScale.domain()[0]))

		  g.append("line")
		  	  .attr("class", "crosshair chy")
		  	  .attr("x1", xScale(xScale.domain()[0]))
		  	  .attr("y1", yScale(yScale.domain()[0]))
		  	  .attr("x2", xScale(xScale.domain()[1]))
		  	  .attr("y2", yScale(yScale.domain()[0]))

		  g.on('mouseover', function() {
		  	g.selectAll('.crosshair')
		  	    .style('stroke-opacity', '1')
		  });

		  g.on('mouseleave', function() {
		  	g.selectAll('.crosshair')
		  		.style('stroke-opacity', '0')
		  });
    };

    this.updateAxis = function (){
    	// number of ticks
    	let xticks = Math.round(width / 60)
    	let yticks = Math.round(height / 40)

    	d3.select('#CompYAxis')
    	   .transition()
    	   .duration(400)
    	   .call(d3.axisLeft(yScale).ticks(yticks))
   		
    	d3.select('#CompXAxis')
    	   .transition()
    	   .duration(400)
    	   .call(xAxisConstructor(xScale).ticks(xticks))
    };

    this.updateCrosshairX = function(mouseX){
    	if (mouseX >= xScale.domain()[0] & mouseX <= xScale.domain()[1]) {
		 g.selectAll('.chx')
		 	.transition()
		 	.duration(10)
		  	.attr('x1', xScale(mouseX))
		  	.attr('x2', xScale(mouseX))
		  	}
	};

	this.updateCrosshairY = function(mouseY){
    	if (mouseY >= yScale.domain()[0] & mouseY <= yScale.domain()[1]) {
		 g.selectAll('.chy')
		 	.transition()
		 	.duration(10)
		  	.attr('y1', yScale(mouseY))
		  	.attr('y2', yScale(mouseY))
		  	}
	};

	this.setYLabel = function(label){
		d3.select('#YLabel').text(label)
	};

	this.setXLabel = function(label){
		d3.select('#XLabel').text(label)
	};

    this.setXaxisCallback  = function(fnc) {
    	let self = this;
    	g.on("mousemove", function(){
         // first move mouse
    	 self.updateCrosshairX(Math.round(xScale.invert(d3.mouse(this)[0])));
    	 self.updateCrosshairY(yScale.invert(d3.mouse(this)[1]));

    	 // then add user function
	     fnc(Math.round(xScale.invert(d3.mouse(this)[0])));
	 });
    };

    /* /////////////////////////////////////////////////////////////
		  //// Path (line) methods																	///
    */////////////////////////////////////////////////////////////
    this.highlightInterventions = function() {
    	for (var i=0;i<6;i++) {
    		linename = "exc_" + interventions[i]
    		// check if line intersects with desired effect
    		let linedata = data[interventions[i]][index_accepteduncertainty]
    		if ((desiredeffect < linedata[1]['y']) & (desiredeffect > linedata[0]['y'])){
    				console.log(linedata[0]['y'])
    				d3.select('#'+linename)
		    		  .transition()
		    		  .duration(1000)
		    		  .attr('opacity', 1)
			   } else {
			   	  d3.select('#'+linename)
		    		  .transition()
		    		  .duration(1000)
		    		  .attr('opacity', 1)
			   };
    		};
    };

    this.drawInterventionLine = function(){
    	for (var i=0;i<6;i++) {
    		linename = "exc_" + interventions[i];
    		var opacity = 0;
    		var linedata = data[interventions[i]][index_accepteduncertainty];
    		if ((desiredeffect < linedata[1]['y']) & (desiredeffect > linedata[0]['y'])){
    			opacity = 1.0} else {opacity = 0.0};
	    	if (d3.select('#'+linename).empty()) {
				    	g.append("path")
				    		.data([linedata])
				    		.attr('id', linename)
				    		.attr('class', 'FigureLine')
				    		.style('stroke', colormap[i])
				    		.style('stroke-width', 3 * opacity)
				    		.style("fill", 'none')
					    	.transition()
					    	.duration(500)
					    	.attr("d", line)
					} else {
			    	// Line already plotted, update instead
		    		d3.select('#'+linename)
		    		  .data([data[interventions[i]][index_accepteduncertainty]])
		    		  .transition()
		    		  .duration(1000)
		    		  .attr('d', line)
		    		  .style('stroke-width', 3 * opacity)
			    	};
			   };
		  };

		 this.drawDesiredEffect = function(){

  		var dedata = [{'x': xlim[0], 'y': desiredeffect}, {'x': xlim[1], 'y': desiredeffect}];
    	if (d3.select('#DesiredEffect').empty()) {
			    	g.append("path")
			    		.datum(dedata)
			    		.attr('id', "DesiredEffect")
			    		.attr('class', 'FigureLine')
			    		.style('stroke', 'black')
			    		.style('stroke-width', "2")
			    		.style("fill", 'none')
				    	.transition()
				    	.duration(500)
				    	.attr("d", line)
				} else {
		    	// Line already plotted, update instead
		    	
	    		d3.select('#DesiredEffect')
	    		  .datum(dedata)
	    		  .transition()
	    		  .duration(500)
	    		  .attr('d', line)
		    	};
		   };
		    

    /* /////////////////////////////////////////////////////////////
	//// Areas and confidence bands
    *///////////////////////////////////////////////////////////////

    this.drawWater = function (){
    	var area = d3.area()
		    .x(function(d) { return xScale(d.x); })
		    .y0(function(d) { return yScale(yScale.domain()[0]); })
		    .y1(function(d) { return yScale(d.y); });

    	g.append("path")
    	 .datum(data.data)
    	 .style('fill', 'steelblue')
    	 .attr('d', area)
    };

    this.drawBands = function(){
    	areas = []
	    for (var i = 0; i < 4; i ++){
	      var area = d3.area()
	         .x(function(d) {return xScale(d.x)})
	         .y0(function(d) {return yScale(d.p[i][1])})
	         .y1(function(d) {return yScale(d.p[i][0])})
	      areas.push(area)
	    }
	    var div = d3.select("body").append("div") 
              .attr("class", "tooltip")       
              .style("opacity", 0);


    	for (var i = 0; i < 4; i ++){
	      g.append("path")
	       .datum(data.data)
	       .attr("tooltip", data.meta.tooltips[i])
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
	            d3.select(canvas).selectAll("path").each(function(){
	                if (curId != d3.select(this).attr("index")){
	                  d3.select(this).attr('opacity', 0.2)
	                  }
	                }
	            )
	            // Tooltip
	            div.html(d3.select(this).attr("tooltip"))
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
	        d3.select(canvas).selectAll("path").each(function(){
	          d3.select(this).attr('opacity', 1)
	        })
	        div.transition().duration(500).style("opacity", 0)
	      }});
	    }
    };

    this.showBands = function() {
    	g.selectAll('.area')
	      .transition()
	      .delay(function (d, i) { return 100 * (4-i);})
	      .duration(750)
	      .attr('opacity', 1);
    };

    this.hideBands = function() {
    	g.selectAll('.area')
      	 .transition()
     	 .delay(function (d, i) { return 100 * (4-i);})
      	 .duration(750)
      	 .attr('opacity', 0);
    };

    this.removeBands = function() {
    	g.selectAll(".area")
         .transition()
         .duration(750)
         .attr("opacity", 0)
         .remove();
    };
    
}; // 
 

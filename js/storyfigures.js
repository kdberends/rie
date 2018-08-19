var protoSchematicRiverChart = function() {
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
 	var data = {};
 	var xAxisConstructor = d3.axisBottom;
 	var width = null;
 	var height = null;
 	var g = null 
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
    var line = d3.line()
		      .x(function(d) { return xScale(d.x); })
		      .y(function(d) { return yScale(d.y); });

    
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
	    //this.init()
	    //this.drawBands()
	    //this.drawValueLineNoAnimation()
	    //this.showBands()
    };
    
    this.init = function(){
    	//this.setColor("#FFF")    	
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
	
	    xScale.domain(d3.extent(data.data, function(d) { return d.x; }));
	    yScale.domain(d3.extent(data.data, function(d) { return d.y; }));
	    this.drawAxis()
	    
		//this.drawBands()
	    //this.drawZeroLine()     
	};

	this.updateScales = function(){
 		width = parseFloat(d3.select(canvas).style('width'))
 		height = parseFloat(d3.select(canvas).style('height'))
	 	
	 	xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
		yScale = d3.scaleLinear().range([height-margin.bottom, margin.top]);
		xScale.domain(d3.extent(data.data, function(d) { return d.x; }));
	    yScale.domain(d3.extent(data.data, function(d) { return d.y; }));
	};

	/* /////////////////////////////////////////////////////////////
	//// Data methods
    *///////////////////////////////////////////////////////////////
    
    /* Call this before initialisation */
    this.setData = function(rawData){
    	data = parseData(rawData)
    };

    /* Call this to dynamically change data after figure creation */
    this.updateData = function(rawData){    	
    	// parse raw data from json
    	data = parseData(rawData)
    	
    	// update scales
    	this.updateScales()
    	this.updateAxis()

    	// Update confidence limits
    	DB = this.drawBands
    	SB = this.showBands
		
    	// remove current bands, then change line
    	g.selectAll(".area")
         .transition()
         .duration(750)
         .attr("opacity", 0)
         .remove()
         .on("end", function () {    
	    	d3.select(canvas).selectAll('.valueline')
	    	.datum(data.data)
	    	.transition()
	    	.duration(500)
	    	.attr("d", valueline)
	    	.on("end", function () {
	    		DB()
	    		SB()
	    	});
    	});
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
	      .text("Flood level decrease [m]"); 

	    g.append("text")
	      .attr("id", "XLabel")
	      .attr("class", "Figurelabels")
	      .attr("y", yScale(0) - 10)
	      .attr("x", xScale(905))
	      .style("text-anchor", "middle")
	      .text("Rhine kilometer [km]"); 
	    	   
	      // Add the X Axis
	      g.append("g")
	          .attr('id', 'XAxis')
	          .attr("transform", "translate(0," + yScale(0) + ")")
	          .attr("class", "FigureAxes")
	          .call(d3.axisTop(xScale).ticks(xticks));

	      // Add the Y Axis
	      g.append("g")
	      	 .attr("id", "YAxis")
	         .attr("class", "FigureAxes")
	         .attr("transform", "translate(" + xScale(868)+ ",0)")
	         .call(d3.axisLeft(yScale).ticks(yticks));

	      // transparent back-rectangle to capture mousemove events
	      g.append("rect")
	      	  .style("opacity", 0)
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

    this.moveAxis = function(ax, loc) {
    	let xticks = Math.round(width / 60)
    	let yticks = Math.round(height / 40)
    	if (ax=='x'){
    		if (loc=='zero'){
	    		d3.select('#XAxis')
		    	   .transition()
		    	   .duration(400)
		    	   .attr("transform", "translate(0," + yScale(0) + ")")
		    	   .call(d3.axisTop(xScale).ticks(xticks));
		    	xAxisConstructor = d3.axisTop;
	    	} else if (loc=='bottom') {
	    		d3.select('#XAxis')
	    		   .transition()
	    		   .duration(400)
		    	   .attr("transform", "translate(0," + yScale(yScale.domain()[0]) + ")")
		    	   .call(d3.axisBottom(xScale).ticks(xticks).tickPadding(10));
		    	xAxisConstructor = d3.axisBottom;
	    	};
    	};
    };

    this.updateAxis = function (){
    	// number of ticks
    	let xticks = Math.round(width / 60)
    	let yticks = Math.round(height / 40)

    	d3.select('#YAxis')
    	   .transition()
    	   .duration(400)
    	   .call(d3.axisLeft(yScale).ticks(yticks))
   		
    	d3.select('#XAxis')
    	   .transition()
    	   .duration(400)
    	   .attr("transform", "translate(0," + yScale(yScale.domain()[0]) + ")")
    	   .call(xAxisConstructor(xScale).ticks(xticks).tickPadding(10))
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
	//// Path (line) methods
    *///////////////////////////////////////////////////////////////

    this.drawZeroLine = function(){
    	var zeroline = d3.line()
		      .x(function(d) { return xScale(d.x); })
		      .y(function(d) { return yScale(0); });

    	d3.select(canvas).selectAll('.valueline')
    	.transition()
    	.duration(500)
    	.attr("d", zeroline)
    };
    
    this.drawMedian = function (){
    	g.append("path")
    		.data([data.data])
    		.attr('class', 'FigureLine')
    		.style('stroke', 'blue')
    		.style('stroke-width', "1")
    		.style("fill", 'none')
	    	.transition()
	    	.duration(500)
	    	.attr("d", line)
    };

    this.drawBedlevel = function (){
    	g.append("path")
    		.data([data.data])
    		.attr('class', 'FigureLine')
    		.style('stroke', 'blue')
    		.style('stroke-width', "1")
    		.style("fill", 'none')
	    	.transition()
	    	.duration(500)
	    	.attr("d", line)
    };

    this.updatePaths = function() {
       d3.selectAll('.FigureLine')
	      .transition()
	      .duration(200)
	      .attr('d', line)
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
    
}; // protoSchematicRiverChart
 

function parseData(rawData){
    // let's start with a single line

    let x = rawData.x

    let parsedData = {'meta': {'tooltips':['Very high confidence', 
                                       'High confidence', 
                                       'Medium confidence', 
                                       'Low confidence']}, 

                  'data':[]}
    for (var i = 0; i < x.length; i++){
        parsedData.data.push({"x": x[i],
                         "y":rawData.cdfs[i][50],
                         "pcts": rawData.cdfs[i],
                         "p":[
                              [rawData.cdfs[i][5], rawData.cdfs[i][95]],
                              [rawData.cdfs[i][10], rawData.cdfs[i][90]],
                              [rawData.cdfs[i][25], rawData.cdfs[i][75]],
                              [rawData.cdfs[i][40], rawData.cdfs[i][60]],
                             ]
                         });
    }
    parsedData.extent = rawData.extent

    return parsedData
};

export function protoSchematicRiverChart() {
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

	const version = 0.2;

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
    var colormap = ["#440154", "#440558", "#450a5c", "#450e60", "#451465", "#461969",
                    "#461d6d", "#462372", "#472775", "#472c7a", "#46307c", "#45337d",
                    "#433880", "#423c81", "#404184", "#3f4686", "#3d4a88", "#3c4f8a",
                    "#3b518b", "#39558b", "#37598c", "#365c8c", "#34608c", "#33638d",
                    "#31678d", "#2f6b8d", "#2d6e8e", "#2c718e", "#2b748e", "#29788e",
                    "#287c8e", "#277f8e", "#25848d", "#24878d", "#238b8d", "#218f8d",
                    "#21918d", "#22958b", "#23988a", "#239b89", "#249f87", "#25a186",
                    "#25a584", "#26a883", "#27ab82", "#29ae80", "#2eb17d", "#35b479",
                    "#3cb875", "#42bb72", "#49be6e", "#4ec16b", "#55c467", "#5cc863",
                    "#61c960", "#6bcc5a", "#72ce55", "#7cd04f", "#85d349", "#8dd544",
                    "#97d73e", "#9ed93a", "#a8db34", "#b0dd31", "#b8de30", "#c3df2e",
                    "#cbe02d", "#d6e22b", "#e1e329", "#eae428", "#f5e626", "#fde725"];
    
    var line = d3.line()
		      .x(function(d) { return xScale(d.x); })
		      .y(function(d) { return yScale(d.y); });

    var pline= {};
    /* /////////////////////////////////////////////////////////////
	//// Initialisation & general methods
    *///////////////////////////////////////////////////////////////
 	this.getVersion = function() {
 		return (version)
 	};

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
		this.updateScales()
	    //xScale.domain(d3.extent(data.data, function(d) { return d.x; }));
	    //yScale.domain(d3.extent(data.data, function(d) { return d.y; }));
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
		
		if (data.extent){
	    	yScale.domain(data.extent);
	    } else {
	    	yScale.domain(d3.extent(data.data, function(d) { return d.y; }));
		};
	};

	/* /////////////////////////////////////////////////////////////
	//// Data methods
    *///////////////////////////////////////////////////////////////
    /* returns location of maximum effect + maximum effect */
    this.getLocationOfMaximumEffect = function (sign=1) {
    	let maxloc = 0;
    	let maxeff = 0;
    	if (sign == 1) {
    		var operator = function(a, b) {return a < b};
    	} else {
    		var operator = function(a, b) {return a > b};
    	};
    	for (var i=0;i < data.data.length;i++) {
    		if (operator(data.data[i].y, maxeff)){
    			maxeff = data.data[i].y;
    			maxloc = data.data[i].x;
    		}
    	};
    	return [maxloc, maxeff]
    };

    /* Call this before initialisation */
    this.setData = function(rawData){
    	data = parseData(rawData);
    };

    this.dummy = function() {{}};
    /* Call this to dynamically change data after figure creation */
    this.updateData = function(rawData, callback=this.dummy){    	
    	// parse raw data from json
    	data = parseData(rawData)
    	
    	// update scales
    	this.updateScales()
    	this.updateAxis()
    	this.updatePaths()

    	// Update confidence limits
    	let DB = this.drawBands
    	let SB = this.showBands
		
    	// remove current bands, then change line
    	g.selectAll(".area")
         .remove()
         .on("end", function () { 
			    d3.select(canvas).selectAll('.valueline')
			    .datum(data.data)
			    .transition()
			    .duration(500)
			    .attr("d", valueline)
    		});
         DB();
         SB();
         callback();
    };

	/* /////////////////////////////////////////////////////////////
	//// Axis methods
    *///////////////////////////////////////////////////////////////

	this.drawAxis = function(){
		let xticks = Math.round(width / 60)
    	let yticks = Math.round(height / 40)


    
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
	      .attr("y", yScale(0.2))
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
    	if (d3.select('#sf_median').empty()) {
    	g.append("path")
    		.data([data.data])
    		.attr('id', 'sf_median')
    		.attr('class', 'FigureLine')
    		.style('stroke', 'blue')
    		.style('stroke-width', "1")
    		.style("fill", 'none')
	    	.transition()
	    	.duration(500)
	    	.attr("d", line)
	    } else {
	    	// Median already plotted, update instead
    		console.log('median already exists')
    	} 
	    
    };

    this.drawPercentile = function (pct){
    	var pline = d3.line()
		      .x(function(d) { return xScale(d.x); })
		      .y(function(d) { return yScale(d.pcts[pct]); });

    	if (d3.select('#sf_percentile').empty()) {
    	g.append("path")
    		.data([data.data])
    		.attr('id', 'sf_percentile')
    		.attr('class', 'FigureLine')
    		.style('stroke', 'red')
    		.style('stroke-width', "1")
    		.style("fill", 'none')
	    	.transition()
	    	.duration(500)
	    	.attr("d", pline)
	    } else {
	    	// Median already plotted, update instead
    		console.log('pct already exists')
    	} 
    };

    this.updatePercentile = function(pct) {
    	console.log(pct)
    	var pline = d3.line()
		      .x(function(d) { return xScale(d.x); })
		      .y(function(d) { return yScale(d.pcts[pct]); });
		d3.selectAll("#sf_percentile")
		   .attr("d", pline)
		 console.log (d3.select('#sf_percentile'))
    }
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
          .data([data.data])
	      .transition()
	      .duration(500)
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
    	let areas = []
	    for (var i = 0; i < 4; i ++){
	      var area = d3.area()
	         .x(function(d) {return xScale(d.x)})
	         .y0(function(d) {return yScale(d.p[i][1])})
	         .y1(function(d) {return yScale(d.p[i][0])})
	      areas.push(area)
	    }

	    var div = d3.select('body').append("div") 
              .attr("class", "floatingToolTip")       
              .style("opacity", 0)    


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
	            // On hover, make other lines less visible
	            var curId = d3.select(this).attr("index")
	            d3.select(canvas).selectAll("path").each(function(){
	                if (curId != d3.select(this).attr("index")){
	                  d3.select(this).attr('opacity', 0.2)
	                  }
	                }
	            )
	            // On hover, display tooltip
	            div.html(d3.select(this).attr("tooltip"))
	               .style("left", (d3.event.pageX) + "px")    
	               .style("top", (d3.event.pageY - 28) + "px")
	               .style('opacity', 1)
	               //.transition().duration(400).style("opacity", 1);  
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
	        div.style("opacity", 0)
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
 

class BackWaterChart {
	constructor(canvas, data){
	    this.id = 0;
	 	this.canvas = 'body';
	 	this.margin = { top: 40, left: 60, bottom: 40, right: 40 };
	 	this.resizeTimer;
	 	this.svg = {};
	 	this.xScale = {};
	 	this.yScale = {};
	 	this.zeroline = {};
	 	this.valueline = {};
	 	this.areas = []
	 	this.data = {};
	 	this.width = null;
	 	this.height = null;
	 	this.g = null 
	    this.colormap = ["#440154ff", "#440558ff", "#450a5cff", "#450e60ff", "#451465ff", "#461969ff",
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

	    this.setCanvas(canvas)
	    this.setData(data)
	    this.init()
     }

 	updateScales(){
 		this.width = parseFloat(d3.select(this.canvas).style('width'))
 		this.height = parseFloat(d3.select(this.canvas).style('height'))
	 	this.xScale = d3.scaleLinear().range([this.margin.left, this.width - this.margin.right]);
		this.yScale = d3.scaleLinear().range([this.height-this.margin.bottom, this.margin.top]);
	}

    setCanvas(name){
    	this.canvas = name
    };

    setData(rawData){
    	this.data = parseData(rawData)
    };

    init(){
    	//this.setColor("#FFF")    	
    	this.updateScales()
    	d3.select(this.canvas).append('g');

	    // other elements.
	    this.g = d3.select(this.canvas).select('g')
	     .attr('transform', 'translate(' + 10 + ',' + 10 + ')');

    	var zeroline = d3.line()
		      .x(function(d) { return this.xScale(d.x); })
		      .y(function(d) { return this.yScale(0); });
		      //.curve(d3.curveCardinalOpen);
		var valueline = d3.line()
		      .x(function(d) { return this.xScale(d.x); })
		      .y(function(d) { return this.yScale(d.y); });

		// Scale the range of the data
	
	    this.xScale.domain(d3.extent(this.data.data, function(d) { return d.x; }));
	    this.yScale.domain([-1, 0.1]);
	    this.drawBands()
	    this.drawAxis()
	    this.drawValueLine() 
	    this.showBands()	    
	};

	drawAxis(){
	   
	    var div = d3.select("body").append("div") 
	              .attr("class", "tooltip")       
	              .style("opacity", 0);

	    // text labels	    
	    this.g.append("text")
	      .attr("class", "line labels")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 0 )
	      .attr("x",0 - (this.height / 2))
	      .attr("dy", "1em")
	      .style("text-anchor", "middle")
	      .text("Flood level decrease [m]"); 


	    this.g.append("text")
	      .attr("class", "line labels")
	      .attr("y", this.yScale(0.1))
	      .attr("x", this.xScale(905))
	      .style("text-anchor", "middle")
	      .text("River kilometer [km]"); 
	    	
	    this.g.append("path")
		      .data([this.data.data])
		      .attr("class", "line valueline")
		      .attr("stroke", "red")
		      .attr("stroke-width", "2")
		      .attr("fill", "none")
		      .attr("d", this.zeroline)

	      // Add the X Axis
	      this.g.append("g")
	          .attr("transform", "translate(0," + this.yScale(0)+ ")")
	          .attr("class", "axis line")
	          .call(d3.axisTop(this.xScale));

	      // Add the Y Axis
	      this.g.append("g")
	          .attr("class", "axis line")
	          .attr("transform", "translate(" + this.xScale(868)+ ",0)")
	          .call(d3.axisLeft(this.yScale));

	      this.g.on("mousemove", function(){
	      	console.log(this.drawZeroLine)
	      	//console.log(XCoorFunc(Math.round(xScale.invert(d3.mouse(this)[0]))))
	      });
    };
    
    XCoorFunc(input){
    	1+1
    };


    drawZeroLine(){
    	var xScale = this.xScale;
    	var yScale = this.yScale;
    	var zeroline = d3.line()
		      .x(function(d) { return xScale(d.x); })
		      .y(function(d) { return yScale(0); });

    	d3.select(this.canvas).selectAll('.valueline')
    	.transition()
    	.duration(500)
    	.attr("d", this.zeroline)
    };
    
    drawValueLineNoAnimation(){
    	var valueline = d3.line()
		      .x(function(d) { return xScale(d.x); })
		      .y(function(d) { return yScale(d.y); });

    	d3.select(canvas).selectAll('.valueline')
    	.transition()
    	.duration(0)
    	.attr("d", valueline)
    };

    drawValueLine(){
    	var xScale = this.xScale;
    	var yScale = this.yScale;
    	var valueline = d3.line()
		      .x(function(d) { return xScale(d.x); })
		      .y(function(d) { return yScale(d.y); });

    	d3.select(this.canvas).selectAll('.valueline')
    	.transition()
    	.duration(500)
    	.attr("d", valueline)
    };

    drawBackground() {
    	// draw background
	    bd = [{'x':865, 'y':0},
	          {'x':870, 'y':0.2},
	          {'x':865, 'y':-0.2},
	          {'x':880, 'y':0.2},
	          {'x':865, 'y':-0.4},
	          {'x':890, 'y':0.2},
	          {'x':865, 'y':-0.5},
	          {'x':900, 'y':0.2},
	          {'x':865, 'y':-0.6},
	          {'x':910, 'y':0.2},
	          {'x':865, 'y':-0.7},
	          {'x':920, 'y':0.2},
	          {'x':865, 'y':-0.8},
	          {'x':930, 'y':0.2},
	          {'x':865, 'y':-0.9},
	          {'x':945, 'y':0.2},
	          {'x':865, 'y':-1},
	          {'x':945, 'y':-0.1},
	          {'x':865, 'y':-1},
	          {'x':945, 'y':-0.2},
	          {'x':865, 'y':-1},
	          {'x':945, 'y':-0.4},
	          {'x':865, 'y':-1},
	          {'x':945, 'y':-0.45},
	          {'x':865, 'y':-1},
	          {'x':945, 'y':-0.50},
	          {'x':865, 'y':-1},
	          {'x':945, 'y':-0.55},
	          {'x':865, 'y':-1},
	          {'x':945, 'y':-0.75},
	          {'x':865, 'y':-1},
	          {'x':945, 'y':-1},
	          {'x':865, 'y':-1.2},
	          {'x':950, 'y':-1.2},
	          {'x':950, 'y':0.15},
	          {'x':860, 'y':0.15},
	          {'x':865, 'y':-1.2},
	           ]
	    
	   	var bline = d3.line()
	   	.curve(d3.curveCardinal)
	   	.x(function(d) {return xScale(d.x)})
	   	.y(function(d) {return yScale(d.y)})
	   	

	   	bb = g.append('path')
	   	.data([bd])
	   	.attr("class", "background")
	   	.attr("stroke", "white")
	   	.attr("fill", "none")
	   	.attr('stroke-linecap', 'square')
	   	.attr("stroke-width", "60")
	   	.attr("opacity", 1)
	   	.attr("d", bline)
	   var totalLength = bb.node().getTotalLength();
	   
	   bb.attr("stroke-dasharray", totalLength + " " + totalLength)
	    .attr("stroke-dashoffset", totalLength)
	    .transition()
	    .ease(d3.easeLinear)
        .duration(1000)
        .attr("stroke-dashoffset", 0)
        .on("end", function(){
        	d3.select(canvas).style('background-color', 'rgb(255, 255, 255, 1)')
        	drawAxis()
        	drawZeroline()
        	bb.remove() 
        });
    };
      
   	removeAll(){
   		s = d3.select(canvas).select('g')
	    s = s.remove();	    
   	};

    resize(){
        this.removeAll()
	    this.updateScales()
	    this.init()
	    this.drawBands()
	    this.drawValueLineNoAnimation()
	    this.showBands()
    };

    drawBands(){
    	var xScale = this.xScale;
    	var yScale = this.yScale;
	    for (var i = 0; i < 4; i ++){
	      var area = d3.area()
	         .x(function(d) {return xScale(d.x)})
	         .y0(function(d) {return yScale(d.p[i][1])})
	         .y1(function(d) {return yScale(d.p[i][0])})
	      this.areas.push(area)
	    }
	    var div = d3.select("body").append("div") 
              .attr("class", "tooltip")       
              .style("opacity", 0);


    	for (var i = 0; i < 4; i ++){
	      this.g.append("path")
	       .datum(this.data.data)
	       .attr("tooltip", this.data.meta.tooltips[i])
	       .attr("class", "area")
	       .attr('index', i / 4 * this.colormap.length)
	       .attr("fill", this.colormap[i / 4 * this.colormap.length])
	       .attr("d", this.areas[i])
	       .attr("opacity", 0)
	       .on("mouseover", function(d) {
	        if (d3.select(this).attr("opacity") != 0){
	            d3.select(this).attr("class", "highlightedArea")
	            // On hover, make other lines invisible
	            curId = d3.select(this).attr("index")
	            d3.select(this.canvas).selectAll("path").each(function(){
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
	        d3.select(this).attr("fill", this.colormap[d3.select(this).attr("index")])
	                       .attr("opacity", 1)
	        d3.select(canvas).selectAll("path").each(function(){
	          d3.select(this).attr('opacity', 1)
	        })
	        div.transition().duration(500).style("opacity", 0)
	      }});
	    }
    };

    showBands() {
    	 this.g.selectAll('.area')
      .transition()
      .delay(function (d, i) { return 100 * (4-i);})
      .duration(750)
      .attr('opacity', 1);
    };

    hideBands() {
    	g.selectAll('.area')
      	 .transition()
     	 .delay(function (d, i) { return 100 * (4-i);})
      	 .duration(750)
      	 .attr('opacity', 0);

    };

    removeBands() {
    	g.selectAll(".area")
         .transition()
         .duration(750)
         .attr("opacity", 0)
         .remove();
    }

    setColor(color){
    	d3.select(canvas).style('background-color', color)
    };

    next() {
        return id++;    
    };
 
    reset() {
        id = 0;     
    };

    /* 
     *
     */
    updateData(rawData){    	
    	// parse raw data from json
    	data = parseData(rawData)
    	
    	DB = this.drawBands
    	SB = this.showBands
    	var valueline = d3.line()
		      .x(function(d) { return xScale(d.x); })
		      .y(function(d) { return yScale(d.y); });
		
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
	    		//d3.select(this).moveToFront()	
	    	})

    	})

    }

}
 
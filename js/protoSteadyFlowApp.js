var protoSteadyFlowApp = function() {
	/* This chart will depict a one-dimensional figure of river flow
	 * It contains functions to demonstrate the effect of interventions
	 * and explain uncertainty. --> simple 1D flow 
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
 	var margin = { top: 0, left: 0, bottom: 10, right: 0 };
 	var resizeTimer;
 	var svg = {};
 	var xScale = {};
 	var yScale = {};
 	var zeroline = {};
 	var valueline = {};
 	var xlim = [0, 10000];
 	var ylim = [-7.5, 5];
 	var interventions = ['relocation', 'smoothing', 'sidechannel', 'lowering', 'groynelowering', 'minemblowering'];
 	var index_accepteduncertainty = 49;
 	var desiredeffect = 0.25;
 	var data = {};
 	var xAxisConstructor = d3.axisBottom;
 	var width = null;
 	var height = null;
 	var g = null 
    var colormap = ["#FF9F1C", "#9CE2EA", "#D77B5A", "#B37FCF", "#828AB6", "#000103"];
    var data_archive = [];
    var difference_data = [];

    var line = d3.line()
		      .x(function(d) { return xScale(d.x); })
		      .y(function(d) { return yScale(d.y); });

	var bedline = d3.line()
		      .x(function(d) { return xScale(d.x); })
		      .y(function(d) { return yScale(d.b); });

	var area = d3.area()
		    .x(function(d) { return xScale(d.x); })
		    .y0(function(d) { return yScale(d.y-d.h); })
		    .y1(function(d) { return yScale(d.y); });

    var pline= {};
    var timer = {};

    // Flow parameters
    var particleOpacity = 0.4;
    var bedslope = 0.0005;
    var friction = 0.04; // manning
    var riverlength = 10000;  // m
    var uniformwidth = 200;  //m
    var downstreamh =  4;  // m
    var discharge = 2000;  // m3/s
    var nsteps =  200;
    var waterlevel = new Array(nsteps)  // == waterlevel
    var bedlevel = new Array(nsteps)  // == waterlevel
    var intervention_extent = [5000, 6000] // x_left - x_right
    var intervention_depth = 0; // change w/r bedlevel

    /* /////////////////////////////////////////////////////////////
	//// Initialisation & general methods
    *///////////////////////////////////////////////////////////////
 	this.getVersion = function() {
        return (version);
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

	  	// Solve initial situation
	  	this.solve_flow()
	  	this.drawWater()
	  	this.drawLine('waterline', 'SteadyFlowLines waterline', line)
	  	this.drawLine('bedline', 'SteadyFlowLines bedline', bedline)
	  	this.drawParticles()
	};

	this.updateScales = function(){
 		width = parseFloat(d3.select(canvas).style('width'))
 		height = parseFloat(d3.select(canvas).style('height'))
	 	
	 	xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
		yScale = d3.scaleLinear().range([height-margin.bottom, margin.top]);
		
		// fixed limits (no dynamic resizing)
		yScale.domain(ylim)
		xScale.domain(xlim)

	};

	/* /////////////////////////////////////////////////////////////
	//// Data methods
    *///////////////////////////////////////////////////////////////
    this.get_bedlevel = function(x) {
    	if ((x > intervention_extent[0]) && (x < intervention_extent[1])) {
    		return -bedslope*x + intervention_depth;
    	} else {
    		return -bedslope*x;
    	}
    };

    this.build_data = function(){
    	data = [{x: 0, y:waterlevel[0], h:waterlevel[0], b:0}];
    	let dx = riverlength / nsteps;
    	for (var i=1;i<nsteps;i++){
    		let localx = data[i-1].x + dx
    		data.push({x: localx, 
    			       y: waterlevel[i],
    			       h: waterlevel[i] - this.get_bedlevel(localx),
    			       b: this.get_bedlevel(localx)})
    	};
    	//console.log(data)
    };

    /* */
    this.solve_flow = function() {
    	// Boundary condition
    	waterlevel[nsteps-1] = downstreamh + this.get_bedlevel(riverlength);

    	// euler loop
    	let dx = riverlength / nsteps;
    	for (var i=2; i<nsteps+1; i++) {
    		// coordinates at this and previous point
    		let localx = riverlength - i *dx;
    		let prevx = riverlength - (i-1) *dx;

    		// waterlevel directly upstream
    		let hprev = waterlevel[nsteps-i+1]; 
    		
            // first-order euler
            dzdx = Math.min(0, dx * this.belanger(hprev - this.get_bedlevel(localx)))

    		waterlevel[nsteps-i] = hprev - dzdx;
    	};
    	this.build_data()
    };

    this.belanger = function(h) {
    	let A = uniformwidth * h;
    	let P = uniformwidth + 2*h;
    	let R = A / P;
    	let u = discharge / A;
    	let term1 = 9.81 * bedslope;
    	let term2 = -9.81 * (u * friction)**2 / (R ** (4/3));
    	let term3 = 9.81 - u**2 / h;
    	return (term1 + term2) / term3
    };	


    /* Call this to dynamically change data after figure creation */
    this.redraw = function(rawData){    	
    	
    	// Rebuild database
    	this.solve_flow()
    	this.build_data()
    	
    	// update scales
    	this.updateScales()
    	this.updateAxis()
    	this.drawLine('waterline', '.waterline', line)
	  	this.drawLine('bedline', '.bedline', bedline)
    	this.updateAreas()
    	this.deleteParticles()
    	this.drawParticles()

    };

   	this.updatePaths = function() {
       d3.selectAll('.SteadyFlowLines')
          .data([data])
	      .transition()
	      .duration(500)
	      .attr('d', line)
    };

    this.updateAreas = function() {
    	d3.selectAll('.SteadyFlowAreas')
          .data([data])
	      .transition()
	      .duration(500)
	      .attr('d', area)	
	    d3.select('#area-gradient')
	      .transition()
	      .duration(500)
	      .attr("x1", xScale(0)).attr("y1", yScale(0))			
		  .attr("x2", xScale(waterlevel[0]*bedslope*50000)).attr("y2", yScale(waterlevel[0]))	
    };

    this.hideFlow = function() {
        d3.select('.SteadyFlowAreas').style('opacity', 0);
        d3.selectAll('.SteadyflowParticle').style('opacity', 0);
        d3.selectAll('.SteadyFlowLines').style('opacity', 0);
        particleOpacity = 0;
    };

    this.showFlow = function() {
        d3.select('.SteadyFlowAreas').style('opacity', 1)
        d3.selectAll('.SteadyflowParticle').style('opacity', 1)
        d3.selectAll('.SteadyFlowLines').style('opacity', 1)
        particleOpacity = 0.4;
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
    

		  g.append("linearGradient")				
		    .attr("id", "area-gradient")			
		    .attr("gradientUnits", "userSpaceOnUse")	
		    .attr("x1", xScale(0)).attr("y1", yScale(0))			
		    .attr("x2", xScale(170)).attr("y2", yScale(3))		
		  	.selectAll("stop")						
		    .data([								
		      {offset: "0%", color: "#0213B4"},		
		      {offset: "100%", color: "#00B7D2"}	
		    ])
		    .enter().append("stop")			
		    .attr("offset", function(d) { return d.offset; })	
		    .attr("stop-color", function(d) { return d.color; });

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
    this.get_velocity_at_h = function (umean, h, z){
    	ks = 0.004
    	return umean * (Math.log(33*z / h) + Math.log(h/ks)) / Math.log(12*h/ks)
    };


    this.get_rndvalues = function(min, max, n) {
    	var arr = []
    	while (arr.length < n){
    		arr.push(Math.random() * (max - min) + min);
    	};
    	return arr
    };

    this.drawParticles = function() {
    	var funcblevel = this.get_bedlevel;
		var funclogu = this.get_velocity_at_h;
		var funcrnd = this.get_rndvalues;
    	let nparticles = 200
    	let htol = 0.1
    	let particle_depths = this.get_rndvalues(htol, waterlevel[0] - this.get_bedlevel(0), nparticles)
    	let particle_locs = this.get_rndvalues(0, riverlength, nparticles)
    	//let particle_depths = [0.1, 0.5, 1, 1.5, 2, 2.5, 3]
    	//let particle_locs = [1, 1,1,1, 1,1, 1]
    	for (var i=0;i<particle_depths.length;i++){
    		let px = particle_locs[i];
    		g.append("circle")
	    	 .attr('class', 'SteadyflowParticle')
             .style('opacity', particleOpacity)
	    	 .attr('cx', xScale(px))
	    	 .attr('cy', yScale(particle_depths[i] + funcblevel(px)))
	    	 .attr('r', 1)
    	};

    	var dt = 500;
    	var xnew = 2;
		
		timer = d3.interval(function(elapsed) {
			// Generate a x new particles 

			particle_depths = funcrnd(htol, waterlevel[0] + funcblevel(0), nparticles - $(".SteadyflowParticle").length)

			for (var i=0;i<particle_depths.length;i++){
	    		let px = particle_locs[i];
	    		g.append("circle")
		    	 .attr('class', 'SteadyflowParticle')
                 .style('opacity', particleOpacity)
		    	 .attr('cx', xScale(0))
		    	 .attr('cy', yScale(particle_depths[i]))
		    	 .attr('r', 1)
	    	};

			// Update existing particles
			let umean = 1;  // in m/s
			let uscale = 200;

			d3.selectAll(".SteadyflowParticle")
			  .each(function (d, i) {
			  	parx = xScale.invert(d3.select(this).attr('cx'))
			  	pary = yScale.invert(d3.select(this).attr('cy'))
			  	parh = pary - funcblevel(parx)
			  	pari = Math.floor(parx / (riverlength / nsteps))  // particle index
			  	
			  	uz = funclogu(umean, 1, parh)
				

			  	if ((parx > riverlength) || (pary < funcblevel(parx))){
			  		// reset particle to x=0 at random depth
			  		/*
			  		new_x = 0;
			    	new_y = funcrnd(htol, waterlevel[0]+funcblevel(0), 1);
			    	d3.select(this)
				      .attr('cx', xScale(new_x))
				      .attr('cy', yScale(new_y))*/
				    // delete particle
				    d3.select(this).remove()
			    } else {
			    	new_x = dt / 1000 * uz * uscale + parx;
			    	// if y is higher than waterlevel, reduce to waterlevel
				    new_y = Math.min(pary + (new_x - parx)*-bedslope, data[pari].y-0.2);
				    d3.select(this)
				      .transition()
				      .ease(d3.easeLinear)
				      .duration(1000)
				      .attr('cx', xScale(new_x))
				      .attr('cy', yScale(new_y))
			     };
			  });
			
		}, dt);
    };

    this.deleteParticles = function() {
    	d3.selectAll(".SteadyflowParticle")
    	  .remove()
    };

    this.drawLine = function(lineid, lineclass, linefunction, otherData){
        if (typeof otherData == 'undefined'){
            var drawdata = data;

        } else {
            var drawdata = otherData;

        };
    	if (d3.select("#"+lineid).empty()) {
	    	g.append("path")
	    		.data([drawdata])
	    		.attr('id', lineid)
	    		.attr('class', lineclass)
	    		.style("fill", 'none')
		    	.transition()
		    	.duration(500)
		    	.attr("d", linefunction)
		} else {
    	// Line already plotted, update instead
			d3.select("#"+lineid)
			  .data([drawdata])
			  .transition()
			  .duration(500)
			  .attr('d', linefunction)
    	};
    };

    /* Saves current water-level line to array */
    this.saveLineToArchive = function(){
        data_archive.push(data);
    };

    /* deletes all saves lines from cache and figure*/
    this.emptyArchive = function() {
        data_archive = [];
        d3.selectAll('.archiveline').remove();
    };

    /* deletes last entry from archive */
    this.deleteFromArchive = function(i) {
        data_archive.splice(i, 1)
        d3.selectAll('#archiveline_'+i).remove();
        console.log(data_archive.length)
    };

    this.drawArchive = function() {
        for (var i=0;i<data_archive.length;i++){
            this.drawLine('archiveline_'+i, 
                          'archiveline', 
                          line, 
                          data_archive[i]);
        };
    };

    this.drawLatestFromArchive = function(lineclass='archiveline', lineid) {
        if (typeof lineid == 'undefined') {var lineid='archiveline_'+(data_archive.length-1)};
        this.drawLine(lineid, 
                      lineclass, 
                      line, 
                      data_archive[data_archive.length-1]);
    };

    /* draws difference between two saved lines */
    this.drawEffect = function(a, b, lineid='differenceline') {
        for (var i=0;i<data.length;i++){
            difference_data.push({
                x: data_archive[a][i].x,
                b: data_archive[a][i].b,
                h: data_archive[a][i].h - data_archive[b][i].h,
                y: (data_archive[a][i].y - data_archive[b][i].y) * 10   
            });
        };
        this.drawLine(lineid, 
                      'differenceline', 
                      line, 
                      difference_data);
    };

    this.removeEffect = function() {
        difference_data = [];
        d3.selectAll('.differenceline').remove();
    };
    /* /////////////////////////////////////////////////////////////
	//// Areas 
    *///////////////////////////////////////////////////////////////

    this.drawWater = function (){
    	g.append("path")
    	 .data([data])
    	 .attr('class', 'SteadyFlowAreas')
    	 .style('fill', "url(#area-gradient)")
    	 .attr('d', area)
    };
    

    /* /////////////////////////////////////////////////////////////
	//// Interaction 
    *///////////////////////////////////////////////////////////////

    this.changeBoundary = function(newValue) {
    	downstreamh = newValue;
    	this.redraw();
    };

    this.changeWidth = function(newValue) {
    	uniformwidth = newValue;
    	this.redraw();
    };

    this.changeSlope = function(newValue) {
    	bedslope = newValue;
    	this.redraw();
    };

    this.changeDischarge = function(newValue) {
    	discharge = newValue;
    	this.redraw();
    };

    this.changeInterventionExtent = function(newValues) {
    	intervention_extent = newValues;
    	this.redraw();
    };

    this.changeInterventionDepth = function(newValue) {
    	intervention_depth = newValue;
    	this.redraw();
    };

    this.changeFriction = function(newValue) {
        friction = newValue;
        this.redraw();
    };
}; // 
 

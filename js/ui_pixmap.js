

var offset_pixmapx=50;
var offset_pixmapy=50;
var offsety_hist=10;
var offsetx_hist=15;



function draw_calendar_pixmap (timeseries) {


	console.log('draw_calendar_pixmap:',timeseries.length)
	nr_pixels=24*60*60*1000/(data_timestep*aggtimestep);
	var pixelsize=Math.floor(width/(timeseries[0][0].length*3)); // met minumum van 5?
	if ((pixelsize<2) || (!isFinite(pixelsize))) {pixelsize=2;}
	console.log('pixelsize:', pixelsize);
	var height=timeseries.length*pixelsize+offset_pixmapx;
	canvas = document.createElement('canvas');     
    canvas.id     = "pixmap_canvas";
    canvas.width  = nr_pixels*pixelsize;
    canvas.height = height+offset_pixmapy;
    canvas.style.zIndex   = 8;
    //canvas.style.position = "absolute";        


    var svg=d3.select("#calplot")
    	.append("svg")
    	.attr('id','pixmap_svg')
		.attr("width", width)
        .attr("height", height);
    
   

    div = document.getElementById('calplot'); 
    
    div.appendChild(canvas);


     console.log(svg);

   
	var c=canvas.getContext("2d");

	var varindex=data_names.indexOf(varname);
	var maxy=meta[varindex].max;
	var miny=meta[varindex].min;
	var maxy=20;
	var dy=maxy-miny;


	 var xScale=d3.scale.linear()
				.range([0,nr_pixels*pixelsize])
  				.domain([0,24]);
 	 var yScale=d3.scale.linear()
				.range([0,height-offset_pixmapy])
  				.domain([0,timeseries.length]);       // bug: what's called 'xscale'/'yscale' is on the wrong positio
	
	var xAxis=d3.svg.axis()
				.scale(xScale)       
       			.orient("top");
  	var yAxis=d3.svg.axis()  	
  				.scale(yScale)       
       			.orient("left"); 
  //console.log(chart);

	offsetxx=50;
  	offsetxy=50;
	offsetyx=50;
  	offsetyy=50;
  	  	

  	svg.append("g")
        .attr("class","xaxis")
        .attr("transform","translate("+offsetxx+","+offsetxy+")")
        .call(xAxis);
  	svg.append("g")
        .attr("class","yaxis")
        .attr("transform","translate("+offsetyx+","+offsetyy+")")

        .call(yAxis); 




	var varnr=0;
//	var aggtimestep=5;  //datetimestep/aggtimestep
	for (i=0; i<timeseries.length; i++) {		
		
		timeserie=timeseries[i];
		xdata=timeserie[0];
		ydata=timeserie[1][varnr];    
		series_break=timeserie[2][varnr];
		
		for (j=0; j<xdata.length; j++) {
			x=((xdata[j]/(data_timestep*aggtimestep))+1)*pixelsize+offset_pixmapx;
			
			y=i*pixelsize+offset_pixmapy;
			color=(ydata[j]-miny)/dy;
			color= 256-Math.floor(color*1024);

			c.lineWidth="1";
			c.beginPath();
			c.fillStyle="rgb("+color+","+color+",255)"; 			
			c.rect(x,y,pixelsize, pixelsize); 
			c.fill(); 
			c.closePath()
		}
	}
}
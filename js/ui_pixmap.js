
var pixelsize=8;  // width /dinges

function draw_calendar_pixmap (timeseries) {

	canvas = document.createElement('canvas');        
    canvas.id     = "cal_canvas";
    canvas.width  = width;
    canvas.height = timeseries.length*pixelsize;
    canvas.style.zIndex   = 8;
    canvas.style.position = "absolute";        
    div = document.getElementById('calplot'); 
    div.appendChild(canvas)
	var c=canvas.getContext("2d");
	c.beginPath();
	
	var varindex=data_names.indexOf(varname);
	var maxy=meta[varindex].max;
	var miny=meta[varindex].min;
	var dy=maxy-miny;

	
	var varnr=0;


	for (i=0; i<timeseries.length; i++) {		
		
		timeserie=timeseries[i];
		xdata=timeserie[0];
		ydata=timeserie[1][varnr];    
		series_break=timeserie[2][varnr];

		for (j=0; j<xdata.length; j++) {
			x=((xdata[j]/hour_interval)+1)*pixelsize;
			
			y=i*pixelsize;
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
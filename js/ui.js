

meta=[{label:'d0',min:0,max:0}];
varname=var_names[0];


//var beginRange=new Date(2001,1,1);
//var endRange=new Date(2001,1,1);

nrdatasets=data_names.length;
width=500;
height=500;
var from_date=min_date;
var to_date=max_date;
var reprate='day';


// tijdelijke oplossing; echte oplossing moet uitgaan van echte maanden, d.i. maatwerk.
// dito kwartaal/jaren.
var reprate_to_period={
	'year':365*24*3600*1000,
	'quarter':90*24*3600*1000,
	'month':31*24*3600*1000,
	'week':31*24*3600*1000,
	'day':1*24*3600*1000,
	'hour':3600*1000};

var reprate_to_timestep={
	'year':12,
	'quarter':12,
	'month':31,
	'week':7,
	'day':24,
	'hour':12
};

var repPeriod=reprate_to_period[reprate];
var num_timesteps=reprate_to_timestep[reprate];
var timeStep=repPeriod/num_timesteps;


// ? factor 2.5 off?
//repPeriod=new Date(2011,1,14)-new Date(2011,1,1); // week
//dateBlock= 12*60*60*1000; //repPeriod/(60*60*1000); // lookup either smallest or most occurring time difference.



Date.prototype.getWeek = function(){
    // We have to compare against the first monday of the year not the 01/01
    // 60*60*24*1000 = 86400000
    // 'onejan_next_monday_time' reffers to the miliseconds of the next monday after 01/01

    var day_miliseconds = 86400000,
        onejan = new Date(this.getFullYear(),0,1,0,0,0),
        onejan_day = (onejan.getDay()==0) ? 7 : onejan.getDay(),
        days_for_next_monday = (8-onejan_day),
        onejan_next_monday_time = onejan.getTime() + (days_for_next_monday * day_miliseconds),
  	      // If one jan is not a monday, get the first monday of the year
        first_monday_year_time = (onejan_day>1) ? onejan_next_monday_time : onejan.getTime(),
        this_date = new Date(this.getFullYear(), this.getMonth(),this.getDate(),0,0,0),// This at 00:00:00
        this_time = this_date.getTime(),
        days_from_first_monday = Math.round(((this_time - first_monday_year_time) / day_miliseconds));

    var first_monday_year = new Date(first_monday_year_time);

    // We add 1 to "days_from_first_monday" because if "days_from_first_monday" is *7,
    // then 7/7 = 1, and as we are 7 days from first monday,
    // we should be in week number 2 instead of week number 1 (7/7=1)
    // We consider week number as 52 when "days_from_first_monday" is lower than 0,
    // that means the actual week started before the first monday so that means we are on the firsts
    // days of the year (ex: we are on Friday 01/01, then "days_from_first_monday"=-3,
    // so friday 01/01 is part of week number 52 from past year)
    // "days_from_first_monday<=364" because (364+1)/7 == 52, if we are on day 365, then (365+1)/7 >= 52 (Math.ceil(366/7)=53) and thats wrong

    return (days_from_first_monday>=0 && days_from_first_monday<364) ? Math.ceil((days_from_first_monday+1)/7) : 52;
}


var monthNames = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];




function read_data (key) {

	console.clear()
	console.log("reading data:",key)
	
	//$('#txt').html('<script src="js/een.js"></script>');
	//$('#txt').html('<object name="foo" type="text/html" data="js/een.js"/>');
	$('#txt').html('<embed type="text/html" src="js/een.js">');
	console.log($('#txt').html());
	console.log($('#txt').text());
//	console.log('a:',a);
	$('#txt').html('<script src="js/twee.js"></script>');
	console.log('a:',a);
}

function prep_data (data, dateformat) {

	var newdata=[]
	for (i=0; i<data.length; i++){

		row=data[i];
		d=row[1];
		year=parseInt(d/10000.0);
		month=parseInt((d-year*10000)/100);
		day=parseInt(d-year*10000-month*100);		
		row[1]= new Date(year,month-1,day); 

		newdata.push(row);
	}
 return newdata;
}

function prep_timeseries (data) {

	console.log('prep_timeseries');
	// tijdelijk spul
	var keycol=0;
	var datecol=1;
	var datacol=2;


	var prevDate=new Date();
	var timeseries=[];
	var hour=[];	


	for (i=0; i<nrdatasets; i++){		
		meta[i]={label:data_names[i],
				 min:data[0][data_index[i]],
				 max:data[0][data_index[i]]};				
	}

	var has_key=false;
	if (var_types.indexOf('keyid')>=0) {
		has_key=true;
	}


// handling depends on datePeriod:
// hour: ok.
// day: x-axis=hour
// week: x-axis=day of week  (because of DST)
// month: x-axis=day of month
// year: x-axis=day in year
// also todo: handle missing date-records (push x with y)
	var firstitem=true;
	var delta=0;
	console.log('repPeriod',repPeriod, has_key);

	beginRange=from_date;
	endRange=to_date;    // + has typing issues, therefore substract 0 first.
	console.log(beginRange, from_date);

	console.log('reprate,beginrange/endrange',reprate, beginRange, endRange);

	
	if (reprate=='dag') {   // uren truncaten
		beginRange=new Date(beginRange.getFullYear(), beginRange.getMonth(), beginRange.getDate());
		endRange=new Date(endRange.getFullYear(), endRange.getMonth(), endRange.getDate());
	}
	if (reprate=='week') {   //afonden op begin van week voor 1e datum
		// FIXME:check, plus endrange checken of we niet tever gaan.
		beginRange=new Date(beginRange.getFullYear(), beginRange.getMonth(), beginRange.getDate() - beginRange.getDay());
		endRange=new Date(endRange.getFullYear(), endRange.getMonth(), endRange.getDate() - endRange.getDay()+7);
	}

	if (reprate=='month') {
		beginRange=new Date(beginRange.getFullYear(), beginRange.getMonth(), 1);
		endRange=new Date(endRange.getFullYear(), endRange.getMonth()+1, 0);
	}

	if (reprate=='quarter') {
		beginmonth=beginRange.getMonth();
		beginQ=9;
		if (beginmonth<2) {beginQ=0;}
		if (beginmonth<5) {beginQ=3;}
		if (beginmonth<8) {beginQ=6;}
		endmonth=endRange.getMonth();
		endQ=9;
		if (endmonth<2) {endQ=0;}
		if (endmonth<5) {endQ=3;}
		if (endmonth<8) {endQ=6;}				
		beginRange=new Date(beginRange.getFullYear(), beginQ, 1);
		endRange=new Date(endRange.getFullYear(), endQ+1, 0);
	}


	if (reprate=='year') {
		beginRange=new Date(beginRange.getFullYear(), 0, 1);
		endRange=new Date(endRange.getFullYear(), 11, 31);
	}





	datarow=[];
	for (j=0; j<nrdatasets; j++){
		datarow[j]=[];
  		}




/*
  	d=beginRange;  	
  	console.log('repPeriod:', repPeriod, d);
  	timeseries=[];
  	while (d<endRange) {
  		timeseries.push([]);
  		d=new Date(d.valueOf()+repPeriod);  		
  		
  	}
  	console.log('timeseries:',timeseries);

*/


// key, datum, val 
//       gesorteerd op datum
// doen vooralsnog maar een key 
// 

	var timeserie_index=0;
	var timeserie=[];
	var t=beginRange;
	j=0;
    for (i=0; i<data.length; i++) {    	
    	row=data[i];    	
    /*	if (has_key) {
    		if (row[keycol]!=selected_keyid) continue;   // wilt ook meerdere selecties doen
    	} 
    */
    	d=row[datecol];   
    	if (d<from_date) continue;	
    	if (d>to_date) continue;


    	 	
    	while (t<d) {
    		timeserie.push(null);  
    		if (timeserie.length>num_timesteps) {
    			timeseries.push(timeserie);   // index ergens bijhouden
    			timeserie=[];
    			j=j+1;
    		}
    		t=new Date(t.valueOf+ timeStep);  
    	}
    	val=row[datacol];    	
    	timeserie.push(val);  
    	if (val>meta[0].max) { meta[0].max=val;}
    	if (val<meta[0].min) { meta[0].min=val;}

		if (timeserie.length>num_timesteps) {
			timeseries.push(timeserie);   // index ergens bijhouden
			timeserie=[];
			j=j+1;
		}
		t=new Date(t.valueOf+ timeStep);  

/*
    	var ival=(d-beginRange)/repPeriod;		// not the fastest way of doing this..
    	var index=Math.floor(index);
    	var index2=(ival-Math.floor(index))*repPeriod;
*/	
    	}
	console.log(timeseries) ;

    console.log("next");
	for (j=0; j<nrdatasets; j++){
		datarow[j].push(row[data_index[j]]);
	}



    	//console.log('got date:',d,prevDate,firstitem,delta,datePeriod);
    	    	// maxima / minima van deze selectie uitrekenen.
    	for (j=0; j<nrdatasets; j++) {
    		val=row[data_index[j]];
    		if (val<meta[j].min) meta[j].min=val;  
    		if (val>meta[j].max) meta[j].max=val;
    	}
    	
	timeserie=[];

	console.log('dag0:',timeseries[0]);
	console.log('dag1:',timeseries[1]);
	console.log('dag2:',timeseries[2]);
	console.log('dag3:',timeseries[3]);
	
	
    return timeseries;
}


function draw_cal(from,to) {


	t0=new Date(from.getFullYear(),0,1);
	console.log(from.getFullYear(),from.getMonth(), from.getDate());		
	t1=new Date(from.getFullYear(),11,31);


	console.log('drawcal:',t0,t1)

	$('#calendar').html('init');

	console.log(t0);
	console.log(t0.getWeek());


	var year=t0.getFullYear();
	var out='<table>\n';
	out+='<tr>'
	out+=' 		<th><label for="from_date">Begindatum </label> <input type="text" name="from_date" id="input_from_date" maxlength=8></th>';
	out+='  	<th></th>';
	out+='		<th></th>';
	out+='		<th colspan="2"><label for="from_date ">Einddatum </label> <input type="text" name="to_date" id="input_to_date" maxlength=8></th>';
	out+=' </tr>\n';
	out+='<tr> <th></th> <td class="hspacer"> </td> <th id="yearlbl">'+year+'</th><td class="hspacer"> </td> <th></th>  </tr>\n';

	
	monthNr=0;


	while (t0<t1) {

		out+='<td valign="top"><table id="calendartbl">\n';		
		out+='<tr><th colspan="7" class="monthheader" id="m_'+t0.getMonth()+'">' +monthNames[t0.getMonth()]+' </th></tr>\n';
		out+='<tr>';
		j=0;
		daynr=t0.getDay();
		while (j<daynr) {
			out+='<td class="inspace"></td>';
			j++;
		}

		thisMonth=t0.getMonth();
		prevMonth=thisMonth;
		while (thisMonth==prevMonth) {
			var day=t0.getDate();
			daynr=t0.getDay();
			dayclass="weekday";
			if ((daynr==5) || (daynr==6)) dayclass="weekend";		
			out+='<td id="d_'+day+'_'+thisMonth+'" class="day '+dayclass+'">'+day+'</td>';			
			if (daynr==6) {
				out+='</tr>\n<tr>'
			}
		
			t0.setDate(t0.getDate() + 1);	
			prevMonth=thisMonth;
			thisMonth=t0.getMonth();
		}
		while(daynr<5) {
			out+='<td class="endspace"></td>';
			daynr++;	
		}		
		out+='</tr></table>';
		monthNr++;
		if (monthNr<3)
			out+='</td><td class="hspacer"> </td>';
		if (monthNr==3) {
			out+='</td></tr>\n';
			out+='<tr>\n';
			monthNr=0;
		}
		
	}
	while(monthNr<3){
		out+='<td class="hspacer"></td>';
		monthNr++;
	}

	out+='</tr>\n</table>\n';
	$('#calendar').html(out)
	console.log(t0);
}


function draw_days_in_calendar (timeseries) {

	console.log('drawdays:',from_date,to_date);
	//d=new Date(from.getFullYear(),from.getMonth(), from.getDate());
	d=from_date;
	j=0;
	while (d<to_date) {			
		var day = d.getDate();
		var month = d.getMonth();		
		var year = d.getFullYear();
		$('#d_'+day+'_'+month).addClass("hasData");		
		d.setDate(day+1);
		//console.log(day,month,year)
	}
}



function draw_calendar_plot (timeseries) {

	var canvas= d3.select ('#calplot').append('svg')
	.attr('xmlns',"http://www.w3.org/2000/svg")
	.attr('id','cal_svg')
	.attr('width', width)
	.attr('height', height);

	varindex=data_names.indexOf(varname);
	var xScale=d3.time.scale();

	var repPeriod=reprate_to_period[reprate];

	console.log('repPeriod, timestep:',repPeriod, timeStep);

    xScale.domain([0,repPeriod]);   // time in ms
	xScale.range([50,width]); 

	console.log('minmax:',varname, varindex, meta[varindex]);
	var yScale=d3.scale.linear();
    yScale.domain([meta[varindex].max, meta[varindex].min]);
    yScale.domain([meta[varindex].max, 0]);
	yScale.range([50,height-50]); 
	var line = d3.svg.line();


	var xAxis=d3.svg.axis();
    xAxis.scale(xScale)
    	.orient("bottom");

	var yAxis=d3.svg.axis();
    yAxis.scale(yScale)
    	.orient("left")   
    	.tickFormat(function(d) {
    			if ((d/1000)>=1) { d=d/1000+"k"; }
    			return d;
			});


	var xGrid=d3.svg.axis();
    xGrid.scale(xScale)
    	.orient("bottom")
    	.tickSize(-0.7*height,0,0)
    	.tickFormat(function(d) {
    			return "";

			});
    		
 	var yGrid=d3.svg.axis();
    yGrid.scale(yScale)
    	.orient("left")
    	.tickSize(-width,0,0)
    	.tickFormat(function(d) {
    			return "";

			});

/* place axis & grids */

   canvas.append("g")
    		.attr("class","grid")
    		.attr("transform","translate(0,"+(height-50)+")")
    		.call(xGrid);
   canvas.append("g")
    		.attr("class","grid")
    		.attr("transform","translate(50,0)")
			.call(yGrid);

   canvas.append("g")
    		.attr("class","xaxis")
    		.attr("transform","translate(0,"+(height-50)+")")
    		.call(xAxis);
   canvas.append("g")
    		.attr("class","yaxis")
    		.attr("transform","translate(50,0)")
    		.call(yAxis);

/* xas / yas labels */
    canvas.append("text")
    	.attr("class", "label")
    	.attr("y", height-10)
    	.attr("x", width/2)
    	.text("tijd (uur)");

    canvas.append("text")
    	.attr("class", "label")
    	.attr("y", height/2)
    	.attr("x", 10)
    	.text(meta[0].label);


console.log('repPeriod:',repPeriod);

var line=d3.svg.line()
	.x(function(d,i)  { // console.log(d,i, xScale(d));
						 return xScale(xdata[i]); })
	.y(function(d,i)  { // console.log(d,i, yScale(d));
						 return yScale(d); }); //0.5*height-0.5*height*d/(1.0*maxy); });

	
	xdata=[];
	for (i=1; i<timeseries[0].length; i++) xdata.push((i-1) * timeStep);  //uren 
	
	console.log('got timeseries:',timeseries[1], timeseries.length);
	for (i=1; i<timeseries.length; i++) {	
		
		ydata=timeseries[i];  //data
	//	d=timeseries[i][0];
		console.log(i);
    
		canvas.append("svg:path")
			.attr("id","l_"+i)
			.attr("class","dayl")
			.attr("d", line(ydata))
			.style("stroke","blue")
			.style("fill","none")
			.style("stroke-width","2")
			.style("opacity","0.2")
			.on("click", function(d,i) { alert("Hello world:"+ this.id); });	
	}

}

function update_selectie () {
	console.log ('selectie=',$(this).val());
	selected_keylabel=$(this).val()
	selected_keyid=key2id[selected_keylabel];
	console.log ('selectie=',selected_keyid);

	draw_days_in_calendar (timeseries);
	$('#cal_svg').remove();
	timeseries=prep_timeseries(newdata);	
	draw_calendar_plot(timeseries);
}


function update_month () {

 console.log (this.id);
 m=this.id.split('_');	
 month=parseInt(m[1]);
 from=new Date(year,month,1); 
 to=new Date(year,month+1,1); 
 console.log(from,to);

 $('.day').removeClass('hasData');
 draw_days_in_calendar (timeseries);

 $('#cal_svg').remove();
 timeseries=prep_timeseries(newdata);	
 draw_calendar_plot(timeseries);
}

function update_plot () {

 console.log (this.id);
 dm=this.id.split('_');
 month=parseInt(dm[2]);
 day=parseInt(dm[1]);
 year=parseInt($('#yearlbl').html());
 console.log(year,month,day)

 newDate=new Date(year,month,day);
 console.log('newdate:',newDate);
 console.log('from_date,to_date:',from_date,to_date);
 if (newDate<from_date) {
 	from_date=newDate; 
 }  else {
 	to_date=newDate;
 }
 console.log('from,to:',from_date,to_date);

 $('.day').removeClass('hasData');
 draw_days_in_calendar (timeseries);

 $('#cal_svg').remove();
 timeseries=prep_timeseries(newdata);	
 draw_calendar_plot(timeseries);
}

function update_calday () {

 console.log('update_calday:',this.id);
 dm=this.id.split('_');
 month=parseInt(dm[2])-1;
 day=parseInt(dm[1]);
 selday='#d_'+day+'_'+month;
 console.log(selday);
 $(selday).addClass('daysel');
 }


function click_varname () {

	varname=this.id;
	console.log(varname);		
	$('#cal_svg').remove();
 	draw_calendar_plot(timeseries);
}

function update_variablename_html() {

	var list='<li> <h5>Variabele: </h5></li>';
	for (i=0; i<data_names.length; i++) {
		varname=data_names[i];			
		console.log(varname);
		list+='<li> <a href="#" id="'+varname+'" class="varname" data-varname="'+varname+'" >'+ varname+'</a> </li>';
	}
	$('#datasel_list').html(list);
	$('.varname').on('click',click_varname);
	varname=data_names[0];
}

function change_reprate () {
	
	reprange=$(this).attr('data-reprate');
	repPeriod=reprate_to_period[reprange];
	$('#cal_svg').remove();
	timeseries=prep_timeseries(newdata);	
	draw_calendar_plot(timeseries);
}


function init_page () {


//	$('#keyentry').typeahead({source:keylabel});
	$('#keyentry').on('change',update_selectie);

	console.log('init_page:',from_date);
	update_variablename_html();

	timeseries=prep_timeseries(data);
	console.log('upd:',from_date,to_date);
	draw_cal (from_date, to_date);
	console.log('upd2:',from_date,to_date);

	draw_days_in_calendar (timeseries);
	draw_calendar_plot(timeseries);

	$('.day').on('click',update_plot);
	$('.monthheader').on('click',update_month);
	$('#read').on('click',read_data);
	$('.repsel').on('click',change_reprate);
	$('.varname').on('click',click_varname);

}


$( document ).ready(init_page);


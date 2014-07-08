
function init_date_widget(inputid){

$('#input_'+inputid).on('input',get_widget_date);
$('#label_'+inputid).on('click',set_input_state);

date_selection_type='label_from_date';
update_date_selection_type();
}


function set_widget_date(inputid,datum) {
 
// console.log(datum,typeof(datum));
 s=jdate.strftime(datum,"%Y-%m-%d");
 console.log('update_date:',inputid,s);
 $('#'+inputid).val(s);
}


function get_widget_date(evt)

{
	//console.log(evt);
	s=$(this).val();
	d=jdate.strptime(s,"%Y-%m-%d");
	if (d==null) {
		$(this).css('backgroundcolor','#Fa5858');
	} else {
		$(this).css('backgroundcolor','white');
	}
	//console.log(s,d);
}


function update_date_selection_type () {

if (date_selection_type=='label_from_date') {
	$('#label_from_date').css('background-color','lightblue');
	$('#label_to_date').css('background-color','white');
}
if (date_selection_type=='label_to_date') {
	$('#label_from_date').css('background-color','white');
	$('#label_to_date').css('background-color','lightblue');	
	}
}


function set_input_state () {
 
console.log('set_input_state', this.id);
date_selection_type=this.id;
update_date_selection_type();

}

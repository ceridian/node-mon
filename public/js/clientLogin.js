$('#login').click(function(){
	var payload = {};
	payload.user = $('#user').val();
	payload.pass = $('#pass').val();
	$.ajax({
		url: '/login',
		type: 'POST',
		contentType: "application/json",
		data: JSON.stringify(payload),
		processData: false,
		complete: function(data){
			var res = data.responseText;
			if(res == 'ok'){
				window.location.replace('/');
			}else{
				$('#errorBody').html('<h4>'+res+'</h4>');
				$('#errorPopup').modal('show');
			}
		}
	});
});
$('#pass').keydown(function(event){    
    if(event.keyCode==13){
       $('#login').trigger('click');
    }
});
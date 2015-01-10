(function($){
	$('form').on('submit',login);
	var localEmail = localStorage.getItem('account')
	if(localEmail){
		$('#email').val(localEmail);
	}
	function login(e){
		e.preventDefault();
		
		var data = $(e.currentTarget).serializeArray(),
			_data = {},
			btn = $('#submitBtn').button('loading');
		$.each(data,function(i,n){
			_data[n.name] = n.value;
		});
		if(!validate(_data)){
			btn.button('reset');
			return;
		}
		if(_data.rememberme){
			localStorage.setItem('account',_data.email);
		}
		$.ajax({
			url: '/login',
			type: 'post',
			dataType: 'json',
			data: _data,
			success: function(json){
				if(json.result === 200){
					location = '/user';
				}else{
					$.util.showError(json.msg);
				}
				btn.button('reset');
			}
		});
	}

	function validate(data){
		if(data.email === ''){
			$.util.showError('Please enter your email');
			return false;
		}

		if(data.password === ''){
			$.util.showError('Please enter your password');
			return false;
		}

		
		return true;
	}
	// if(navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)){
	// 	var navbar = $('.navbar');
	// 	$('#email,#password').on('focus',function(){
	// 		navbar.hide();
	// 	}).on('blur',function(){
	// 		navbar.show();
	// 	});
	// }
	
})(jQuery);
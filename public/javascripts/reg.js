(function($){
	$('form').on('submit',reg);
	function reg(e){
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
		$.ajax({
			url: '/reg',
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
		}else if(!/^\w+@(qq|gmail)\.com$/.test(data.email)){
			$.util.showError('Please enter a valid email address.(qq|gmail)');
			return false;
		}

		if(data.password === ''){
			$.util.showError('Please enter your password');
			return false;
		}

		if(data.passwordConfirm === ''){
			$.util.showError('Please enter your password Confirm');
			return false;
		}

		if(data.password !== data.passwordConfirm){
			$.util.showError('Please enter the same password as above');
			return false;
		}
		return true;
	}

	
})(jQuery);
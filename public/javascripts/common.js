(function($){
	$.util = {
		showLoading: function(){
			var div = $('#topLoading');
			if(!div.length){
				div	= $('<div>')
					.attr('id','topLoading')
					.addClass('alert alert-info top-tips')
					.attr('role','alert')
					.text('loading...')
					.appendTo('body');
				this.setPosition(div);
			}
			div.stop(true).show().animate({top: 0}, 100);
		},
		hideLoading: function(){
			$('#topLoading').animate({top: -32}, 100, function(){
				$(this).hide();
			});
		},
		showError: function(msg){
			var div = $('#topWarning');
			if(!div.length){
				div	= $('<div>')
					.attr('id','topWarning')
					.addClass('alert alert-warning top-tips')
					.attr('role','alert')
					.appendTo('body');
			}
			div.html(msg)
			this.setPosition(div);
			div.stop(true)
				.show().animate({top: 0}, 200)
				.delay(2000)
				.animate({top: -32}, 500,function(){
					$(this).hide();
				});
		},
		setPosition: function(div){
			var win = $(window);
			div.css({
				left: ( win.width() - div.width() ) / 2
			});
		}
	};
	$(document).ajaxStart(function() {
		$.util.showLoading();
	})
	.ajaxStop(function() {
		$.util.hideLoading();
	})
	.ajaxError(function(event, xhr, settings, thrownError) {
		//
		$.util.showError(thrownError || event.type);
	})
	.ajaxSuccess(function(event, xhr, settings, json) {
		
	});
	applicationCache.addEventListener("updateready", function(){
		//refresh
	    location.reload();
	});
	
})(jQuery);
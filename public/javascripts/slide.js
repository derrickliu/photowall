(function($){
	$('.container-fluid').on('click','img',viewImg);
	function viewImg(e){
		var box = getViewBox();
		
		box.append($(e.currentTarget).clone());
	}

	function getViewBox(){
		$('body').addClass('modal-open');
		var win = $(window),
			div = $('<div>')
				.addClass('view-img-box')

				.append('<span class="view-close">')
				.appendTo('body');
		
		bind();
		return div;
	}

	function bind(){
		$('.view-close').one('click',close);
	}

	function close(e){
		$('.view-img-box').remove();
		unbind();
		$('body').removeClass('modal-open');
	}

	function unbind(){

	}
})(jQuery);
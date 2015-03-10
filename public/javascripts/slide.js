(function($){
	$('.container-fluid').on('click','img',viewImg);
	function viewImg(e){
		var box = getViewBox();

		var src = $(e.currentTarget).attr('src');
		var srcArray = src.split('.');
		var _src = srcArray[0].replace('_200','') + '.' + srcArray[1];
		
		var bigimg = $('<img>').addClass('img-responsive').attr('src',src);

		box.append(bigimg);

		var img = new Image();
		img.onload = function(){
			bigimg[0].src = _src;
		};
		img.src = _src;
	}

	var viewBox;

	function getViewBox(){
		$('body').addClass('modal-open');
		var win = $(window);
		viewBox = $('<div>')
			.addClass('view-img-box')

			.append('<span class="view-close">')
			.append('<i>')
			.appendTo('body');
		
		bind();
		return viewBox;
	}

	function bind(){
		$('.view-close').one('click',close);
	}

	function close(e){
		viewBox.remove();
		unbind();
		$('body').removeClass('modal-open');
	}

	function unbind(){

	}
})(jQuery);
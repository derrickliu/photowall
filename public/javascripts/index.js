$(function(){
	var socket = io(),
		row = $('.row'),
		hasLoadCount = 10,
		pageCount = 10;


	socket.on('add photo', function (data) {
		hasLoadCount += 1;
		var div = createItem(data.name,data.id);
		
		row.prepend(div).masonry('prepended',div[0]).imagesLoaded( function() {
			row.masonry();
		});
	});

	socket.on('index remove photo', function (data) {
		
		var item = row.children('[photoid='+ data.id +']');
		if(item.length){
			hasLoadCount -= 1;
			item.remove();
		}
		row.masonry( 'remove', item ).masonry();
		
	});

	function createItem(name,id){
		var div = $('<div>').addClass('col-xs-6 col-sm-3 col-md-2 placeholder')
					.attr('photoid',id)
					.html('<img src="'+ name +'" class="img-responsive">');
		return div;
	}

	row.masonry({
		transitionDuration: '.8s',
		itemSelector: '.placeholder'
	});


	row.imagesLoaded( function() {
		row.masonry();
		isOverly();
	});

	var isPageLoading = false,
		allLoaded = false;

	$(window).on('scroll',function(e){
		if(allLoaded || isPageLoading){
			return;
		}
		var target = $(this),
			height = target.height(),
			scrollTop = target.scrollTop(),
			docHeight = $(document).height();
		if(docHeight - height - scrollTop < 50){
			getNext();
		}
	});

	function getNext(){
		isPageLoading = true;
		$.ajax({
			url: '/index',
			type: 'get',
			dataType: 'json',
			data: {start: hasLoadCount, count: pageCount},
			success: function(json){
				if(json.result === 200){
					insertAfter(json.info);
					hasLoadCount += json.info.length;
				}else{
					isPageLoading = false;
				}
			}
		});
	}

	function isOverly(){
		//如果一屏没有显示完整，再加载10个photo
		if($(document).height() <= $(window).height()){
			getNext();
		}
	}

	function insertAfter(data){
		var arrs = [];
		if(data.length){
			$.each(data,function(i,n){
				arrs[i] = createItem(n.name,n.id)[0];
			});
			row.append(arrs).masonry('appended',arrs).imagesLoaded(function() {
				row.masonry();
				isPageLoading = false;
				isOverly();
			});
		}else{
			allLoaded = true;
			isPageLoading = false;
			insertAllLoadedTips();
		}
	}

	function insertAllLoadedTips(){
		row.after('<p class="bg-info text-info text-center">no more...</p>');
	}
});


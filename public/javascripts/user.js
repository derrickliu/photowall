$(function(){
	var user = {
		init: function(){
			this.socket = io();

			this.isPageLoading = false;
			this.pageCount = 10;
			this.hasLoadCount = hasLoadCount;
			this.allLoaded = false;

			this.userMain = $('#userMain');

			this.bind();
		},

		bind: function(){
			$('#photoBtn').on('change',$.proxy(this,'getFile'));

			var pr = $('.photo-row');
			this.bindMasonry(pr);

			var that = this;
			pr.imagesLoaded( function() {
				pr.masonry();
				that.isOverly();
			});

			this.bindScroll();

			this.userMain.delegate('.btn-link', 'click', $.proxy(this,'setEdit'))
				.delegate('.remove', 'click', $.proxy(this,'remove'));
		},

		bindMasonry: function(elems){
			elems.masonry({
				transitionDuration: '.8s',
				itemSelector: '.placeholder'
			});
		},

		isOverly: function(){
			//如果一屏没有显示完整，再加载10个photo
			if($(document).height() <= $(window).height() && this.hasLoadCount === 10){
				this.getNext();
			}
		},

		bindScroll: function(){
			var that = this;
			$(window).on('scroll',function(e){
				if(that.allLoaded || that.isPageLoading){
					return;
				}
				var target = $(this),
					height = target.height(),
					scrollTop = target.scrollTop(),
					docHeight = $(document).height();
				if(docHeight - height - scrollTop < 50){
					that.getNext();
				}
			});
		},

		getNext: function(){
			var that = this;
			this.isPageLoading = true;
			$.ajax({
				url: '/user',
				type: 'get',
				dataType: 'json',
				data: {start: that.hasLoadCount, count: that.pageCount},
				success: function(json){
					if(json.result === 200){
						that.insertAfter(json.info.photos);
						that.hasLoadCount += json.info.counts;
					}else{
						that.isPageLoading = false;
					}
				}
			});
		},

		insertAfter: function(data){
			var that = this;
			if(data.length){
				var lastLoadedDate = this.getLastLoadedDate();
				if(lastLoadedDate === data[0].date){
					var lastLoadedPhotoRow = this.getLastLoadedPhotoRow();
					var arrs = [];
					$.each(data[0].names,function(i,n){
						arrs[i] = that.createItem(n.name,n.id)[0];
					});

					lastLoadedPhotoRow.append(arrs)
						.masonry('appended',arrs)
						.imagesLoaded(function() {
							lastLoadedPhotoRow.masonry();
							that.isPageLoading = false;
							that.isOverly();
						});
					data.shift();
					this.newRowInsertAfter(data);
				}else{
					this.newRowInsertAfter(data);
				}
				
			}else{
				that.allLoaded = true;
				that.isPageLoading = false;
				that.insertAllLoadedTips();
			}
		},

		newRowInsertAfter: function(data){
			var that = this;
			$.each(data,function(i,n){
				var html = '<div class="row">'
						+'<div class="col-xs-12">'
							+'<h3>'+ n.date +' <a href="#" status="canceledit" class="small btn btn-link">edit</a></h3>'
						+'</div>'
					+'</div>'
					+'<div class="row photo-row"></div>';
				that.userMain.append(html);
				var arrs = [];
				$.each(n.names,function(j,m){
					arrs[j] = that.createItem(m.name,m.id)[0];
				});
				var lastLoadedPhotoRow = that.getLastLoadedPhotoRow();
				that.bindMasonry(lastLoadedPhotoRow);
				lastLoadedPhotoRow.append(arrs)
					.masonry('appended',arrs)
					.imagesLoaded(function() {
						lastLoadedPhotoRow.masonry();
						that.isPageLoading = false;
						that.isOverly();
					});
			});
		},

		getLastLoadedDate: function(){
			var lasth3 = this.userMain.find('h3:last'),
				date = lasth3.text().replace(' edit', '');;
			return date;
		},

		getLastLoadedPhotoRow: function(){
			return this.userMain.find('.photo-row:last');
		},

		insertAllLoadedTips: function(){
			this.userMain.append('<p class="bg-info text-info text-center">no more...</p>');
		},

		getFile: function(e){
			var target = e.target,
				files = target.files,
				prependList = this.getPrependList();
			
			this.preview(files,prependList);
		},

		getPrependList: function(){
			var main = $('#userMain'),
				d = new Date(),
				td = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(),
				firstH3 = main.find('h3:first'),
				html = '';
			if(firstH3.length && new RegExp(td).test(firstH3.text())){
				return firstH3.closest('.row').next();
			}
			html = '<div class="row">'
						+'<div class="col-xs-12">'
							+'<h3>'+ td +' <a href="#" status="canceledit" class="small btn btn-link">edit</a></h3>'
						+'</div>'
					+'</div>'
					+'<div class="row photo-row"></div>';
			main.prepend(html);
			var _row = main.find('.photo-row:first');

			this.bindMasonry(_row);
			
			return _row;
		},

		preview: function(files, photoList, idx){
			var that = this;
			idx = idx || 0;
			if(files.length > idx){
				var reader = new FileReader();

				reader.onload = function(e){
					var fileId = 'photo_' + new Date().getTime();
					var div = that.createPreviewItem(this.result,fileId);
					
					that.insertItem(photoList,div[0]);

					that.upload(files[idx],fileId);
					that.preview(files, photoList, idx+1)
				}

				reader.readAsDataURL(files[idx]);
			}
		},

		insertItem: function(row,item){
			row.prepend(item).masonry('prepended',item).imagesLoaded( function() {
				row.masonry();
			});
		},

		createPreviewItem: function(name,fileId){
			var div = $('<div>').addClass('col-xs-6 col-sm-3 col-md-2 placeholder'),
				html =  '<img id="'+ fileId +'" src="'+ name +'" class="img-responsive"><div class="progress-bar"></div>';
			
			div.html(html);
			return div;
		},

		createItem: function(name,id){
			var div = $('<div>')
						.addClass('col-xs-6 col-sm-3 col-md-2 placeholder')
						.attr('photoid',id),
				html = '<img src="'+ name +'" class="img-responsive">';
			div.html(html);
			return div;
		},

		upload: function(file,fileId){
			var fd = new FormData();
			var that = this;
			fd.append('photo',file);
			$.ajax({
				url: "/user",
				type: "POST",
				data: fd,
				processData: false,  // tell jQuery not to process the data
				contentType: false,   // tell jQuery not to set contentType
				xhr: function(){
					var xhr = $.ajaxSettings.xhr();
					xhr.upload.addEventListener('progress',function(e){
						that.uploadProgress(e,fileId);
					},false);
					return xhr;
				},
				success: function(json){
					if(json.result === 200){
						that.replaceImg(json.info,fileId);
						that.socket.emit('new photo', { name: json.info.name, id: json.info.id });
						that.hasLoadCount += 1;
					}else{
						$.util.showError(json.msg);
					}
				}
			});
		},

		uploadProgress: function(e,fileId){
			var pb = $('#'+fileId).next('.progress-bar');
			if(e.lengthComputable){
				var per = 100 - Math.floor(e.loaded / e.total * 100);
				pb.height(per + '%');
			}
		},

		replaceImg: function(data,fileId){
			var img = new Image(),
				_img = $('#' + fileId);
			if(_img.length === 0){
				console.log('error replace img');
			}
			img.onload = function(){
				_img.attr('src',data.name).parent().attr('photoid',data.id);
			};
			img.src = data.name;
		},

		setEdit: function(e){
			e.preventDefault();
			var target = $(e.currentTarget),
				status = target.attr('status'),
				relRow = target.parents('.row').next(),
				items = relRow.children();
			if(status === 'canceledit'){
				items.append('<span class="remove">remove</span>');
				target.text('cancel edit').attr('status','edit');
			}else{
				items.find('.remove').remove();
				target.text('edit').attr('status','canceledit');
			}
			
		},

		remove: function(e){
			var target = $(e.currentTarget),
				item = target.parents('.placeholder'),
				row = item.parent(),
				id = item.attr('photoid'),
				that = this;
			$.ajax({
				url: '/user',
				type: 'DELETE',
				dataType: 'json',
				data: {id: id},
				success: function(json){
					if(json.result === 200){
						that.socket.emit('remove photo', { id: id });
						item.remove();
						that.hasLoadCount -= 1;
						row.masonry( 'remove', item ).masonry();
						if(!row.children().length){
							row.prev().remove();
							row.remove();
						}
					}else{
						$.util.showError(json.msg);
					}
				}
			});
		}
	};
	user.init();
});
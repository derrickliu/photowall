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

			// $(window).error(function(a,b,c,d){
			// 	for(var i in a){
			// 		alert(a[i]);
			// 	}
			// })
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
				.delegate('.remove', 'click', $.proxy(this,'_remove'));

			$('#myModal').on('hidden.bs.modal', function (e) {
				this.currentRemovePhotoId = null;
			});

			$('#removePhotoBtn').on('click', $.proxy(this,'remove'));

			$('#singleUploadBtn').on('click', $.proxy(this,'singleUpload'));
			$('#singleUploadClose').on('click', $.proxy(this,'closeSingleFile'));
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
				date = lasth3.text().replace(' edit', '');
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
				
				that = this;
			
			if(files.length > 1){
				var prependList = this.getPrependList();
				$.each(files,function(i,n){
					var div = that.createPreviewItem('images/s.png',i);

					that.insertItem(prependList,div[0]);

					that._scale(n,i);
					// that.upload(n,i);
				});
			}else{
				this.singleFileSelect(files[0]);
			}
		},

		singleFileSelect: function(file){
			var that = this;
			getImageData(file, compressParam.getParam({
				quality: 'Normal',
				maxW: 640
			}), function (err, data) {
				var src = data.base64;
				that.canvasResultBase64 = src;
				that.canvasResultWidth = data.width;
				that.canvasResultHeight = data.height;

				that.canvasResult = data.canvas;

				// that.singleUploadImg = data.img;
				
				that.openSingleFile(src);
				
			});
			// var fReader = new FileReader();
			// var that = this;
			// fReader.onload = function (e){
	  //           var result = e.target.result;
	            
	  //           that.singleUploadImg = new Image();
			//     that.singleUploadImg.onload = function(e){
			//     	var target = e.target,
			//     		width = target.naturalWidth,
			//     		height = target.naturalHeight;

		 //    		that.singleUploadCanvas = document.createElement('canvas');
		 //    		that.singleUploadCanvas.width = 1;
		 //    		that.singleUploadCanvas.height = height;

			//         that.singleUploadCanvasContext = that.singleUploadCanvas.getContext('2d');

		 //        	that.singleUploadCanvasContext.drawImage(that.singleUploadImg, 0, 0);
		 //        	var data = that.singleUploadCanvasContext.getImageData(0,0,1,height).data;

		 //        	var sy = 0;
		 //        	var ey = height;
		 //        	var py = height;

		 //        	while(py > sy){
		 //        		var alpha = data[(py - 1) * 4 + 3];
		 //        		if(alpha === 0){
		 //        			ey = py;
		 //        		}else{
		 //        			sy = py;
		 //        		}
		 //        		py = (ey + sy) >> 1;
		 //        	}
		 //        	var ratio = py / height;

		 //        	var vertSquashRatio = (ratio === 0) ? 1: ratio;

			//         // if(width > 640){
			//         // 	height = 640 / width * height;
			//         // 	width = 640;
			//         // }
			//         // that.singleUploadCanvas.width = width * vertSquashRatio;
			//         // that.singleUploadCanvas.height = height * vertSquashRatio;
			//         // that.singleUploadCanvasContext.drawImage(that.singleUploadImg,0,0,width * vertSquashRatio,height * vertSquashRatio);
			        

			//         var sy = 0;
			// 		while (sy < naturalH) {
			// 			if (sy + d > naturalH) {
			// 				var sh = naturalH - sy;
			// 			} else {
			// 				sh = d;
			// 			}
			// 			var sx = 0;
			// 			while (sx < naturalW) {
			// 				if (sx + d > naturalW) {
			// 					var sw = naturalW - sx;
			// 				} else {
			// 					sw = d;
			// 				}
			// 				tmpCtx.clearRect(0, 0, d, d);
			// 				tmpCtx.drawImage(img, -sx, -sy);
			// 				var dx = Math.floor(sx * naturalFixW / naturalW);
			// 				var dw = Math.ceil(sw * naturalFixW / naturalW);
			// 				var dy = Math.floor(sy * naturalFixH / naturalH / vertSquashRatio);
			// 				var dh = Math.ceil(sh * naturalFixH / naturalH / vertSquashRatio);
			// 				ctx.drawImage(tmpCanvas, 0, 0, sw, sh, dx, dy, dw, dh);
			// 				sx += d;
			// 			}
			// 			sy += d;
			// 		}

			//         var type = 'image/jpg';
			//         var src = that.singleUploadCanvas.toDataURL(type);


			//         $('#scaleImg').attr('src',src);
			//         $('#imgDialog').modal('show');
			//         that.bindHammer();
			//         // var blob = that.dataURItoBlob(src,type);
			//         // that.upload(blob,id);
			//     };
			//     that.singleUploadImg.src = result;
			    
	  //       };
	  //       fReader.readAsDataURL(file);
		},

		openSingleFile: function(src){
			$('#scaleImg').attr('src',src);
	        $('#singleFileUpload').fadeIn();
	        this.bindHammer();
	    },

	    closeSingleFile: function(){
	    	$('#scaleImg').removeAttr('src');
	    	$('#singleFileUpload').fadeOut();
	    },

		bindHammer: function(){
			var img = $('#scaleImg')[0];
			this.hammerImg = img;
			var mc = new Hammer.Manager(this.hammerImg);

			// create a pinch and rotate recognizer
			// these require 2 pointers
			// var pinch = new Hammer.Pinch();
			// var rotate = new Hammer.Rotate();

			// // we want to detect both the same time
			// pinch.recognizeWith(rotate);

			// // add to the Manager
			// mc.add([pinch, rotate]);

			mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
			mc.add(new Hammer.Rotate({ threshold: 0 })).recognizeWith(mc.get('pan'));
    		mc.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith([mc.get('pan'), mc.get('rotate')]);

    		mc.on("panstart panmove", $.proxy(this,'onPan'));
			mc.on("rotatestart rotatemove", $.proxy(this,'onRotate'));
			mc.on("pinchstart pinchmove", $.proxy(this,'onPinch'));

			this.resetElement();
		},
		resetElement: function(){
			// this.hammerImg.className = 'scaleimg-an';
			this.transform = {
	            translate: { x: 0, y: 0 },
	            scale: 1,
	            angle: 0,
	            rx: 0,
	            ry: 0,
	            rz: 0
	        };

	        this.ticking = false;
	        this.transform.translateX = 0;
	        this.transform.translateY = 0;
	        this.initAngle = 0;
	        this.initScale = 1;
	        this.requestElementUpdate();
		},

		requestElementUpdate: function(){
			var that = this;
			if(!this.ticking) {
				setTimeout(function(){
					that.updateElementTransform();
				},1000 / 60);
	            this.ticking = true;
	        }
		},

		updateElementTransform: function(){
			var transform = this.transform;
			var value = [
	                    'translate3d(' + transform.translate.x + 'px, ' + transform.translate.y + 'px, 0)',
	                    'scale(' + transform.scale + ', ' + transform.scale + ')',
	                    'rotate3d('+ transform.rx +','+ transform.ry +','+ transform.rz +','+  transform.angle + 'deg)'
	        ];

	        value = value.join(" ");

	        this.hammerImg.style.webkitTransform = value;
	        this.hammerImg.style.mozTransform = value;
	        this.hammerImg.style.transform = value;

	        this.ticking = false;
	        $('#log').html(this.hammerImg.style.transform);
		},

		onPan: function(ev){
			// this.hammerImg.className = '';
			if(ev.type == 'panstart') {
	            this.transform.translateX = this.transform.translate.x;
	            this.transform.translateY = this.transform.translate.y;
	        }
	        this.transform.translate = {
	            x: this.transform.translateX + ev.deltaX,
	            y: this.transform.translateY + ev.deltaY
	        };

	        this.requestElementUpdate();
		},

		onRotate: function(ev){
			
			if(ev.type == 'rotatestart') {
	            this.initAngle = this.transform.angle || 0;
	        }
	        // $('#log').html(initAngle + '--' + ev.rotation);
	        // alert(initAngle);
	        // alert(ev.rotation);
	        // this.hammerImg.className = '';
	        this.transform.rz = 1;
	        this.transform.angle = this.initAngle + ev.rotation;
	        this.requestElementUpdate();
		},

		onPinch: function(ev){
			
			if(ev.type == 'pinchstart') {
	            this.initScale = this.transform.scale || 1;
	        }

	        // this.hammerImg.className = '';
	        this.transform.scale = this.initScale * ev.scale;

	        this.requestElementUpdate();
		},

		singleUpload: function(){
			var transform = this.transform;
			var src;
			var that = this;

			var type = 'image/png';

			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');


			// var img = new Image();

			// img.onload = function(e){
			// 	var oldWidth = this.naturalWidth,
			// 		oldHeight = this.naturalHeight,
			// 		width, height;

			// 	if(oldWidth > 640){
			// 		height = 640 / width * height;
		 //        	width = 640;
			// 	}
			// 	canvas.width = width;
			// 	canvas.height = height;

			// 	ctx.drawImage(img,0,0);
			// 	src = canvas.toDataURL(type);
			// };
			// img.src = that.canvasResultBase64;

			if(transform.scale == 1 && transform.angle == 0){
				src = this.canvasResultBase64;
				// alert(src.length / 3 >> 0)
			}else{
				var oldWidth =  this.canvasResultWidth,
					oldHeight = this.canvasResultHeight,
					scale = (function(){
						var _ = Math.round(transform.scale * 100) / 100;
						return _ > 1.5 ? 1.5 : _;
					})(), 
					newWidth = Math.round(oldWidth * scale * 100) / 100,
					newHeight = Math.round(oldHeight * scale * 100) / 100,
					canvasSize = Math.floor(Math.sqrt(Math.pow(newWidth,2) + Math.pow(newHeight,2))),
					pos = canvasSize / 2;

		        canvas.width = canvasSize;
		        canvas.height = canvasSize;
		        // ctx.fillStyle = 'rgba(255,255,255,0)';
		        // ctx.fillRect(0,0,canvasSize,canvasSize);

		        ctx.translate(pos,pos);


		        ctx.rotate(transform.angle * Math.PI/180);
		        ctx.translate(-pos,-pos);
		        ctx.scale(scale,scale);


		        // ctx.backgroundAlpha = 0;
		        // ctx.fillStyle = 'rgb(255,255,255)';
		        // ctx.fillRect(0,0,canvasSize,canvasSize);
		        ctx.drawImage(this.canvasResult, pos - newWidth / 2, pos - newHeight / 2);

		        
		        src = canvas.toDataURL(type);
		        // alert(src);
		        // canvas.toBlob(function(blob){
		        // 	that.upload(blob,0);
		        // },type);
		        
	        }
	        //转换成二进制然后上传
	        // blob = this.dataURItoBlob(src,type);
	        // this.upload(blob,0);
	        // 
	        src = src.split(',')[1];
	        //按照base64上传
	        this.base64Upload(src,0);
	        this.closeSingleFile();


	        var prependList = this.getPrependList();
			var div = this.createPreviewItem('images/s.png',0);
			this.insertItem(prependList,div[0]);
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
		
		insertItem: function(row,item){
			row.prepend(item).masonry('prepended',item).imagesLoaded( function() {
				row.masonry();
			});
		},

		createPreviewItem: function(name,id){
			var div = $('<div>').attr('id',id).addClass('col-xs-6 col-sm-3 col-md-2 placeholder'),
				html =  '<img src="'+ name +'" class="img-responsive"><div class="progress-cycle"></div>';
			
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

		_scale: function(file, id){
			var that = this;
			getImageData(file, compressParam.getParam({
				quality: 'Normal',
				maxW: 640
			}), function (err, data) {
				var src = data.base64.split(',')[1];
		        that.base64Upload(src,id);
			});
		},

		dataURItoBlob: function(dataURI,type){
			var byteString;

		    if(dataURI.split(',')[0].indexOf('base64') !== -1 ) {
		        byteString = atob(dataURI.split(',')[1]);
		    } else {
		        byteString = decodeURI(dataURI.split(',')[1]);
		    }


		    var content = new Array();
		    for (var i = 0, j = byteString.length; i < j; i++) {
		        content[i] = byteString.charCodeAt(i);
		    }

		    return this.newBlob(new Uint8Array(content), type);
		    // return new Blob([new Uint8Array(content)], {type: type});
		},

		newBlob: function(data,type){
			var out;

			try{
				out = new Blob([data], {type: type});
			}catch(e){
				window.BlobBuilder = window.BlobBuilder ||
		                window.WebKitBlobBuilder ||
		                window.MozBlobBuilder ||
		                window.MSBlobBuilder;

		        if (e.name == 'TypeError' && window.BlobBuilder) {
		            var bb = new BlobBuilder();
		            bb.append([data]);
		            out = bb.getBlob(type);
		            alert(out.size)
		            alert("case 2");
		        }
		        else if (e.name == "InvalidStateError") {
		            // InvalidStateError (tested on FF13 WinXP)
		            out = new Blob([data], {type: type});
		            alert("case 3");
		        }
		        else {
		            // We're screwed, blob constructor unsupported entirely   
		            alert("Errore");
		        }

			}

			return out;
		},

		base64Upload: function(base64Str,id){
			var that = this;
			$.ajax({
				url: 'upload',
				type: 'post',
				data: {photo: base64Str},
				xhr: function(){
					var xhr = $.ajaxSettings.xhr();
					xhr.upload.addEventListener('progress',function(e){
						that.uploadProgress(e,id);
					},false);
					return xhr;
				},
				success: function(json){
					that.uploadSucc(json,id);
				}
			});
		},

		uploadSucc: function(json,id){
			if(json.result === 200){
				this.replaceImg(json.info,id);
				this.socket.emit('new photo', { name: json.info.name, id: json.info.id });
				this.hasLoadCount += 1;
			}else{
				$.util.showError(json.msg);
			}
		},

		upload: function(file, id){
			var fd = new FormData();
			var that = this;
			fd.append('photo',file,'a.jpeg');
			$.ajax({
				url: "/user",
				type: "POST",
				data: fd,
				processData: false,  // tell jQuery not to process the data
				contentType: false,   // tell jQuery not to set contentType
				xhr: function(){
					var xhr = $.ajaxSettings.xhr();
					xhr.upload.addEventListener('progress',function(e){
						that.uploadProgress(e,id);
					},false);
					return xhr;
				},
				success: function(json){
					if(json.result === 200){
						that.replaceImg(json.info,id);
						that.socket.emit('new photo', { name: json.info.name, id: json.info.id });
						that.hasLoadCount += 1;
					}else{
						$.util.showError(json.msg);
					}
				}
			});
		},

		uploadProgress: function(e,id){
			var pb = $('#'+id).find('.progress-cycle');
			if(e.lengthComputable){
				var per = Math.floor(e.loaded / e.total * 100);

				pb.text(per + '%');
				if(per >= 100){
					pb.remove();
				}
			}
		},

		replaceImg: function(data,id){
			var img = new Image(),
				box = $('#' + id),
				_img = box.find('img'),
				row = this.getPrependList();
			if(_img.length === 0){
				console.log('error replace img');
			}
			img.onload = function(){
				_img.attr('src',data.name);
				box.attr('photoid',data.id).removeAttr('id');
				row.masonry();
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
		_remove: function(e){
			var target = $(e.currentTarget),
				item = target.parents('.placeholder'),
				id = item.attr('photoid'),
				that = this;
			this.currentRemovePhotoId = id;
			$('#myModal').modal('show');
		},

		remove: function(e){
			if(this.currentRemovePhotoId == null) return;
			var id = this.currentRemovePhotoId,
				item = $('[photoid='+ id +']'),
				row = item.parent(),
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
					$('#myModal').modal('hide');
				}
			});
		}
	};
	user.init();
});
/**
 * Created with JetBrains WebStorm.
 * User: tedzhou
 * Date: 12-11-29
 * Time: 下午5:24
 * 图片压缩 这货还是尽量做到独立运行好了，那些参数神马的交给photoPicker来搞
 * IOS 6+
 * android 3.0+
 */


	// var JpegMeta = require('./jpegMeta');
	// var JPEGEncoder = require('widget/jpegEncode');

	/**
	 * 图片压缩静态类
	 */
	var ImageCompresser = {
		/**
		 * 检测IOS平台是否有做过抽样处理
		 */
		isIOSSubSample: function (img) {
			var w = img.naturalWidth;
			var h = img.naturalHeight;
			var hasSubSample = false;
			if (w * h > 1024 * 1024) {
				//subsampling may happen over megapixel image
				var canvas = document.createElement('canvas');
				var ctx = canvas.getContext('2d');
				canvas.width = canvas.height = 1;
				ctx.drawImage(img, -w + 1, 0);
				hasSubSample = !!(ctx.getImageData(0, 0, 1, 1).data[3] === 0);
				//清理
				canvas = ctx = null;
			}
			//isIOSSubSample
			return hasSubSample;
		},

		/**
		 * 获取IOS上图片真实大小
		 * @param {Element} img
		 * @param {Number} w
		 * @param {Number} h
		 */
		getIOSImageRatio: function (img, w, h) {
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			canvas.width = 1;
			canvas.height = h;
			ctx.drawImage(img, 0, 0);
			var data = ctx.getImageData(0, 0, 1, h).data;
			var sy = 0;
			var ey = h;
			var py = h;
			while (py > sy) {
				var alpha = data[(py - 1) * 4 + 3];
				if (alpha === 0) {
					ey = py;
				} else {
					sy = py;
				}
				py = (ey + sy) >> 1;
			}
			//getIOSImageRatio
			return py / h;
		},
		transformCT: function (canvas, width, height, orientation) {
			if (orientation >= 5 && orientation <= 8) {
				//noinspection JSSuspiciousNameCombination
				canvas.width = height;
				//noinspection JSSuspiciousNameCombination
				canvas.height = width;
			} else {
				canvas.width = width;
				canvas.height = height;
			}
			var ctx = canvas.getContext('2d');
			switch (orientation) {
				case 2:
					// horizontal flip
					ctx.translate(width, 0);
					ctx.scale(-1, 1);
					break;
				case 3:
					// 180 rotate left
					ctx.translate(width, height);
					ctx.rotate(Math.PI);
					break;
				case 4:
					// vertical flip
					ctx.translate(0, height);
					ctx.scale(1, -1);
					break;
				case 5:
					// vertical flip + 90 rotate right
					ctx.rotate(0.5 * Math.PI);
					ctx.scale(1, -1);
					break;
				case 6:
					// 90 rotate right
					ctx.rotate(0.5 * Math.PI);
					ctx.translate(0, -height);
					break;
				case 7:
					// horizontal flip + 90 rotate right
					ctx.rotate(0.5 * Math.PI);
					ctx.translate(width, -height);
					ctx.scale(-1, 1);
					break;
				case 8:
					// 90 rotate left
					ctx.rotate(-0.5 * Math.PI);
					ctx.translate(-width, 0);
					break;
				default:
					break;
			}
		},
		acfix: function (natural, max) {
			var naturalWidth = natural.width;
			var naturalHeight = natural.height;
			var maxW = max.width;
			var maxH = max.height;

			var width, height;


			//获取最终生成图片大小
			if (naturalWidth > maxW && naturalWidth / naturalHeight >= maxW / maxH) {
				width = maxW;
				height = naturalHeight * maxW / naturalWidth;
			} else if (naturalHeight > maxH && naturalHeight / naturalWidth >= maxH / maxW) {
				width = naturalWidth * maxH / naturalHeight;
				height = maxH;
			} else {
				width = naturalWidth;
				height = naturalHeight;
			}

			return {
				width: width,
				height: height
			};
		},
		getImageBase64: function (img, param) {
			//合并默认配置
			param = $.extend({
				maxW: 800, //目标宽
				maxH: 800, //目标高
				quality: 0.85, //目标jpg图片输出质量
				orien: 1
			}, param);

			// 图片原始大小，ctx.drawImage的时候要
			var naturalW = img.naturalWidth;
			var naturalH = img.naturalHeight;


			//IOS平台针对大图做抽值处理
			if (($.os.iphone || $.os.ipad) && ImageCompresser.isIOSSubSample(img)) {
				naturalW = naturalW / 2;
				naturalH = naturalH / 2;
			}

			var maxH = param.maxH, maxW = param.maxW;

			// 转后的高度
			var orienW = naturalW, orienH = naturalH;


			if (param.orien >= 5 && param.orien <= 8) {
				//noinspection JSSuspiciousNameCombination
				orienW = naturalH;
				//noinspection JSSuspiciousNameCombination
				orienH = naturalW;

			}

			// 转后的宽比高大的话，把参数换下
			if (orienW > orienH) {
				maxH = maxH + maxW;
				maxW = maxH - maxW;
				maxH = maxH - maxW;
			}

			var orienFix = this.acfix({
				width:orienW,
				height:orienH
			},{
				width:maxW,
				height:maxH
			});

			var orienFixW = orienFix.width;
			var orienFixH = orienFix.height;

			var naturalFixW = orienFixW;
			var naturalFixH = orienFixH;

			if (param.orien >= 5 && param.orien <= 8) {
				naturalFixH = orienFixW;
				naturalFixW = orienFixH;
			}



			// canvas的大小
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			this.transformCT(canvas, naturalFixW, naturalFixH, param.orien);

			if ($.os.iphone || $.os.ipad) {
				var tmpCanvas = document.createElement('canvas');
				var tmpCtx = tmpCanvas.getContext('2d');
				var d = 1024;
				//瓷砖canvas的大小

				tmpCanvas.width = tmpCanvas.height = d;
				//IOS平台大尺寸图片处理
				var vertSquashRatio = ImageCompresser.getIOSImageRatio(img, naturalW, naturalH);
				var sy = 0;
				while (sy < naturalH) {
					if (sy + d > naturalH) {
						var sh = naturalH - sy;
					} else {
						sh = d;
					}
					var sx = 0;
					while (sx < naturalW) {
						if (sx + d > naturalW) {
							var sw = naturalW - sx;
						} else {
							sw = d;
						}
						tmpCtx.clearRect(0, 0, d, d);
						tmpCtx.drawImage(img, -sx, -sy);
						var dx = Math.floor(sx * naturalFixW / naturalW);
						var dw = Math.ceil(sw * naturalFixW / naturalW);
						var dy = Math.floor(sy * naturalFixH / naturalH / vertSquashRatio);
						var dh = Math.ceil(sh * naturalFixH / naturalH / vertSquashRatio);
						ctx.drawImage(tmpCanvas, 0, 0, sw, sh, dx, dy, dw, dh);
						sx += d;
					}
					sy += d;
				}
				//  ctx.restore();
				tmpCanvas = tmpCtx = null;
			}else{
				ctx.drawImage(img, 0, 0, naturalW, naturalH, 0, 0, naturalFixW, naturalFixH);
			}


			var base64Str;
			if ($.os.android) {
				var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
				var type = 'image/jpeg';
		        base64Str = canvas.toDataURL(type);
				// var encoder = new JPEGEncoder(param.quality * 100);
				// base64Str = encoder.encode(imgData);
				// encoder = null;
			} else {
				base64Str = canvas.toDataURL('image/jpeg', param.quality);
			}
			//canvas to base64
			// canvas = ctx = null;

			return {
				base64: base64Str,
				height: orienFixH,
				width: orienFixW,
				canvas: canvas
			};
		}
	};

	function compress(dataUrl, param, callback) {
		var img = new Image();
		img.onload = function () {
			var result = ImageCompresser.getImageBase64(this, param);
			var data = $.extend({}, {param: param});

			data.dataUrl = dataUrl;
			data.base64 = result.base64;

			data.canvas = result.canvas;

			data.width = result.width;
			data.height = result.height;
			data.rawWidth = img.naturalWidth;
			data.rawHeight = img.naturalHeight;

			callback(null, data);
		};
		img.onerror = function () {
			callback(new Error('图片无法解析'), null);
		};
		img.src = dataUrl;
	}


	function getImageMeta(file, callback) {
		var r = new FileReader();
		var err = null;
		var meta = null;

		r.onload = function (event) {
			if (file.type === 'image/jpeg') {
				// todo: 为了拿个方向，拉了那么大个文件，有机会要精简掉
				try {
					meta = new JpegMeta.JpegFile(event.target.result, file.name);
				} catch (ex) {
					err = ex;
				}
			}
			callback(err, meta);
		};
		r.onerror = function (event) {
			callback(event.target.error, meta);
		};
		r.readAsBinaryString(file);
	}

	function getURLObject() {
		if ($.browser.uc && $.browser.version == '8.4') {
			return false;
		}
		return (window.URL || window.webkitURL || window.mozURL);
	}

	function getImageURL(file, callback) {
		var url = getURLObject();
		if (url) {
			// todo:
			// 优先使用url对象，直接用Filereader的url，Galaxy Nexus android 4.2.2图片是全黑
			// 后面要仔细查
			callback(null, url.createObjectURL(file));
		} else {
			var r = new FileReader();
			r.onload = function (event) {
				callback(null, event.target.result);
			};
			r.onerror = function (event) {
				callback(event.target.error, null);
			};
			r.readAsDataURL(file);
		}

	}


	function getImageData(file, picParam, callback) {
		if (!file) {
			return;
		}
		// 不传参数当作屌丝机器
		var param = $.extend({}, picParam);
		getImageURL(file, function (err, dataUrl) {
			if (err) {
				callback(new Error('拿不到URL'), null);
			} else {
				getImageMeta(file, function (err, meta) {
					if (meta && meta.tiff && meta.tiff.Orientation) {
						param = $.extend({
							orien: meta.tiff.Orientation.value,
							make: meta.tiff.Make && meta.tiff.Make.value,
							model: meta.tiff.Model && meta.tiff.Model.value,
							date: meta.tiff.DateTime && meta.tiff.DateTime.value
						}, param);
					}
					compress(dataUrl, param, callback);
				})
			}
		});
	}


var compressParam = {
		_data: {
			'Normal': {
				'Android': {
					'GPRS': {
						quality: 0.80,
						maxW: 640,
						maxH: 10000
					},
					'WIFI': {
						quality: 0.90,
						maxW: 640,
						maxH: 10000
					}
				},
				'IOS': {
					'GPRS': {
						quality: 0.60,
						maxW: 640,
						maxH: 10000
					},
					'WIFI': {
						quality: 0.70,
						maxW: 640,
						maxH: 10000
					}
				}
			},
			'High': {
				'Android': {
					'GPRS': {
						quality: 0.70,
						maxW: 1200,
						maxH: 10000
					},
					'WIFI': {
						quality: 0.96,
						maxW: 1200,
						maxH: 10000
					}
				},
				'IOS': {
					'GPRS': {
						quality: 0.50,
						maxW: 1600,
						maxH: 10000
					},
					'WIFI': {
						quality: 0.96,
						maxW: 1600,
						maxH: 10000
					}
				}
			}
		},
		getParam: function (opt) {
			opt = opt || {};
			var quality = opt.quality || 'Normal';
			var phone = opt.quality || $.os.iphone ? 'IOS' : 'Android';
			var network = opt.network || 'GPRS';
			return $.extend({}, this._data[quality][phone][network]);
		}
	};
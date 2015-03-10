(function(win){
	win.loadCache = function(urls){
		var o = jx(urls);
		if(typeof localStorage == 'object'){
			var i = 0,
				j = o.length;
			for(; i < j; i++){
				var _o = o[i],
					_u = localStorage.getItem(_o.url),
					_uJson;
				console.log(_o.url);
				if(_u){
					_uJson = JSON.parse(_u);
					//如果缓存的版本跟请求的一致，读取缓存
					if(_uJson.v == _o.v){
						ioCache(_uJson);
					}else{
						updateCache(_o);
					}
				}else{
					updateCache(_o);
				}
			}
		}else{
			httpLoad(o);
		}
	}

	function jx(urls){
		var i = 0, j = urls.length,
			o = [];
		for(; i < j; i++){
			var u = urls[i],
				v = /\w{8}$/.exec(urls[i])[0],
				url = u.replace('?'+v,'');
			o[i] = {
				type: /\.css/.test(u) ? 'css' : 'js',
				v: v,
				url: url
			}
		}
		return o;
	}

	function ioCache(o){
		if(o.type === 'css'){
			var str = o.value;//.replace(/url\(images/g,'url(release/css/images');
			document.write('<style type="text/css">' + str + '</style>');
			try{
				document.body.removeAttribute('style');
			}catch(e){
				
			}
			
		}else if(o.type === 'js'){
			// eval(o.value);
			document.write('<script>' + o.value + '<\/script>');
		}
	}

	function updateCache(o){
		req(o.url + '?' + o.v,function(str){
			var value = {
				v: o.v,
				type: o.type,
				value: str
			};
			localStorage.setItem(o.url,JSON.stringify(value));
			ioCache(value);
		});
	}

	function req(url,callback){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4){
				if((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304){
					callback(xhr.responseText);
				}else{
					alert(xhr.status);
				}
			}
		};
		xhr.open('GET', url, false);
		xhr.send(null);
	}

	function httpLoad(o){
		var head = document.head,
			elem;
		for(var i = 0, j = o.length; i < j; i++){
			var _o = o[i];
			if(_o.type == 'css'){
				elem = document.createElement('link');
				elem.setAttribute('rel','stylesheet');
				elem.setAttribute('href',_o.url + '?' + _o.v);
			}else if(_o.type == 'js'){
				elem = document.createElement('script');
				elem.setAttribute('src',_o.url + '?' + _o.v);
			}
			head.appendChild(elem);
		}
	}
})(window);
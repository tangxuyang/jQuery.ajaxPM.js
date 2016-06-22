/*
	author:txy
	email:tangxuyang.hi@163.com
	date:2016-06-22
*/

+function($){
	$.ajaxPM = function(options){
		var iframe = $('iframe[src="'+options.middleUrl+'"]');
		if(iframe.length === 0){
			iframe = $('<iframe></iframe>');
			iframe.src=options.middleUrl;	
			iframe.css('display','none').appendTo($('body'));		
		}

		iframe = iframe[0];

		var win = iframe.contentWindow;
		
		var rdm = parseInt(Math.random()*100000000);//这个数字是我随便写的
		var successEventName ='success'+rdm,errorEventName="error"+rdm;
		var successMethod = options.success, errorMethod = options.error;
		options.success = successEventName;
		options.error = errorEventName;
		win.postMessage(options,"*");//发送请求给iframe

		//成功响应的函数
		$('body').one(successEventName,function(){
			if(successMethod){
				successMethod.call(null,arguments[1]);
			}
		});

		//失败响应函数
		$('body').one(errorEventName,function(){
			if(errorMethod){
				errorMethod.call(null,arguments[1]);
			}
		});
	};

	//初始化调用方
	$.ajaxPM.initClient = function(){
		$(window).on('message',function(e){
			var data = e.originalEvent.data;
			$('body').trigger(data.callback,data.result);		
		});
	}

	//初始化中间人页面
	$.ajaxPM.initMiddle = function(){
		$(window).on('message',function(e){
			var options = e.originalEvent.data;
			var successEventName = options.success,errorEventName = options.error;
			options.success = function(){
				var param = {
					callback:successEventName,
					result:Array.prototype.slice.call(arguments,0,1)
				};

				e.originalEvent.source.postMessage(param,"*");
			};
			options.error = function(){
				var param = {
					callback:errorEventName,
					result:Array.prototype.slice.call(arguments,0,1)
				};

				e.originalEvent.source.postMessage(param,"*");
			};

			$.ajax(options);
		});
	}
}(jQuery);
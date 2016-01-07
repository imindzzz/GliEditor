/**
 * 文件上传插件 v1.0.0
 * dependent jquery
 */
;(function($){
	$.extend({
		uploadfile:function(option){
			//合并默认参数
			option = $.extend({
				autoUpload:true,
			},option);
			
			var uploader = option;
			var $iframe ;
			//开始选择文件
			uploader.select = function(){
				if($iframe && $iframe.length != 0){
					$iframe.remove();
					$iframe  == undefined;
				}
				$iframe = buildIframe();
				var idocument =$iframe[0].contentWindow.document;
				var elem = idocument.getElementById("files");
				elem.click();
				
			}
			//提交
			uploader.submit = function(){
				if(!$iframe || $iframe.length == 0){
					alert("系统错误,请重试或联系管理员");
					return false;
				}
				var idocument =$iframe[0].contentWindow.document;
				if( idocument.getElementById("files").value == "" ){
					alert("请选择文件");
					return false;
				}
				var elem = idocument.getElementById("submit");
				elem.click();
				$iframe.remove();
				$iframe  == undefined;
			}
			
			//构建iframe
			function buildIframe(){
				//iframe
				var $iframe = $("<iframe style='display:none;'></iframe>");
				
				//表单
				var $form = $("<form>");
				$form.attr({
					action:option.action,
					method:"post",
					enctype:"multipart/form-data",
				});
				//file选择器
				var $file ;
				if( option.autoUpload ){
					$file = $("<input type='file'  id ='files' name='"+(option.filname || "upfile")+"' onchange='submit.click();'/>");
				}else{
					$file = $("<input type='file'  id ='files' name='"+(option.filname || "upfile")+"'/>");
				}
				$form.append($file);
				
				//提交按钮
				var $submit = $("<input  id ='submit' type='submit'/>");
				$form.append($submit);
				
				//隐藏参数
				//回调方法
				var random = "uploadCallback"+new Date().getTime() + Math.floor(Math.random() *1000000);
	//			eval(random+" = " + option.callback);
				window[random] = option.callback;
				
				var $callback = $("<input type='hidden' id ='callback' name='callback' value='"+random+"'/>");
				$form.append($callback);
				//domain
				var $domain = $("<input type='hidden' id = 'domain' name='domain' value='"+window.location.host+"'/>");
				$form.append($domain);
				
				var code = $form[0].outerHTML;
				code = code.replace(/\"/g,"\\\"");
				code = code.replace(/\'/g,"\\\'");
				code = code.replace(/\>/g,"\\\>");
				code = code.replace(/\</g,"\\\<");
				$iframe.attr("src","javascript:void(function(str){document.open();document.write(str);document.close();})(\""+code+"\")");
				$("body").append($iframe);
				return $iframe;
			}
			//绑定按钮事件
			if(option.selectBtn){
				option.selectBtn.bind("click",function(){
					uploader.select();
				});
			}
			if(option.submitBtn){
				option.submitBtn.bind("click",function(){
					uploader.submit();
				});
			}
			
			return uploader;
		},
	});
})($);



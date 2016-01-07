/**
 * 可拖动特性 v1.1.0
 * 1.0.0 正式发布
 * 1.0.1 添加了默认值
 * 1.0.2 可以选择是否跟随鼠标
 * 1.1.0 兼容了移动浏览器
 * dependent jquery
 */
;(function($){
	$.fn.extend({
		draggable:function(option){
			//合并默认参数
			option = $.extend({
				floow:true,		//是否跟随鼠标，必须是绝对定位
			},option);
			
			$(this).each(function(){
				var elem = this;
				var myevent;//传递给回调方法的事件对象
				
				//只有使用绝对定位的节点才能拖动
//				if( $(elem).css("position") != "absolute"){
//					return ;
//				}
				
				//防止重复创建
				if( $(elem).data("draggable") =="draggable" ){
					return ;
				}else{
					$(elem).data("draggable","draggable");
				}
				
				var firstEvent,beforeEvent;
				function mousedown(event){
					
					//兼容移动浏览器
					if(event.type == "touchstart"){
						event.pageX = event.originalEvent.touches[0].pageX;
						event.pageY = event.originalEvent.touches[0].pageY;
					}
					firstEvent = beforeEvent = event;
					
					myevent = {};
					myevent.elem = elem;
					myevent.travelled = 0;
					
					$(document).bind("mouseup touchend",mouseup);
					$(document).bind("mousemove touchmove",mousemove);
					
					//回调
					if(option.onStart){
						option.onStart(myevent);
					}
				};
				function mouseup(event){
					firstEvent = beforeEvent = undefined;
					$(document).unbind("mouseup touchend",mouseup);
					$(document).unbind("mousemove touchmove",mousemove);
					
					//回调
					if(option.onEnd){
						option.onEnd(myevent);
					}
				};
				function mousemove(event){
					if(firstEvent){
						//兼容移动浏览器
						if(event.type == "touchmove"){
							event.pageX = event.originalEvent.touches[0].pageX;
							event.pageY = event.originalEvent.touches[0].pageY;
						}
						
						//计算
						myevent.travelled++;
						myevent.distanceX = event.pageX - firstEvent.pageX;
						myevent.distanceY = event.pageY - firstEvent.pageY;
						myevent.distance  = Math.sqrt(myevent.distanceX * myevent.distanceX + myevent.distanceY*myevent.distanceY);
						myevent.offsetX = event.pageX - beforeEvent.pageX;
						myevent.offsetY = event.pageY - beforeEvent.pageY;
						
						
						beforeEvent = event;
						
						//跟随鼠标
						if( option.floow && $(elem).css("position")== "absolute" ){
							$(elem).css({
								"top":$(elem).offset().top + myevent.offsetY,
								"left":$(elem).offset().left + myevent.offsetX,
							});
						}
						
						//回调
						if(option.onStep){
							option.onStep(myevent);
						}
					}
				};
				
				$(this).bind("mousedown touchstart",mousedown);
			});
			return this;
		},
	});
})($);

/**
 * 可调节大小特性 v1.1.0
 * 1.0.0 正式发布
 * 1.0.1 添加了默认值
 * 1.1.0 修复了bug
 * dependent jquery jquery.draggable
 */
;(function($){
	$.fn.extend({
		resizable:function(option){
			//合并默认参数
			option = $.extend({
				multi:false,
			},option);
			
			//如果选择器结果有多个
			$(this).each(function(){
				var elem = this;
				var $resizable ;
				
				//如果已经实例化了,则再在实例化
				if(elem.$resizable){
					$resizable = elem.$resizable;
				}else{
					$resizable = $("<div class='resizable'></div>");
					
					//创建拖动点 （只实现了右下角）
					for (var i=0;i<4;i++) {
						var $point = $("<div class='point point-"+i+"'></div>").css("position","absolute");
						//根据方位添加事件处理方法
						switch(i){
							//右下角
							case 3:
								$point.draggable({
									floow:false,
									onStep:function(event){
										$(elem).css({
											"width":$(elem).width() + event.offsetX,
											"height":$(elem).height() + event.offsetY,
										});
										refresh();
									}
								});
							break;
						}
						
						//防止事件传递触发document的click事件
						$resizable.bind("click",function(){
							return false;
						});
						
						$resizable.append($point);
					}
					
					//刷新大小
					function refresh(){
						if(!option.multi){
							$(".resizable").hide();
						}
						$resizable.css({
							'top':$(elem).offset().top-1,
							'left':$(elem).offset().left-1,
							'height':$(elem).height(),
							'width':$(elem).width(),
						});
						$resizable.show();
					}
					
					//单击事件处理方法，显示
					function click(event){
						if( $resizable.css("display")=="none" ){
							refresh();
							$(document).one("click",function(){
								$resizable.hide();
							});
							return false;
						}
					}
					
					//默认隐藏，点击才会显示
					$(elem).bind("click",click);
					$resizable.hide();
					
					$("body").append($resizable);
					elem.$resizable = $resizable;
				}
			})
			return this;
		}
			
	});
})($);

/**
 * 下拉选择组件 v1.0.1
 * 1.0.0 正式发布
 * 1.0.1 添加了默认值
 * dependent jquery
 */
;(function($){
	$.fn.extend({
		select:function(option){
			//合并默认参数
			option = $.extend({
				'items':[{
					'name':"默认名称",
					'value':"default_value",
					'style':"color:red;",
				}],//选项数组
			},option);
			
			var elem = this;
			var items = option.items;
			var callback = option.callback || {};
			
			var $selector;
			//如果之前已经实例化，则显示之前的
			if( elem.selector ){
				$selector = elem.selector;
			}else{
				$selector = $("<div class='select'></div>");
				
				//初始化选项
				for(var i=0;i<items.length;i++){
					var $item = $("<div class='item'></div>");
					$item.html(items[i]['name']);
					$item.data("name",items[i]["name"]);
					$item.data("value",items[i]["value"]);
					
					//添加自定义样式
					if( items[i]['style'] ){
						var styles = items[i]['style'].split(";");
						for(var j=0;j<styles.length;j++){
							$item.css(styles[j].split(":")[0],styles[j].split(":")[1]);
						}
					}
					
					$item.bind("click",function(){
						if(callback.onSelect){
							 callback.onSelect( $(this).data("value") );
						}
						$selector.hide();
					});
					$item.bind("mouseover",function(){
						if(callback.onOver){
							 callback.onOver( $(this).data("value") );
						}
					});
					$selector.append($item);
				}
				
				$("body").append($selector);
			}
			
			//计算位置
			$selector.css({
				'top':$(this).offset().top + $(this).height(),
				'left':$(this).offset().left,
			});
			
			//显示
			$(document).one("click",function(){
				$selector.hide();
				if(callback.onHide){
					 callback.onHide( $(this).data("value") );
				}
			});
			//隐藏其它
			$(".select").hide();
			
			$selector.show();
			if(callback.onShow){
				 callback.onShow( $(this).data("value") );
			}
			
			elem.selector =  $selector;
			return true;
		},
	});
})($);



/**
 * 模态框 v1.0.0
 * 1.0.0 正式发布
 * dependent jquery
 */
;(function($){
	$.extend({
		modal:function(option){
			//合并默认参数
			option = $.extend({
				'height':400,
				'width':400,
				'title':"标题",
				'body':$("内容"), 
				'cancle':true,  //是否可以取消（是否显示关闭和取消按钮）
				'cancleTitle':"取消", //取消按钮文本
				'submitTitle':"确认",//确认按钮文本
				'show':true,// 是默认否显示
			},option);
			
			//取消事件处理方法
			function onCancle(e){
				var event	=  {};
				event.type 	= "cancle",
				event.body 	= $modalBody;
			
				
				if( option.onCancle ){
					option.onCancle( event );
				}
				
				$mask.remove();
				onHide(e);
			}
			
			//确认事件处理方法
			function onSubmit(e){
				var event 	=  {};
				event.type 	= "submit",
				event.body 	= $modalBody;
				
				if( option.onSubmit ){
					if(option.onSubmit( event ) != false){
						$mask.remove();
						onHide(e);
					}
				}
			}
			
			//模态框消失事件处理方法
			function onHide(e){
				var event 	=  {};
				event.type 	= "submit",
				event.boyd 	= $modalBody;
				
				if( option.onHide ){
					option.onHide( event );
				}
			}
			//遮罩和主题窗口
			var $mask = $("<div class='modal-mask'></div>");
			var $modal = $("<div class='modal'></div>");
			$modal.css({
				"max-height":option.height,
				"max-width":option.width,
			})
			
			//标题
			var $modalTitle 	= $("<div class='modal-title'><span class='title'>"+option.title+"</span></div>");
			if( option.cancle ){ 
				var $close = $("<span class='close'>X</span>");
				$close.bind("click",onCancle);
				$modalTitle.append( $close );
			}
			
			//内容
			var $modalBody =$("<div class='modal-body'></div>");
			$modalBody.css({
				"max-height":option.height-50,
			})
//			$modalBody.html( option.body );
			$modalBody.append( option.body );
			
			//页脚
			var $modalFooter 	= $("<div class='modal-footer'></div>");
			var $submit 		= $("<div class='modal-button modal-submit'><span>"+option.submitTitle+"</span></div>");
			$submit.bind("click",onSubmit);
			$modalFooter.append( $submit );
			//如果允许取消/关闭
			if( option.cancle ){
				var $cancle 	=  $("<div class='modal-button modal-cancle'><span>"+option.cancleTitle+"</span></div>");
				$cancle.bind("click",onCancle);
				$modalFooter.append( $cancle );
			}
			
			$modal.append( $modalTitle );
			$modal.append( $modalBody );
			$modal.append( $modalFooter );
			$mask.append( $modal );
			
			if( option.show ){
				$mask.show();
			}else{
				$mask.hide();
			}
			
			$("body").append( $mask );
			return $mask;
		},
	});
})($);

/**
 * 颜色选择器
 * 1.0.0 正式发布
 */
;
(function($) {

	window.colorPicker = function(option) {
		return new colorPicker.fn.init(option);
	}

	colorPicker.fn = colorPicker.prototype = {
		'init': function(option) {
			var config = $.extend(colorPicker.config, option); //合并默认参数
			this.config = config;

			var picker = this;
			var $colorPicker = $(colorPicker.htmlTemplates);
			picker.$colorPicker = $colorPicker;
			$colorPicker.bind("click",function(){
				return false
			});

			//调节饱和度和亮度
			var $sv = $colorPicker.find(".sv");

			function onsvmove(event) {
				var top = event.pageY - $sv.find(".value").offset().top;
				if (top < 0) {
					top = 0;
				}
				if (top > $sv.find(".value").height() -10) {
					top = $sv.find(".value").height() -10;
				}
				$sv.find(".point").css("top", top);

				var left = event.pageX - $sv.find(".value").offset().left;
				if (left < 0) {
					left = 0;
				}
				if (left > $sv.find(".value").width() -10) {
					left = $sv.find(".value").width() -10;
				}
				$sv.find(".point").css("left", left);

				picker.refresh('hsv');
			}
			$sv.find(".value,.point").bind("mousedown", function(event) {
				onsvmove(event);
				$(document).bind("mousemove", onsvmove);
				$(document).bind("mouseup", function() {
					$(document).unbind("mousemove", onsvmove);
				});
			});
			
			//色相调节区
			var $h = $colorPicker.find(".h");

			function onhmove(event) {
				var top = event.pageY - $h.find(".value").offset().top;
				if (top < 0) {
					top = 0;
				}
				if (top > $h.find(".value").height() -1) {
					top = $h.find(".value").height() -1;
				}
				$h.find(".point").css("top", top);
				picker.refresh('hsv');
			}
			$h.find(".value,.point").bind("mousedown", function(event) {
				onhmove(event);
				$(document).bind("mousemove", onhmove);
				$(document).bind("mouseup", function() {
					$(document).unbind("mousemove", onhmove);
				});
			});

			
			//透明度调节区
			var $alpha = $colorPicker.find(".alpha");

			function onalphamove(event) {
				var top = event.pageY - $alpha.find(".value").offset().top;
				if (top < 0) {
					top = 0;
				}
				if (top > $alpha.find(".value").height() -1) {
					top = $alpha.find(".value").height() -1;
				}
				$alpha.find(".point").css("top", top);
				picker.refresh('alpha');
			}
			$alpha.find(".value,.point").bind("mousedown", function(event) {
				onalphamove(event);
				$(document).bind("mousemove", onalphamove);
				$(document).bind("mouseup", function() {
					$(document).unbind("mousemove", onalphamove);
				});
			});

			//调节值显示区			
			$colorPicker.children(".value").find("input").bind("change",function(){
				picker.refresh( this.name );			
			});
			//添加到页面
			$("body").append($colorPicker);
			
			//显示
			if( config.show ){
				picker.show();
			}
			return picker;
		},
		/**
		 * 刷新页面
		 * type 发生改变的位置,
		 */
		'refresh': function(type) {
			type = type || "hsv";  
			var picker = this;
			var h,s,v
			var rgb ;
			var hex;
			var alpha = ( picker.$colorPicker.find(".alpha").find(".point").offset().top - picker.$colorPicker.find(".alpha").offset().top ) /180 ;
			
			switch (type) {
				case "hsv":
					h = ( picker.$colorPicker.find(".h").find(".point").offset().top - picker.$colorPicker.find(".h").offset().top )* 2,
					s = ( picker.$colorPicker.find(".sv").find(".point").offset().left - picker.$colorPicker.find(".sv").offset().left ) / 180,
					v = 1 - ( picker.$colorPicker.find(".sv").find(".point").offset().top - picker.$colorPicker.find(".sv").offset().top ) / 180;
				break;
				case "h":
					h =  Number.parseFloat( picker.$colorPicker.children(".value").find("input[name='h']").val() );
					h = isNaN(h) ? picker.$colorPicker.children(".value").find("input[name='h']").data("value") : h;
					s = ( picker.$colorPicker.find(".sv").find(".point").offset().left - picker.$colorPicker.find(".sv").offset().left ) / 180,
					v = 1 - ( picker.$colorPicker.find(".sv").find(".point").offset().top - picker.$colorPicker.find(".sv").offset().top ) / 180;
				break;
				case "s":
					h = ( picker.$colorPicker.find(".h").find(".point").offset().top - picker.$colorPicker.find(".h").offset().top )* 2,
					s =  Number.parseFloat( picker.$colorPicker.children(".value").find("input[name='s']").val() );
					s = isNaN(s) ? picker.$colorPicker.children(".value").find("input[name='s']").data("value") : s;
					v = 1 - ( picker.$colorPicker.find(".sv").find(".point").offset().top - picker.$colorPicker.find(".sv").offset().top ) / 180;
				break;
				case "v":
					h = ( picker.$colorPicker.find(".h").find(".point").offset().top - picker.$colorPicker.find(".h").offset().top )* 2,
					s = ( picker.$colorPicker.find(".sv").find(".point").offset().left - picker.$colorPicker.find(".sv").offset().left ) / 180,
					v =  Number.parseFloat( picker.$colorPicker.children(".value").find("input[name='v']").val() );
					v = isNaN(v) ? picker.$colorPicker.children(".value").find("input[name='v']").data("value") : v;
				break;
				case "rgb":
					var match = picker.$colorPicker.children(".value").find("input[name='rgb']").val().match(/[0-9]+/g) || [];
					rgb 	= {
						r:Number.parseInt( match[0] ),
						g:Number.parseInt( match[1] ),
						b:Number.parseInt( match[2] ),
					};
					if( rgb.r>255 || rgb.r<0 || rgb.g>255 || rgb.g<0 || rgb.b>255 || rgb.b<0 ){
						rgb = picker.$colorPicker.children(".value").find("input[name='rgb']").data("value");
					}
					var hsv = colorPicker.rgb2hsv( rgb );
					h = hsv.h;
					s = hsv.s;
					v = hsv.v;
				break;
				case "hex":
					var rgb = colorPicker.hex2rgb(  picker.$colorPicker.children(".value").find("input[name='hex']").data('value') );
					var hsv = colorPicker.rgb2hsv(  rgb );
					h = hsv.h;
					s = hsv.s;
					v = hsv.v;
				break;
				default:
					h = ( picker.$colorPicker.find(".h").find(".point").offset().top - picker.$colorPicker.find(".h").offset().top )* 2,
					s = ( picker.$colorPicker.find(".sv").find(".point").offset().left - picker.$colorPicker.find(".sv").offset().left ) / 180,
					v = 1 - ( picker.$colorPicker.find(".sv").find(".point").offset().top - picker.$colorPicker.find(".sv").offset().top ) / 180;
				break;
			}
			
			//微调精度,限定值域
			h = h>=358?360:h;
			s = s>=0.94?1:s;
			v = v>=0.94?1:v;
			alpha = alpha>=0.99?1:alpha;
			h = h<0?0:h
			s = s<0?0:s
			v = v<0?0:v			
			
			rgb = rgb?rgb:colorPicker.hsv2rgb({h:h,s:s,v:v});
			hex = hex?hex:colorPicker.rgb2hex(rgb);
			
			//设置显示区域
			picker.$colorPicker.find(".h").find(".point").css("top", (h==360?358:h)/2);
			picker.$colorPicker.find(".sv").css("background-color","rgb("+colorPicker.hsv2rgb({h:h,s:1,v:1}).rgb+")");
			picker.$colorPicker.find(".sv").find(".point").css({
				top: (1-v>=0.94?0.94:1-v)*180,
				left: (s==1?0.94:s)*180,
			});
			
			picker.$colorPicker.children(".value").find("input[name='h']").val(Math.floor(h)).data('value', h);
			picker.$colorPicker.children(".value").find("input[name='s']").val(s.toFixed(2)).data('value', s);
			picker.$colorPicker.children(".value").find("input[name='v']").val(v.toFixed(2)).data('value', v);
			if( alpha >= 0 && alpha < 1){
				picker.$colorPicker.children(".value").find("input[name='rgb']").val("rgba("+rgb.r+","+rgb.g+","+rgb.b+","+alpha.toFixed(1)+")").data('value', rgb);
			}else{
				picker.$colorPicker.children(".value").find("input[name='rgb']").val("rgb("+rgb.r+","+rgb.g+","+rgb.b+")").data('value', rgb);
			}
			
			picker.$colorPicker.children(".value").find("input[name='hex']").val("#"+hex).data('value', hex);
			
			
			//
			if( picker.config.onChange ){
				picker.config.onChange ({
					rgb : picker.$colorPicker.children(".value").find("input[name='rgb']").val(),
					hex : picker.$colorPicker.children(".value").find("input[name='hex']").val(),
				})
			}
		},
		'show': function() {
			//隐藏其它选择器
			
			$(".colorpicker").hide(300);
			if( this.config.dom ){
				this.$colorPicker.css({
					'top':$(this.config.dom).offset().top + $(this.config.dom).height() + 10,
					'left':$(this.config.dom).offset().left , 
				});
			}
			this.$colorPicker.show(300);
		},
		'hide': function() {
			this.$colorPicker.hide(300);
		},
	};
	colorPicker.fn.init.prototype	= colorPicker.fn;
	
	//Html代码模板
	colorPicker.htmlTemplates = "<div class='colorpicker'>" 
		+ "<div class='sv'>" + "<div class='value'></div>"+ "<div class='point'></div>" + "</div>" 
		+ "<div class='h'>" + "<div class='value'></div>"+ "<div class='point'></div>" + "</div>" 
		+ "<div class='alpha'>" + "<div class='value'></div>"+ "<div class='point'></div>" + "</div>"
		+ "<div class='value'>" 
			+ "<label>RGB:</label><input name='rgb'></input><br />" 
			+ "<label>HEX:</label><input name='hex'></input><br />" 
			+ "<label>H:</label><input name='h' ></input><br />" 
			+ "<label>S:</label><input name='s' ></input><br />" 
			+ "<label>V:</label><input name='v' '></input>" 
		+ "</div>"
		+ "<div style='clear: both;'></div>"
	+ "</div>";
	
	//配置
	colorPicker.config = {
		history: 'false', //TODO 增加选择历史记录
		show:false,
	};

	//工具方法
	colorPicker.rgb2hsv = function(rgb) { // faster
		var r = rgb.r /255,
			g = rgb.g / 255,
			b = rgb.b /255;
		var h, s, v;

		max = Math.max(r,g,b);
		min = Math.min(r,g,b);

		v = max;

		if (v != 0) {
			s = 1 - (min/max);
		} else {
			s = 0;
		}

		if (max == min) {
			h = 0;
		}
		if (max == g) {
			h = 60 * ( (b-r) / (max-min) ) + 120;
		}
		if (max == b) {
			h = 60 * ( (r-g) / (max-min) ) + 240;
		}
		if (max == r) {
			if (g >= b) {
				h = 60 * ( (g-b) / (max-min) ) + 0;
			} else {
				h = 60 * ( (g-b) / (max-min) ) + 360;
			}
		}

		return {
			h: h,
			s: s,
			v: v,
		};
	};
	colorPicker.hsv2rgb = function(hsv) {
		var h = hsv.h,
			s = hsv.s,
			v = hsv.v;
		h = h>=360?0:h;
		
		var mod = Math.floor(Math.abs(h / 60)) % 6,
			f = (h / 60) - mod,
			p = v * (1 - s),
			q = v * (1 - f * s),
			t = v * (1 - (1 - f) * s);

		var rgb = {
			r: Math.floor( [v, q, p, p, t, v][mod] *255 ),
			g: Math.floor( [t, v, v, q, p, p][mod] *255 ),
			b: Math.floor( [p, p, t, v, v, q][mod] *255 )
		};
		rgb.rgb =  rgb.r +","+rgb.g +","+rgb.b;
		return rgb;
	};
	colorPicker.rgb2hex = function(rgb) {
		return (
			(rgb.r < 16 ? '0' : '') + rgb.r.toString(16) +
			(rgb.g < 16 ? '0' : '') + rgb.g.toString(16) +
			(rgb.b < 16 ? '0' : '') + rgb.b.toString(16)
		).toUpperCase();
	};

	colorPicker.hex2rgb = function(hex) {
		hex = hex.split(''); // IE7
		return {
			r: parseInt(hex[0] + hex[hex[3] ? 1 : 0], 16) / 255,
			g: parseInt(hex[hex[3] ? 2 : 1] + (hex[3] || hex[1]), 16) / 255,
			b: parseInt((hex[4] || hex[2]) + (hex[5] || hex[2]), 16) / 255
		};
	};
	
	
	//封装到Jquery 
	$.fn.extend({
		colorPicker: function(option) {
			$(this).each(function(index){
				if(index != 0) return ; //只显示一个
				var elem = this ;
				var Picker ;
				if( elem.colorPicker ){
					Picker = elem.colorPicker;
				}else{
					//初始化
					option.dom = elem;
					Picker = new colorPicker( option );
					$(elem).bind("click",function(){
						Picker.show();
						return false;
					});
					$(document).bind("click",function(){
						Picker.hide();
					});
					elem.colorPicker = Picker;
				}
			});
			return this;
		},
	});

})($);
/**
 * 资源编辑器 v1.4.1
 * 1.0.0 基础功能已经实现
 * 1.1.0 新增了字体/字号/对齐方式功能(引入了 jquery.select)
 * 1.2.0 新增图片缩放功能(引入了jquery.draggable jquery.resizable)
 * 1.3.0 优化了代码逻辑(实现了选区状态存取)
 * 1.4.0 新增插入图片功能(引入了jquery.modal),异体字功能按钮已经添加但功能未实现
 * 1.4.1 添加了工具方法 verifiPage (为实现监控page数据变化时校验合法性做准备)
 * 1.5.0 新增字体颜色(前景色背景色)调整功能(引入了 jquery.colorPicker)
 * 1.5.1 每个page支持快捷键, Enter 新建一页(text)
 * 1.6.0 添加了事件监听机制,通过事件回调实时检测Page合法性
 * 1.6.1 实现了异体字插入功能(需要异体字css的支持)
 * 1.7.0 新增文件上传功能
 * dependent jquery jquery.select jquery.draggable jquery.resizable jquery.modal jquery.colorPicker font-awesome.css
 */
;(function($){
		window.GliEditor = function(option){
//			GliEditor.
			if(option.parent.editor){
				return option.parent.editor;
			}
			return new GliEditor.fn.init(option);
		}
		
		GliEditor.fn=GliEditor.prototype = {
			'init':function(option){
				
				//合并默认配置参数
				var config = $.extend(GliEditor.config,option); 
				this.config = config;
				
				//合并事件监听器
				this.Event = GliEditor.Event;
				
				var editor = this;
				
				//初始化编辑容器
				editor.$container = $( GliEditor.htmlTemplates.container ).css({
					"max-width":config.width,
				});
				editor.$parent = $( config.parent );
				
				//初始化菜单
				editor.$menu = $( GliEditor.htmlTemplates.menu );
				for(var i=0;i<config.menu.length;i++){
					
					var $menuGroup = $( GliEditor.htmlTemplates.menuGroup );
					for(var j=0;j<config.menu[i].length;j++){
						
						var menuItem	= GliEditor.menu[config.menu[i][j]];
						if(menuItem){
							var $menuItem = $( GliEditor.htmlTemplates.menuItem );
							$menuItem.attr("title",menuItem['title']);
							for(var k=0;k<menuItem['icon'].length;k++){
								$icon = $( GliEditor.htmlTemplates.menuItemIcon );
								$icon.addClass(menuItem['icon'][k]);
								$menuItem.append($icon);
							}
							$menuItem.bind("click",{
								'menuName':config.menu[i][j],
								'editor':editor,
							},editor.execMenu);
							$menuGroup.append( $menuItem );
						}
						
					}
					editor.$menu.append( $menuGroup );
					
				}
				
				editor.$menu.append( $(GliEditor.htmlTemplates.clear) ) //清除浮动
				
				//初始化编辑区域
				editor.$editor = $( GliEditor.htmlTemplates.editor );
				editor.$editor.css({
					height:config.height,
				})
				//循环添加Page
				for(var i=0;i<config.pages.length;i++){
					editor.addPage(config.pages[i]);
				}
				
				
				//在编辑区按下鼠标,开启选区记录
				editor.$editor.bind("mousedown",function(event){
					if( $.contains(this,$(event.srcElement).closest('.ge-editor-page')[0]) ){
						editor.START_RANGE_RECORD = true;
					}
				});
				//鼠标抬起记录选区
				$(document).bind("mouseup",function(event){
					if(editor.START_RANGE_RECORD){
						editor.START_RANGE_RECORD = false;
						editor.saveRange();
					}
				});
				
				//添加 PageChange 事件处理函数,校验Page合法性
				editor.addEventListener("onPageChange",function(event){
					var $page = $(event.page);
					if( !GliEditor.verifiPage($page)){
						$page.html( $page.data("beforeHtml"));	
					}
				});
				
				//把菜单和编辑区域加入容器
				editor.$container.append( editor.$menu );
				editor.$container.append( editor.$editor );
				
				//把容器加入页面
				editor.$parent.append( editor.$container );
//				editor.$parent.hide();
				
				//确保点击菜单项时,编辑区域不会失去选择区域
				//已存储选择区域相关信息,失去焦点也可以恢复
				editor.$menu.bind('mousedown mouseup',function(){
						return false;
				});

				editor.$parent[0].editor = editor;
				return editor;
			},
			/**
			 * 获取或者设置(清空之前的页)编辑器页
			 * @param   pages
			 *			[{type,html}]  页数组,可选
			 */
			'html':function(pages){
				var editor = this;
				if(pages!= undefined){
					editor.$editor.html("");
					for(var i=0;i<pages.length;i++){
						editor.addPage(pages[i]);
					}
					
				}else{
					return editor.getPage( editor.$editor.find(".ge-editor-page") );
				}
			},
			'remove':function(){
				var editor = this;
				editor.$parent[0].editor = undefined;
				editor.$container.remove();
			},
			/**
			 * 添加页
			 * @param   page
			 *			dom  页对象,必选
			 * @param   after
			 *			dom  插入到某页后面 
			 */
			'addPage':function(page,after){
				var editor = this;
				var $editorPage = $( GliEditor.htmlTemplates.editorPage );
				
				//构件page
				$editorPage.data("type",page['type']);
				$editorPage.data("id",page['id']);
				$editorPage.html(page['html']);
				$editorPage.addClass(page['type']);
				$editorPage.data('ext',page['ext']);
				$editorPage.data("beforeHtml",$editorPage.html()); // 保存html 如果数据不合法可以回滚
				$editorPage.find("img").resizable();  //TOOD 如果有图片,可调整大小,但如果是IE,会有自带的调整框,需要移除
				
				//判断是否支持多页
				if( editor.config.multi == false && editor.$editor.find(".ge-editor-page").length >= 1){
					return false;
				}
				//判断是否支持的类型
				for(var i = 0;i<editor.config.support.length;i++){
					if( editor.config.support[i] == page.type){
						break;
					}
					if( editor.config.support[i] != page.type && i == editor.config.support.length-1){
						return false;
					}
				}
				//判断数据是否合法
				if( !GliEditor.verifiPage($editorPage) ){ 
					return false;
				}
				
				//注册快捷键
				$editorPage.bind("keydown",function(event){
					var range = editor.currentRange();
					
					//光标在头部时按删除键则删除此页
					if( event.which == 8 && range.startOffset == 0 && range.endOffset == 0){
						var page = editor.getPage($(this));
						if(page[0].type == "text" && editor.$editor.find(".ge-editor-page.text").length == 1){
							return false;
						}
						$(this).remove();
						editor.doEventListener('onPageDelete',{
							page:page,
						});
						return false;
					}
					//Enter 新建空白页,  shiftKey + Enter  换行
					if( event.which == 13 && event.shiftKey == false){
						editor.addPage({
							"type":"text", //仅支持新建文本
							"html":"",
						},this);
						return false;
					}
				});
				
				//监控页面数据改变
				$editorPage.bind("keyup mouseup",function(event){
					if($(this).html() !=  $(this).data("beforeHtml")){
						editor.doEventListener('onPageChange');
					}
				});
				
				
				//插入到页面
				if( after ){ //插入到'after'之后
					$(after).after($editorPage);
				}else{
					this.$editor.append($editorPage);
				}
				
				editor.doEventListener('onPageCreate');
				return true;
			},
			/**
			 * 将dom节点转换为可存储对象
			 * @param	$elem
			 * 			Object jquery对象
			 */
			'getPage':function($elme){
				var data = [];
				if($elme){
					$elme.each(function(index){
						var obj = {
							'id':$(this).data("id"),
							'type':$(this).data("type"),
							'index':index,
							'ext':$(this).data("ext"),
							'html':this.innerHTML,
						};
						
						switch( $(this).data("type") ){
							case "text":
								obj.content  = obj.html.replace(/<[^>].*?>/g,"");
							break;
							case "img":
								obj.content  = obj.ext ? obj.ext.img_url:obj.html; 
							break;
						}
						
						data.push(obj);
					});
				}
				return data;
			},
			/**
			 * 替换页
			 * @param	PageSrc
			 * 			Object 要替换的属性对象
			 * @param	dest 
			 * 			Object jquery对象,被替换的Page
			 */
			'replacePage':function(pageSrc,dest){
				var editor = this;
				var pageDest = editor.getPage(dest)[0];
				pageDest = $.extend(true, pageDest, pageSrc);
				
				if(editor.config.multi){
					editor.addPage(pageDest,dest);
					dest.remove();
				}else{
					dest.remove();
					editor.addPage(pageDest);
				}
			},
			/**
			 * 添加事件处理器
			 * @param   type
			 *			String 必须是在Event列出的支持的事件
			 * @param   callback
			 *			Function 事件回调方法
			 */
			'addEventListener':function(type,callback){
				var editor = this;
				if( editor.Event[type] ){
					editor.Event[type].push(callback);
				}
			},
			/**
			 * 执行事件处理器
			 * @param   type
			 *			String 必须是在Event列出的支持的事件
			 * @param   event
			 *			Object 事件回调参数
			 */
			'doEventListener':function(type,event){
				var editor = this;
				event = $.extend({
					editor:editor,
					type:type,
				},event);
				
				var range = editor.currentRange();
				//如果没有传递Page,获取当前光标所在Page的数据
				if(range && !event.page ){
					var $page = $(range.commonAncestorContainer).closest(".ge-editor-page");
					event.page = editor.getPage($page);
				}
				
				if( editor.Event[type] ){
					var callbacks = editor.Event[type];
					for(var i = 0;i < callbacks.length; i++){
						callbacks[i](event);
					}
				}
			},
			/**
			 * 菜单项点击事件处理方法
			 */
			'execMenu':function(event){
				var data =event.data;
				var menuItem = GliEditor.menu[data['menuName']];
				
				event.data.that = this;
				event.data.menuItem = menuItem;
				
				if( !data.editor.restoreRange() && menuItem['needRange']){
					alert("需要选中区域");
					return false;
				}
				
				if(menuItem.callback){
					menuItem.callback(event);
				}
				return false;
			},
			/**
			 * 设置或读取选中区
			 */
			'currentRange':function(cr){
				if(cr != undefined ){
		            this.currentRangeData = cr;
		        }else{
		            return this.currentRangeData;
		        }
			},
			/**
			 * 获取并保存选中区
			 */
			'saveRange':function(){
				var selection,range,_parentElem;
				if(document.getSelection){
					selection = document.getSelection();
					//保证有选中区
	                if (selection.getRangeAt && selection.rangeCount) {
	                    range = document.getSelection().getRangeAt(0);
	                    _parentElem = range.commonAncestorContainer;
	                }
				}else{
					//IE
					range = document.selection.createRange();
					 _parentElem = range.parentElement();
				}
				//判定选中区是否在编辑器内
//				if( $.contains(this.$editor[0],_parentElem) ||  this.$editor[0] === _parentElem){
				if( this.$editor[0] == $(_parentElem).closest(".ge-editor")[0] ){
					this.currentRange(range);
				}else{
					this.currentRange(null);
				}
			},
			/**
			 * 恢复选中区
			 */
			'restoreRange':function(){
				var currentRangeData = this.currentRange();
				if( !currentRangeData ){
					return false;
				}
				if(document.getSelection){
		            selection = document.getSelection();
		            selection.removeAllRanges();
		            selection.addRange(currentRangeData);
				}else{
					//IE
					var range = document.selection.createRange();
		            range.setEndPoint('EndToEnd', currentRangeData);
		            if(currentRangeData.text.length === 0){
		                range.collapse(false);
		            }else{
		                range.setEndPoint('StartToStart', currentRangeData);
		            }
		            range.select();
				}
				
				return true;
			},
		};
		
		//模板代码
		GliEditor.htmlTemplates = {
			'container':"<div class='ge-container'></div>",
			'menu':"<div class='ge-menu'></div>",
			'menuGroup':"<div class='ge-menu-group'></div>",
			'menuItem':"<div class='ge-menu-item'></div>",
			'menuItemIcon':'<span></span>',
			'editor':"<div class='ge-editor'></div>",
			'editorPage':"<div class='ge-editor-page' contenteditable='true'></div>",
			'clear':'<div style="clear:both"></div>',
			'insertImage':"<div class='ge-insertImage'>"
							+"<div class='line'><span>图片：</span><input type='text'  name='src' placeholder='http://baidu.com/loge.png'/><input name='selector' type='button' value='选择文件' /></div>"
							+"<div class='line'><span>标题：</span><input  name='title'/></div>"
							+"<div class='line'><span>高度：</span><input  name='height' style='width: 70px;'/></div>"
							+"<div class='line'><span>宽度：</span><input  name='width' style='width: 70px;'/></div>",
							
			'insertVariant':"<div class='ge-insertVariant'></div>"
		}
		
		//菜单配置和实现
		GliEditor.menu = {
			'viewSourceCode':{
				'title':"源代码",
				'icon':['fa fa-code'],
				'callback':function(event){
					var editor = event.data.editor;
					//TODO 显示源码
				},
			},
			'bold':{
				'title':"粗体",
				'needRange':true,
				'icon':['fa fa-bold'],
				'callback':function(event){
					var editor = event.data.editor;
					document.execCommand("bold",false);
					editor.saveRange();
				},
			},
			'underline':{
				'title':"下划线",
				'needRange':true,
				'icon':['fa fa-underline'],
				'callback':function(event){
					var editor = event.data.editor;
					document.execCommand("underline",false);
					editor.saveRange();
				},
			},
			'italic':{
				'title':"斜体",
				'icon':['fa fa-italic'],
				'callback':function(event){
					var editor = event.data.editor;
					document.execCommand("italic",false);
					editor.saveRange();
				},
			},
			'strikethrough':{
				'title':"删除线",
				'needRange':true,
				'icon':['fa fa-strikethrough'],
				'callback':function(event){
					var editor = event.data.editor;
					document.execCommand("strikethrough",false);
					editor.saveRange();
				},
			},
			'forecolor':{
				'title':"字体颜色",
				'needRange':true,
				'icon':['fa fa-circle-o','fa fa-angle-down'],
				'callback':function(event){
					var editor = event.data.editor;
					var option = {
						'items':[],
						'callback':{
							'onShow':function(value){
							},
							'onSelect':function(value){
								editor.restoreRange();
								document.execCommand("foreColor",false,value);
								editor.saveRange();
							},
							'onHide':function(value){
								editor.restoreRange();
							}
						},
					};
					
					var items = ["#595757","#FFFFFF","#FF1600","#C9CACA","#1024EE"];
					for (var i=0;i<items.length;i++) {
						option.items.push({
							'name':items[i],
							'value':items[i],
							'style':"color:"+items[i]+";",
						});
					}
					$(event.data.that).select(option);
				},
			},
			'backcolor':{
				'title':"背景颜色",
				'needRange':true,
				'icon':['fa fa-circle','fa fa-angle-down'],
				'callback':function(event){
					var editor = event.data.editor;
					var option = {
						'items':[],
						'callback':{
							'onShow':function(value){
							},
							'onSelect':function(value){
								editor.restoreRange();
								document.execCommand("backColor",false,value);
								editor.saveRange();
							},
							'onHide':function(value){
								editor.restoreRange();
							}
						},
					};
					
					var items = ["#595757","#FFFFFF","#C3FFF0","#FEE2F4","#1024EE"];
					for (var i=0;i<items.length;i++) {
						option.items.push({
							'name':items[i],
							'value':items[i],
							'style':"background-color:"+items[i]+";",
						});
					}
					$(event.data.that).select(option);
				},
			},
			'fontSize':{
				'title':"字号",
				'needRange':true,
				'icon':['fa fa-header','fa fa-angle-down'],
				'callback':function(event){
					var editor = event.data.editor;
					var option = {
						'items':[],
						'callback':{
							'onShow':function(value){
							},
							'onSelect':function(value){
								editor.restoreRange();
								document.execCommand("fontSize",false,value);
								editor.saveRange();
							},
							'onHide':function(value){
								editor.restoreRange();
							}
						},
					};
					
					var items = [1,2,3,4,5,6];
					for (var i=0;i<items.length;i++) {
						option.items.push({
							'name':"H"+(i+1),
							'value':items[i],
						});
					}
					$(event.data.that).select(option);
				},
			},
			'fontFamily':{
				'title':"字体",
				'needRange':true,
				'icon':['fa fa-font','fa fa-angle-down'],
				'callback':function(event){
					var editor = event.data.editor;
					var option = {
						'items':[],
						'callback':{
							'onShow':function(value){
							},
							'onSelect':function(value){
								editor.restoreRange();
								document.execCommand("FontName",false,value);
								editor.saveRange();
							},
							'onHide':function(value){
								editor.restoreRange();
							}
						},
					};
					
					var items = ["宋体","黑体","微软雅黑","cursive"];
					for (var i=0;i<items.length;i++) {
						option.items.push({
							'name':items[i],
							'value':items[i],
//							'style':"font-family:"+items[i]+";",
						});
					}
					$(event.data.that).select(option);
				},
			},
			'justify':{
				'title':"对齐方式",
				'needRange':true,
				'icon':['fa fa-align-left','fa fa-angle-down'],
				'callback':function(event){
					var editor = event.data.editor;
					var option = {
						'items':[],
						'callback':{
							'onShow':function(value){
							},
							'onSelect':function(value){
								editor.restoreRange();
								document.execCommand(value);
								editor.saveRange();
							},
							'onHide':function(value){
								editor.restoreRange();
							}
						},
					};
					
					var names = ["左对齐","居中","右对齐"];
					var values = ["JustifyLeft","JustifyCenter","JustifyRight"];
					for (var i=0;i<names.length;i++) {
						option.items.push({
							'name':names[i],
							'value':values[i],
//							'style':"font-family:"+items[i]+";",
						});
					}
					$(event.data.that).select(option);
				},
			},
			'insertImage':{
				'title':"插入图片",
				'icon':['fa fa-image'],
				'callback':function(event){
					var editor		= event.data.editor;
					var $innerBody 		= $(GliEditor.htmlTemplates.insertImage);
					$.uploadfile({
						action:editor.config.upload,
						selectBtn:$innerBody.find("input[name='selector']"),
						callback:function(json){
							$innerBody.find("input[name='src']").val(json.src).show(); 
							$innerBody.find("input[name='selector']").hide(); 
							$innerBody.find("input[name='title']").val(json.title);
							$innerBody.find("input[name='height']").val(json.height);
							$innerBody.find("input[name='width']").val(json.width);
							$innerBody.data("ext",json);
						},
					});
					$.modal({
//						'height':400px",
						'width':310,
						'title':event.data.menuItem['title'],
						'body':$innerBody,
						'onSubmit':function(mevent){
							var src 	= $innerBody.find("input[name='src']").val(); 
							
							var height 	= $innerBody.find("input[name='height']").val();
							var width 	= $innerBody.find("input[name='width']").val();
							var title 	= $innerBody.find("input[name='title']").val();
							
							//检查地址合法性
//							var reg_src = new RegExp('[a-zA-z]+://[^\s]*');
//							if( !reg_src.test(src) ){
//								alert("请输入正确的地址");
//								return ;
//							}
							
							var range = editor.currentRange();
							var after = range?$(range.commonAncestorContainer).closest(".ge-editor-page"):undefined;
							var page = editor.getPage(after);
							
							if(page.length && page[0].type=='img' && confirm("确认替换?")){
								editor.replacePage({
									type:"img",
									html:"<img src='"+src+"' height='"+height+"' width='"+width+"' tiltle='"+title+"'/>",
									ext:$innerBody.data("ext"),
								},after);
							}else{
								editor.addPage({
									type:"img",
									html:"<img src='"+src+"' height='"+height+"' width='"+width+"' tiltle='"+title+"'/>",
									ext:$innerBody.data('ext'),
								},after);
							}
						},
						'onHide':function(){
							editor.restoreRange();
						}
					});
				}
			},
			'insertVariant':{
				'title':"插入异体字",
				'icon':['fa fa-gg'],
				'callback':function(event){
					var editor		= event.data.editor;
					var range 		= editor.currentRange();
					var select 		= range?range.toString():"";
					if(select.length != 1){
						alert("请选中一个字!");
						return false;
					}
					$.ajax({
						type:"get",
						url:editor.config.variant,
						data:{
							variant:encodeURIComponent(select),
						},
						dataType:"JSONP",
						success:function(json){
							if(json && json.length != 0){
								var $body = $(GliEditor.htmlTemplates.insertVariant);
								for(var i =0;i<json.length;i++){
									var $font  = $("<font face='"+json[i]+"'>"+select+"</font>");
									$font.bind("click",function(){
										$this = $(this);
										$this.closest(".ge-insertVariant").find("font").removeClass("selected");
										$this.addClass("selected");
									});
									$body.append($font);
								}
								$.modal({
			//						'height':400px",
									'width':310,
									'title':event.data.menuItem['title'],
									'body':$body,
									'onSubmit':function(mevent){
										var $body = mevent.body;
										var $font = $body.find("font.selected");
										editor.restoreRange();
										document.execCommand("FontName",false,$font.attr("face"));
										editor.saveRange();
									},
									'onHide':function(){
										editor.restoreRange();
									}
								});
							}else{
								alert("未找到异体字!");
							}
						},
						async:true
					});
					
					
				}
			},
			'delete':{
				'title':"删除",
				'needRange':true,
				'icon':['fa fa-close'],
				'callback':function(event){
					var editor		= event.data.editor;
					var range = editor.currentRange();
					var page = range?$(range.commonAncestorContainer).closest(".ge-editor-page"):undefined;
					if(page.hasClass("text") && editor.$editor.find(".ge-editor-page.text").length == 1){
						return false;
					}
					if(confirm("是否删除此页?")){
						$(page).remove();
					}
				},
			},
			'moveup':{
				'title':"上移",
				'needRange':true,
				'icon':['fa fa-arrow-up'],
				'callback':function(event){
					var editor		= event.data.editor;
					var range = editor.currentRange();
					var $page = range?$(range.commonAncestorContainer).closest(".ge-editor-page"):undefined;
					var $before = $page.prev();
					$before.insertAfter($page);
			},
			},
			'movedown':{
				'title':"下移",
				'needRange':true,
				'icon':['fa fa-arrow-down'],
				'callback':function(event){
					var editor		= event.data.editor;
					var range = editor.currentRange();
					var $page = range?$(range.commonAncestorContainer).closest(".ge-editor-page"):undefined;
					var $after = $page.next();
					$after.insertBefore($page);
				},
			},
		}
		
		//默认配置
		GliEditor.config = {
//			lang:"zh-ch",
			'upload':'/ajax/ajax_edit_content2.php?act=pic_upload',  //文件上传地址  		 //TODO 使用jquery.uploadify实现
			'variant':'http://wk1.ak.kf.gli.cn/ajax/ajax_edit_content2.php?act=variant', //获取异体字地址(JSONP)
			'menu':[
//			    ['viewSourceCode'],
			    ['bold', 'underline', 'italic', 'foreColor', 'backgroundColor', 'strikethrough','forecolor','backcolor'],
			    ['fontFamily', 'fontSize', 'justify'],
//			    ['createLink', 'unLink', 'insertTable', 'insertExpression'],
			    ['insertImage', 'insertVideo', 'insertVariant','insertCode'],
			    ['delete','moveup','movedown'],
//			    ['undo', 'redo', 'fullScreen'],
			],
			'width':"80",
			'height':"400",
			'fullScreen':false, //初始化时是否全屏,程序运行时会改变
			'pages':[], //默认空page
			'support':['text','img','audio','video'],  //支持的page 类型
			'multi':true,  //是否支持多页
		};
		
		//支持的事件
		GliEditor.Event = {
			'onPageCreate':[],
			'onPageChange':[],
			'onPageDelete':[],
		};
		
		//工具方法
		$.extend(GliEditor,{
			/**
			 * 创建选中区
			 * @param	elem 
			 *			Object dom 
			 * @param	start 
			 *			Number 开始选择位置
			 * @param	start 
			 *			Number 选取长度
			 */
			'createRange':function(elem,start,length){
				elem = $(".ge-editor-page")[0];
				var range = document.createRange();
				range.selectNode(elem);
				document.getSelection().removeAllRanges();
				document.getSelection().addRange(range);
				
//				range.setStart(elem,0);
//				range.setEnd(elem,1);
//				
//				editor.currentRange(range);
//				editor.restoreRange();
				return range;
				
			},
			/**
			 * 检测Page合法性
			 * @param	$page 
			 *			Object jquery对象
			 */
			'verifiPage':function( $page ){
				switch( $page.data("type") ){
					case "text":
						//不能有多媒体文件
						if( $page.find("img").length!=0 || $page.find("audio").length!=0 || $page.find("video").length!=0){
							return false;
						}
					break;
					case "img":
						//有且只有一个图片
						if( $page.find("img").length > 1  ){
							return false;
						}
						
						//除了一个图片外没有其它内容
						var $temp  = $( $page[0].outerHTML );
						$temp.find("img").remove();
						if( $temp.html() != ""){
							return false;
						}
					break;
					case "audio":
						//有且只有一个音频
						if( $page.find("audio").length != 1  ){
							return false;
						}
						
						//除了一个音频外没有其它内容
						var $temp  = $( $page[0].outerHTML );
						$temp.find("audio").remove();
						if( $temp.html() != ""){
							return false;
						}
					break;
					case "video":
						//有且只有一个视频
						if( $page.find("video").length != 1  ){
							return false;
						}
						
						//除了一个视频外没有其它内容
						var $temp  = $( $page[0].outerHTML );
						$temp.find("video").remove();
						if( $temp.html() != ""){
							return false;
						}
					break;
					default :
						return false;
						
				}
				return true;
			},
		});
		
		GliEditor.fn.init.prototype	= GliEditor.fn;

		
		/**
		 * 封装为jq插件
		 */
		$.fn.extend({
			GliEditor:function(option){
				var editors = [];
				this.each(function(){
					editors.push(new GliEditor($.extend(option,{parent:this})));
				});
				return editors.length == 1 ? editors[0]:editors;
			}
		});
})($);

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



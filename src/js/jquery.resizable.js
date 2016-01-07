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

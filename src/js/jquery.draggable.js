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

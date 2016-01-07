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



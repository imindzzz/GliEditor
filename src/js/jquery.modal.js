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

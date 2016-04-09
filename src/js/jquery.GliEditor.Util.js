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
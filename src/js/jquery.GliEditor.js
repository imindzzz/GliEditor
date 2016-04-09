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
			 * 选中状态插入一个元素
			 * @param {Object} $elem
			 */
			appendChild:function( $elem ){
				//FIXME  目前只能插入选中节点后面
				var editor = this;
				var range = editor.currentRange();
				var $select;
				if( range.startContainer === range.endContainer){
					$select =  $( range.startContainer );
				}else{
					$select = $( range.commonAncestorContainer );
				}
				$select.after( $elem );
				return true;
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
		
		//支持的事件
		GliEditor.Event = {
			'onPageCreate':[],
			'onPageChange':[],
			'onPageDelete':[],
		};
		
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

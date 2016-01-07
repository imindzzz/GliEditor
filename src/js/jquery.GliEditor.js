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

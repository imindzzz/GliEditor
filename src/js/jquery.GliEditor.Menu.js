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
//					'style':"font-family:"+items[i]+";",
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
//					'style':"font-family:"+items[i]+";",
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
	'insertFormula':{
		'title':"公式",
		'icon':['fa fa-cogs'],
		'callback':function(event){
			var editor		= event.data.editor;
			var range 		= editor.currentRange();
			var $selected 	= $( range?range.commonAncestorContainer:"");
			var $img;
			//如果选中的是公式
			if( $selected.hasClass("formula") || $selected.find(".formula").length != 0 ){
				$img = $selected.hasClass("formula")?$selected:$selected.find(".formula");
			}else{
				$img = $("<img class='formula'/>");
			}
			var formula 	= $img.attr("data-formula") || "";
			var iframe_src 	= editor.config.formula_iframe + "?formula=" + formula;
			var img_src		= editor.config.formula_img + formula;
			var $body 		= $(GliEditor.htmlTemplates.insertFormula);
			$body.find(".iframe").attr("src",iframe_src);
			$body.find(".formula-preview").attr("src",img_src);
			window.FORMULA_CALLBACK = function( formula ){
				console.log( formula );
				$body.find(".formula-preview").attr({
					"src":editor.config.formula_img + encodeURI(formula),
					"data-formula": encodeURI(formula),
				});
			};
			$.modal({
				//'height':400,
				'width':800,
				'title':"公式编辑",
				'body':$body,
				'onSubmit':function(mevent){
					var formula = decodeURI( $body.find(".formula-preview").attr("data-formula") );
					$img.attr({
						"src":editor.config.formula_img + encodeURI(formula),
						"data-formula": encodeURI(formula),
					});
					
					//如果公式图片还没有被插入,则插入到编辑器
					if( $img.parent().length === 0 ){
						editor.appendChild( $img );
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
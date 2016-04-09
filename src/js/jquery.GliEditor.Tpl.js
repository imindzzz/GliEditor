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
					+"<div class='line'><span>宽度：</span><input  name='width' style='width: 70px;'/></div>"
				   +"</div>",
	'insertFormula':"<div class='insertFormula'>"+
						"<iframe class='iframe'></iframe>"+
						"<img class='formula-preview' />"+
					"</div>",				
	'insertVariant':"<div class='ge-insertVariant'></div>"
}
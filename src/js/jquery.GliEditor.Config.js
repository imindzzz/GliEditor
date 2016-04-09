//默认配置
GliEditor.config = {
//	lang:"zh-ch",
	'upload':'/ajax/ajax_edit_content2.php?act=pic_upload',  //文件上传地址  		 //TODO 使用jquery.uploadify实现
	'variant':'http://wk1.ak.kf.gli.cn/ajax/ajax_edit_content2.php?act=variant', //获取异体字地址(JSONP),
	'formula_iframe':'../dist/eq_editor/index.html',// 公式编辑iframe
	'formula_img':'http://192.168.1.7/cgi-bin/tex.exe?',//公式编辑生成图片
	'menu':[
//			    ['viewSourceCode'],
	    ['bold', 'underline', 'italic', 'foreColor', 'backgroundColor', 'strikethrough','forecolor','backcolor'],
	    ['fontFamily', 'fontSize', 'justify'],
//			    ['createLink', 'unLink', 'insertTable', 'insertExpression'],
	    ['insertImage','insertFormula', 'insertVideo', 'insertVariant','insertCode'],
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
/**
 * 颜色选择器
 * 1.0.0 正式发布
 */
;
(function ($) {

	window.colorPicker = function (option) {
		return new colorPicker.fn.init(option);
	}

	colorPicker.fn = colorPicker.prototype = {
		'init': function (option) {
			var config = $.extend(colorPicker.config, option); //合并默认参数
			this.config = config;

			var picker = this;
			var $colorPicker = $(colorPicker.htmlTemplates);
			picker.$colorPicker = $colorPicker;
			$colorPicker.bind("click", function () {
				return false
			});

			//调节饱和度和亮度
			var $sv = $colorPicker.find(".sv");

			function onsvmove(event) {
				var top = event.pageY - $sv.find(".value").offset().top;
				if (top < -5) {
					top = -5;
				}
				if (top > $sv.find(".value").height() - 5) {
					top = $sv.find(".value").height() - 5;
				}
				$sv.find(".point").css("top", top + 'px');

				var left = event.pageX - $sv.find(".value").offset().left;
				if (left < -5) {
					left = -5;
				}
				if (left > $sv.find(".value").width() - 5) {
					left = $sv.find(".value").width() - 5;
				}
				$sv.find(".point").css("left", left + 'px');

				picker.refresh('hsv');
			}
			$sv.find(".value,.point").bind("mousedown", function (event) {
				onsvmove(event);
				$(document).bind("mousemove", onsvmove);
				$(document).bind("mouseup", function () {
					$(document).unbind("mousemove", onsvmove);
				});
			});

			//色相调节区
			var $h = $colorPicker.find(".h");

			function onhmove(event) {
				var top = event.pageY - $h.find(".value").offset().top;
				if (top < 0) {
					top = 0;
				}
				if (top > $h.find(".value").height() - 1) {
					top = $h.find(".value").height() - 1;
				}
				$h.find(".point").css("top", top);
				picker.refresh('hsv');
			}
			$h.find(".value,.point").bind("mousedown", function (event) {
				onhmove(event);
				$(document).bind("mousemove", onhmove);
				$(document).bind("mouseup", function () {
					$(document).unbind("mousemove", onhmove);
				});
			});


			//透明度调节区
			var $alpha = $colorPicker.find(".alpha");

			function onalphamove(event) {
				var top = event.pageY - $alpha.find(".value").offset().top;
				if (top < 0) {
					top = 0;
				}
				if (top > $alpha.find(".value").height() - 1) {
					top = $alpha.find(".value").height() - 1;
				}
				$alpha.find(".point").css("top", top);
				picker.refresh('alpha');
			}
			$alpha.find(".value,.point").bind("mousedown", function (event) {
				onalphamove(event);
				$(document).bind("mousemove", onalphamove);
				$(document).bind("mouseup", function () {
					$(document).unbind("mousemove", onalphamove);
				});
			});

			//调节值显示区			
			$colorPicker.children(".value").find("input").bind("change", function () {
				picker.refresh(this.name);
			});
			//添加到页面
			$("body").append($colorPicker);

			//显示
			if (config.show) {
				picker.show();
			}
			return picker;
		},
		/**
		 * 刷新页面
		 * type 发生改变的位置,
		 */
		'refresh': function (type) {
			type = type || "hsv";
			var picker = this;
			var h, s, v;
			var rgb;
			var hex;
			var alpha = (picker.$colorPicker.find(".alpha").find(".point").offset().top - picker.$colorPicker.find(".alpha").offset().top) / 180;

			switch (type) {
				case "hsv":
					h = (picker.$colorPicker.find(".h").find(".point").offset().top - picker.$colorPicker.find(".h").offset().top) * 2;
					s = (picker.$colorPicker.find(".sv").find(".point").offset().left + 5 - picker.$colorPicker.find(".sv").offset().left) / 180;
					v = 1 - (picker.$colorPicker.find(".sv").find(".point").offset().top + 5 - picker.$colorPicker.find(".sv").offset().top) / 180;
					break;
				case "h":
					h = Number.parseFloat(picker.$colorPicker.children(".value").find("input[name='h']").val());
					h = isNaN(h) ? picker.$colorPicker.children(".value").find("input[name='h']").data("value") : h;
					s = (picker.$colorPicker.find(".sv").find(".point").offset().left - picker.$colorPicker.find(".sv").offset().left) / 180;
					v = 1 - (picker.$colorPicker.find(".sv").find(".point").offset().top - picker.$colorPicker.find(".sv").offset().top) / 180;
					break;
				case "s":
					h = (picker.$colorPicker.find(".h").find(".point").offset().top - picker.$colorPicker.find(".h").offset().top) * 2;
					s = Number.parseFloat(picker.$colorPicker.children(".value").find("input[name='s']").val());
					s = isNaN(s) ? picker.$colorPicker.children(".value").find("input[name='s']").data("value") : s;
					v = 1 - (picker.$colorPicker.find(".sv").find(".point").offset().top - picker.$colorPicker.find(".sv").offset().top) / 180;
					break;
				case "v":
					h = (picker.$colorPicker.find(".h").find(".point").offset().top - picker.$colorPicker.find(".h").offset().top) * 2;
					s = (picker.$colorPicker.find(".sv").find(".point").offset().left - picker.$colorPicker.find(".sv").offset().left) / 180;
					v = Number.parseFloat(picker.$colorPicker.children(".value").find("input[name='v']").val());
					v = isNaN(v) ? picker.$colorPicker.children(".value").find("input[name='v']").data("value") : v;
					break;
				case "rgb":
					var match = picker.$colorPicker.children(".value").find("input[name='rgb']").val().match(/[0-9]+/g) || [];
					console.log(match);
					rgb = {
						r: Number.parseInt(match[0]),
						g: Number.parseInt(match[1]),
						b: Number.parseInt(match[2]),
					};
					if (rgb.r > 255 || rgb.r < 0 || rgb.g > 255 || rgb.g < 0 || rgb.b > 255 || rgb.b < 0) {
						rgb = picker.$colorPicker.children(".value").find("input[name='rgb']").data("value");
					}
					var hsv = colorPicker.rgb2hsv(rgb);
					h = hsv.h;
					s = hsv.s;
					v = hsv.v;
					break;
				case "hex":
					var hex = picker.$colorPicker.children(".value").find("input[name='hex']").val().match(/[a-f0-9]{6}/i);
					if (!hex) {
						picker.$colorPicker.children(".value").find("input[name='hex']").val(picker.$colorPicker.children(".value").find("input[name='hex']").data('value'));
						return;
					}
					hex = hex[0]
					console.log(hex);
					var rgb = colorPicker.hex2rgb(hex);
					var hsv = colorPicker.rgb2hsv(rgb);
					h = hsv.h;
					s = hsv.s;
					v = hsv.v;
					break;
				default:
					h = (picker.$colorPicker.find(".h").find(".point").offset().top - picker.$colorPicker.find(".h").offset().top) * 2;
					s = (picker.$colorPicker.find(".sv").find(".point").offset().left + 5 - picker.$colorPicker.find(".sv").offset().left) / 180;
					v = 1 - (picker.$colorPicker.find(".sv").find(".point").offset().top + 5 - picker.$colorPicker.find(".sv").offset().top) / 180;
					break;
			}

			//微调精度,
			// h = h >= 358 ? 360 : h;
			// s = s >= 0.94 ? 1 : s;
			// v = v >= 0.94 ? 1 : v;
			// alpha = alpha >= 0.99 ? 1 : alpha;
			//限定值域
			h = h < 0 ? 0 : h;
			s = s < 0 ? 0 : s;
			v = v < 0 ? 0 : v;

			rgb = rgb ? rgb : colorPicker.hsv2rgb({ h: h, s: s, v: v });
			hex = hex ? hex : colorPicker.rgb2hex(rgb);
			rgbStr = '';
			if (alpha >= 0 && alpha < 1) {
				rgbStr = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + alpha.toFixed(1) + ")";
			} else {
				rgbStr = "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")";
			}

			//设置显示区域
			picker.$colorPicker.find(".h").find(".point").css("top", (h == 360 ? 358 : h) / 2);
			picker.$colorPicker.find(".sv").css("background-color", "rgb(" + colorPicker.hsv2rgb({ h: h, s: 1, v: 1 }).rgb + ")");
			picker.$colorPicker.find(".sv").find(".point").css({
				// top: (1 - v >= 1 ? 1 : 1 - v) * 180 - 5,
				// left: (s == 1 ? 1 : s) * 180 - 5,
				top: (1 - v >= 1 ? 1 : 1 - v) * 180 - 5,
				left: s * 180 - 5,
			});
			picker.$colorPicker.children(".value").find("input[name='h']").val(Math.floor(h)).data('value', h);
			picker.$colorPicker.children(".value").find("input[name='s']").val(s.toFixed(2)).data('value', s);
			picker.$colorPicker.children(".value").find("input[name='v']").val(v.toFixed(2)).data('value', v);
			picker.$colorPicker.children(".value").find("input[name='rgb']").val(rgbStr).data('value', rgbStr);


			picker.$colorPicker.children(".value").find("input[name='hex']").val("#" + hex).data('value', hex);


			//回调
			if (picker.config.onChange) {
				picker.config.onChange({
					rgb: rgbStr,
					hex: "#" + hex,
				});
			}
		},
		'show': function () {
			//隐藏其它选择器

			$(".colorpicker").hide(300);
			if (this.config.dom) {
				this.$colorPicker.css({
					'top': $(this.config.dom).offset().top + $(this.config.dom).height() + 10,
					'left': $(this.config.dom).offset().left,
				});
			}
			this.$colorPicker.show(300);
		},
		'hide': function () {
			this.$colorPicker.hide(300);
		},
	};
	colorPicker.fn.init.prototype = colorPicker.fn;

	//Html代码模板
	colorPicker.htmlTemplates = "<div class='colorpicker'>"
		+ "<div class='history'></div>"
		+ "<div class='sv'>" + "<div class='value'></div>" + "<div class='point'></div>" + "</div>"
		+ "<div class='h'>" + "<div class='value'></div>" + "<div class='point'></div>" + "</div>"
		+ "<div class='alpha'>" + "<div class='value'></div>" + "<div class='point'></div>" + "</div>"
		+ "<div class='value'>"
		+ "<label>RGB:</label><input name='rgb'></input><br />"
		// + "<label>HEX:</label><input name='hex'></input><br />"
		// + "<label>H:</label><input name='h' ></input><br />"
		// + "<label>S:</label><input name='s' ></input><br />"
		// + "<label>V:</label><input name='v' '></input>"
		+ "</div>"
		+ "<div style='clear: both;'></div>"
		+ "</div>";

	//配置
	colorPicker.config = {
		history: 'false', //TODO 增加选择历史记录
		show: false,
	};

	//工具方法
	colorPicker.rgb2hsv = function (rgb) { // faster
		var r = rgb.r / 255,
			g = rgb.g / 255,
			b = rgb.b / 255;
		var h, s, v;

		max = Math.max(r, g, b);
		min = Math.min(r, g, b);

		v = max;

		if (v != 0) {
			s = 1 - (min / max);
		} else {
			s = 0;
		}

		if (max == min) {
			h = 0;
		}
		if (max == g) {
			h = 60 * ((b - r) / (max - min)) + 120;
		}
		if (max == b) {
			h = 60 * ((r - g) / (max - min)) + 240;
		}
		if (max == r) {
			if (g >= b) {
				h = 60 * ((g - b) / (max - min)) + 0;
			} else {
				h = 60 * ((g - b) / (max - min)) + 360;
			}
		}

		return {
			h: h,
			s: s,
			v: v,
		};
	};
	colorPicker.hsv2rgb = function (hsv) {
		var h = hsv.h,
			s = hsv.s,
			v = hsv.v;
		h = h >= 360 ? 0 : h;

		var mod = Math.floor(Math.abs(h / 60)) % 6,
			f = (h / 60) - mod,
			p = v * (1 - s),
			q = v * (1 - f * s),
			t = v * (1 - (1 - f) * s);

		var rgb = {
			r: Math.floor([v, q, p, p, t, v][mod] * 255),
			g: Math.floor([t, v, v, q, p, p][mod] * 255),
			b: Math.floor([p, p, t, v, v, q][mod] * 255)
		};
		rgb.rgb = rgb.r + "," + rgb.g + "," + rgb.b;
		return rgb;
	};
	colorPicker.rgb2hex = function (rgb) {
		return (
			(rgb.r < 16 ? '0' : '') + rgb.r.toString(16) +
			(rgb.g < 16 ? '0' : '') + rgb.g.toString(16) +
			(rgb.b < 16 ? '0' : '') + rgb.b.toString(16)
		).toUpperCase();
	};

	colorPicker.hex2rgb = function (hex) {
		hex = hex.split(''); // IE7
		return {
			r: parseInt(hex[0] + hex[hex[3] ? 1 : 0], 16) / 255,
			g: parseInt(hex[hex[3] ? 2 : 1] + (hex[3] || hex[1]), 16) / 255,
			b: parseInt((hex[4] || hex[2]) + (hex[5] || hex[2]), 16) / 255
		};
	};


	//封装到Jquery 
	$.fn.extend({
		colorPicker: function (option) {
			$(this).each(function (index) {
				if (index != 0) return; //只显示一个
				var elem = this;
				var Picker;
				if (elem.colorPicker) {
					Picker = elem.colorPicker;
				} else {
					//初始化
					option.dom = elem;
					Picker = new colorPicker(option);
					$(elem).bind("click", function () {
						Picker.show();
						return false;
					});
					$(document).bind("click", function () {
						// Picker.hide();
					});
					elem.colorPicker = Picker;
				}
			});
			return this;
		},
	});

})($);
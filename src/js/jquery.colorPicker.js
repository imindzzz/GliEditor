/**
 * 颜色选择器
 * 1.0.3 去jquery
 * 1.0.2 兼容rgba,修复精度丢失
 * 1.0.0 正式发布
 */
;
(function () {
	Util = {
		createElementByHtml: function (html) {
			var temp = document.createElement('div');
			temp.innerHTML = html;
			return temp.children.length == 1 ? temp.children[0] : temp.childNodes;
		},
		getElementOffset: function (elem) {
			return elem.getClientRects()[0];
		},
		extend: function () {
			var re = arguments[0];
			for (var i = 1; i < arguments.length; i++) {
				var obj = arguments[i];
				for (var key in obj) {
					re[key] = obj[key];
				}
			}
			return re;
		},
		getRGBAforStr(str) {
			var match = str.match(/[0-9\.]+/g) || [];
			return rgb = {
				r: Number.parseInt(match[0]),
				g: Number.parseInt(match[1]),
				b: Number.parseInt(match[2]),
				a: Number.parseFloat(match[3])
			};
		}
	};
	window.colorPicker = function (option) {
		return new colorPicker.fn.init(option);
	}

	colorPicker.fn = colorPicker.prototype = {
		'init': function (option) {
			var config = Util.extend(colorPicker.config, option); //合并默认参数
			this.config = config;

			var picker = this;
			var $colorPicker = Util.createElementByHtml(colorPicker.htmlTemplates);
			picker.$colorPicker = $colorPicker;
			$colorPicker.addEventListener("click", function (e) {
				e.preventDefault();
				e.stopPropagation();
				return false;
			});

			//调节饱和度和亮度
			var $sv = $colorPicker.querySelector(".sv");

			function onsvmove(event) {
				var elemOffset = Util.getElementOffset($sv.querySelector(".value"));
				var top = event.pageY - elemOffset.top;
				if (top < -5) {
					top = -5;
				}
				if (top > elemOffset.height - 5) {
					top = elemOffset.height - 5;
				}
				$sv.querySelector(".point").style.top = top + 'px';

				var left = event.pageX - elemOffset.left;
				if (left < -5) {
					left = -5;
				}
				if (left > elemOffset.width - 5) {
					left = elemOffset.width - 5;
				}
				$sv.querySelector(".point").style.left = left + 'px';

				picker.refresh('hsv');
			}
			$sv.querySelector(".value,.point").addEventListener("mousedown", function (event) {
				function mouseup() {
					document.removeEventListener("mousemove", onsvmove);
					document.removeEventListener("mouseup", mouseup);
				}
				onsvmove(event);
				document.addEventListener("mousemove", onsvmove);
				document.addEventListener("mouseup", mouseup);
			});

			//色相调节区
			var $h = $colorPicker.querySelector(".h");

			function onhmove(event) {
				var offset = Util.getElementOffset($h.querySelector(".value"));
				var top = event.pageY - offset.top;
				if (top < 0) {
					top = 0;
				}
				if (top > offset.height - 1) {
					top = offset.height - 1;
				}
				$h.querySelector(".point").style.top = top + 'px';
				picker.refresh('hsv');
			}
			$h.querySelector(".value,.point").addEventListener("mousedown", function (event) {
				function mouseup() {
					document.removeEventListener("mousemove", onhmove);
					document.removeEventListener("mouseup", mouseup);
				}
				onhmove(event);
				document.addEventListener("mousemove", onhmove);
				document.addEventListener("mouseup", mouseup);
			});


			//透明度调节区
			var $alpha = $colorPicker.querySelector(".alpha");

			function onalphamove(event) {
				var offset = Util.getElementOffset($alpha.querySelector(".value"));
				var top = event.pageY - offset.top;
				if (top < 0) {
					top = 0;
				}
				if (top > offset.height - 1) {
					top = offset.height - 1;
				}
				$alpha.querySelector(".point").style.top = top + 'px';
				picker.refresh('alpha');
			}
			$alpha.querySelector(".value,.point").addEventListener("mousedown", function (event) {
				function mouseup() {
					document.removeEventListener("mousemove", onalphamove);
					document.removeEventListener("mouseup", mouseup);
				}
				onalphamove(event);
				document.addEventListener("mousemove", onalphamove);
				document.addEventListener("mouseup", mouseup);
			});

			//调节值显示区			
			Array.prototype.map.call($colorPicker.querySelectorAll(".values input"), function (elem) {
				elem.addEventListener("change", function () {
					picker.refresh(this.name);
				});
			})
			//添加到页面
			document.body.appendChild($colorPicker);

			//显示
			if (config.show) {
				picker.show();
			}
			return picker;
		},
		'getValues': function (type) {
			type = type || "hsv";
			var picker = this;
			var h, s, v;
			var rgb;
			var hex;
			var alpha = (picker.$colorPicker.querySelector(".alpha").querySelector(".point").offsetTop - picker.$colorPicker.querySelector(".alpha").offsetTop) / 180;
			switch (type) {
				// case "h":
				// 	h = Number.parseFloat(picker.$colorPicker.querySelector(".values").querySelector("input[name='h']").value);
				// 	h = isNaN(h) ? picker.$colorPicker.querySelector(".values").querySelector("input[name='h']").getAttribute("value") : h;
				// 	s = Util.getElementOffset(picker.$colorPicker.querySelector(".sv").querySelector(".point").left - Util.getElementOffset(picker.$colorPicker.querySelector(".sv")).left) / 180;
				// 	v = 1 - Util.getElementOffset(picker.$colorPicker.querySelector(".sv").querySelector(".point").top - Util.getElementOffset(picker.$colorPicker.querySelector(".sv")).top) / 180;
				// 	break;
				// case "s":
				// 	h = (picker.$colorPicker.querySelector(".h").querySelector(".point").offsetTop - picker.$colorPicker.querySelector(".h").offsetTop) * 2;
				// 	s = Number.parseFloat(picker.$colorPicker.querySelector(".values").querySelector("input[name='s']").value);
				// 	s = isNaN(s) ? picker.$colorPicker.querySelector(".values").querySelector("input[name='s']").getAttribute("value") : s;
				// 	v = 1 - Util.getElementOffset(picker.$colorPicker.querySelector(".sv").querySelector(".point").top - picker.$colorPicker.querySelector(".sv").offsetTop) / 180;
				// 	break;
				// case "v":
				// 	h = (picker.$colorPicker.querySelector(".h").querySelector(".point").offsetTop - picker.$colorPicker.querySelector(".h").offsetTop) * 2;
				// 	s = Util.getElementOffset(picker.$colorPicker.querySelector(".sv").querySelector(".point").left - Util.getElementOffset(picker.$colorPicker.querySelector(".sv")).left) / 180;
				// 	v = Number.parseFloat(picker.$colorPicker.querySelector(".values").querySelector("input[name='v']").value);
				// 	v = isNaN(v) ? picker.$colorPicker.querySelector(".values").querySelector("input[name='v']").getAttribute("value") : v;
				// 	break;
				case "rgb":
					var rgb = Util.getRGBAforStr(picker.$colorPicker.querySelector(".values").querySelector("input[name='rgb']").value);

					if (rgb.r > 255 || rgb.r < 0 || rgb.g > 255 || rgb.g < 0 || rgb.b > 255 || rgb.b < 0) {
						rgb = picker.$colorPicker.querySelector(".values").querySelector("input[name='rgb']").getAttribute("value");
					}
					var hsv = colorPicker.rgb2hsv(rgb);
					h = hsv.h;
					s = hsv.s;
					v = hsv.v;
					alpha = rgb.a;
					break;
				// case "hex":
				// 	var hex = picker.$colorPicker.querySelector(".values").querySelector("input[name='hex']").value.match(/[a-f0-9]{6}/i);
				// 	if (!hex) {
				// 		picker.$colorPicker.querySelector(".values").querySelector("input[name='hex']").value = picker.$colorPicker.querySelector(".values").querySelector("input[name='hex']").getAttribute('data-value');
				// 		return;
				// 	}
				// 	hex = hex[0]
				// 	console.log(hex);
				// 	var rgb = colorPicker.hex2rgb(hex);
				// 	var hsv = colorPicker.rgb2hsv(rgb);
				// 	h = hsv.h;
				// 	s = hsv.s;
				// 	v = hsv.v;
				// 	break;
				case 'hsv':
				default:
					h = (Util.getElementOffset(picker.$colorPicker.querySelector(".h").querySelector(".point")).top - Util.getElementOffset(picker.$colorPicker.querySelector(".h")).top) * 2;
					s = (Util.getElementOffset(picker.$colorPicker.querySelector(".sv").querySelector(".point")).left + 5 - Util.getElementOffset(picker.$colorPicker.querySelector(".sv")).left) / 180;
					v = 1 - (Util.getElementOffset(picker.$colorPicker.querySelector(".sv").querySelector(".point")).top + 5 - Util.getElementOffset(picker.$colorPicker.querySelector(".sv")).top) / 180;
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
			alpha = alpha < 0 ? 0 : alpha;

			rgb = rgb ? rgb : colorPicker.hsv2rgb({ h: h, s: s, v: v });
			hex = hex ? hex : colorPicker.rgb2hex(rgb);
			rgbStr = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + alpha.toFixed(1) + ")";
			return {
				h: h,
				s: s,
				v: v,
				alpha: alpha,
				rgb: rgb,
				hex: hex,
				rgbStr: rgbStr,
			};
		},
		/**
		 * 刷新页面
		 * type 发生改变的位置,
		 */
		'refresh': function (type, values) {
			values = values || this.getValues(type);
			var picker = this;
			//设置显示区域
			picker.$colorPicker.querySelector(".h").querySelector(".point").style.top = (values.h == 360 ? 358 : values.h) / 2;
			picker.$colorPicker.querySelector(".sv").style.backgroundColor = "rgb(" + colorPicker.hsv2rgb({ h: values.h, s: 1, v: 1 }).rgb + ")";
			picker.$colorPicker.querySelector(".sv").querySelector(".point").style.top = (1 - values.v >= 1 ? 1 : 1 - values.v) * 180 - 5 + 'px';
			picker.$colorPicker.querySelector(".sv").querySelector(".point").style.left = values.s * 180 - 5 + 'px';
			// picker.$colorPicker.querySelector(".sv").querySelector(".point").css({
			// 	top: (1 - v >= 1 ? 1 : 1 - v) * 180 - 5,
			// 	left: (s == 1 ? 1 : s) * 180 - 5,
			// 	top: (1 - v >= 1 ? 1 : 1 - v) * 180 - 5,
			// 	left: s * 180 - 5,
			// });
			// picker.$colorPicker.querySelector(".values").querySelector("input[name='h']").value = Math.floor(h);
			// picker.$colorPicker.querySelector(".values").querySelector("input[name='h']").setAttribute("data-value", h);
			// picker.$colorPicker.querySelector(".values").querySelector("input[name='s']").value = s.toFixed(2);
			// picker.$colorPicker.querySelector(".values").querySelector("input[name='s']").setAttribute("data-value", s);
			// picker.$colorPicker.querySelector(".values").querySelector("input[name='v']").value = v.toFixed(2);
			// picker.$colorPicker.querySelector(".values").querySelector("input[name='v']").setAttribute("data-value", v);
			picker.$colorPicker.querySelector(".values").querySelector("input[name='rgb']").value = values.rgbStr;
			picker.$colorPicker.querySelector(".values").querySelector("input[name='rgb']").setAttribute("data-value", values.rgbStr);
			// picker.$colorPicker.querySelector(".values").querySelector("input[name='hex']").value = "#" + hex;
			// picker.$colorPicker.querySelector(".values").querySelector("input[name='hex']").setAttribute("data-value", hex);

			//回调
			if (picker.config.onChange) {
				//为了不catch异常
				setTimeout(function () {
					picker.config.onChange({
						rgb: values.rgbStr,
						hex: "#" + values.hex,
					});
				}, 100);
			}
		},
		'show': function () {
			if (this.config.dom) {
				this.$colorPicker.style.top = this.config.dom.offsetTop + this.config.dom.offsetHeight + 10 + 'px';
				this.$colorPicker.style.left = this.config.dom.offsetLeft + 'px';
			}
			this.$colorPicker.style.display = 'block';
		},
		'hide': function () {
			this.$colorPicker.style.display = 'none';
		},
	};
	colorPicker.fn.init.prototype = colorPicker.fn;

	//Html代码模板
	colorPicker.htmlTemplates = "<div class='colorpicker'>"
		+ "<div class='history'></div>"
		+ "<div class='sv'>" + "<div class='value'></div>" + "<div class='point'></div>" + "</div>"
		+ "<div class='h'>" + "<div class='value'></div>" + "<div class='point'></div>" + "</div>"
		+ "<div class='alpha'>" + "<div class='value'></div>" + "<div class='point'></div>" + "</div>"
		+ "<div class='values'>"
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
})();
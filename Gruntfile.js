module.exports = function(grunt) {

	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	var config = {
		src: 'src',
		dist: 'dist',
	}
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		config: config,
		clean: {
			files: [
				'<%= config.dist %>/{,*/}*',
			]
		},
		concat: {
			js: {
				src: [
					"<%= config.src %>/js/jquery.draggable.js",
					"<%= config.src %>/js/jquery.resizable.js",
					"<%= config.src %>/js/jquery.select.js",
					"<%= config.src %>/js/jquery.modal.js",
					"<%= config.src %>/js/jquery.colorPicker.js",
					"<%= config.src %>/js/jquery.Glieditor.js",
					"<%= config.src %>/js/jquery.uploadfile.js",
				],
				dest: "<%= config.dist%>/GliEditor.js",
			},
			css:{
				src: [
					"<%= config.src %>/css/jquery.draggable.css",
					"<%= config.src %>/css/jquery.resizable.css",
					"<%= config.src %>/css/jquery.select.css",
					"<%= config.src %>/css/jquery.modal.css",
					"<%= config.src %>/css/jquery.colorPicker.css",
					"<%= config.src %>/css/jquery.Glieditor.css",
				],
				dest: "<%= config.dist%>/GliEditor.css",
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name%> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
			},
			dist: {
				files: {
					"<%= config.dist%>/GliEditor.min.js": [
						"<%= config.dist%>/GliEditor.js",
					],
				}
			}
		},
		cssmin: {
			dist: {
				files: {
					"<%= config.dist%>/GliEditor.min.css": [
						"<%= config.dist%>/GliEditor.css",
					],
				}
			}
		},
		watch: {
			scripts: {
				files: "<%= config.src %>/js/*.js",
				tasks: ['concat:js',"uglify"],
			},
			style: {
				files: "<%= config.src %>/css/*.css",
				tasks: ['concat:css',"cssmin"],
			}
		},
	});

	grunt.registerTask('default', ['clean','concat', 'uglify', 'cssmin', 'watch']);
};

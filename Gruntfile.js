'use strict';

module.exports = function(grunt){
	grunt.initConfig({
		srcmust: {
			options: {
				type: 'v'
			},
			cc: {
				options: {
					dirs: ['public/stylesheets/','public/javascripts/']
				},
				files: [{
					src: [
						'cache/cache.appcache',
						'views/layout.html',
						'views/login.html',
						'views/index.html',
						'views/reg.html',
						'views/user.html'
					]
				}]
			}
		}
	});

	grunt.loadNpmTasks('grunt-rev');
	grunt.loadNpmTasks('grunt-srcmust');

	grunt.registerTask('src',['srcmust']);
	grunt.registerTask('default',['src']);
}
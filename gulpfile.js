'use strict';

const fs         = require( 'fs' );
const gulp       = require( 'gulp' );
const handlebars = require( 'gulp-compile-handlebars' );
const layouts    = require( 'handlebars-layouts' );
const rename     = require( 'gulp-rename' );
const yaml       = require( 'js-yaml' );

var paths = {
	src: "src",
	dist: "dist",

	templates: "src/templates",
};

gulp.task('templates', function()
{
	var siteData = yaml.safeLoad( fs.readFileSync( 'data.yml', 'utf8' ) );

	return gulp.src( `${paths.templates}/**/*.hbs` )
		.pipe( handlebars( siteData, {} ) )
		.pipe( rename( function( path )
		{
			path.extname = '.html';
		}))
		.pipe( gulp.dest( paths.dist ) );
});

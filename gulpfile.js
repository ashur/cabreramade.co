'use strict';

const fs          = require( 'fs' );
const glob        = require( 'glob' );
const gulp        = require( 'gulp' );
const hb          = require( 'gulp-hb' );
const layouts     = require( 'handlebars-layouts' );
const helpers     = require( 'handlebars-helpers' );
const path        = require( 'path' );
const rename      = require( 'gulp-rename' );
const set         = require( 'set-value' );
const smartquotes = require( 'smartquotes' );
const yaml        = require( 'js-yaml' );

var paths = {
	src: "src",
	dist: "dist",

	data: "src/data",
	images: "src/img",
	partials: "src/partials",
	templates: "src/templates",
};

gulp.task( 'images', function()
{
	return gulp
		.src( `${paths.images}/**/*` )
		.pipe( gulp.dest( `${paths.dist}/img` ) );
});

gulp.task( 'templates', function()
{
	var hbStream = hb()
		.partials( `${paths.partials}/**/*.hbs` )

		.helpers( layouts )
		.helpers( helpers.markdown )
		.helpers({
			smartquotes: function( options )
			{
				return smartquotes( options.fn( this ) );
			}
		})

	/* Convert YAML to single data object */
	glob( `**/*.yml`, { cwd: paths.data }, function( er, files )
	{
		var data = {};

		files.forEach( function( filename )
		{
			var propertyPath = filename
				.substring( 0, filename.indexOf( '.' ) )
				.split( '/' )
				.join( '.' );

			var fileData = yaml.safeLoad( fs.readFileSync( `${paths.data}/${filename}`, 'utf8' ) );

			set( data, propertyPath, fileData );
		});

		hbStream.data( data );

		return gulp
	        .src( `${paths.templates}/**/*.hbs` )
	        .pipe( hbStream )
			.pipe( rename( function( path )
			{
				path.extname = '.html';
			}))
			.pipe( gulp.dest( paths.dist ) );
	});
});

gulp.task( 'watch', function()
{
	gulp.watch( [`${paths.data}/**/*`, `${paths.partials}/**/*`, `${paths.templates}/**/*`], ['templates'] );
	gulp.watch( [`${paths.images}/**/*`], ['images'] );
});

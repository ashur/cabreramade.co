'use strict';

const fs          = require( 'fs' );
const glob        = require( 'glob' );
const gulp        = require( 'gulp' );
const hb          = require( 'gulp-hb' );
const layouts     = require( 'handlebars-layouts' );
const helpers     = require( 'handlebars-helpers' );
const path        = require( 'path' );
const rename      = require( 'gulp-rename' );
const s3          = require( 'gulp-s3' );
const sass        = require( 'gulp-sass' );
const sasslint    = require( 'gulp-sass-lint' );
const set         = require( 'set-value' );
const smartquotes = require( 'smartquotes' );
const yaml        = require( 'js-yaml' );

var paths = {
	src: "src",
	dist: "dist",

	data: "src/data",
	images: "src/img",
	sass: "src/sass",
	partials: "src/partials",
	templates: "src/templates",
};

gulp.task( 'sass:build', function()
{
	return gulp
		.src( `${paths.sass}/*.scss` )
		.pipe( sass() )
		.pipe( gulp.dest( `${paths.dist}/style` ) );
});

gulp.task( 'sass:build', function()
{
	return gulp
		.src( `${paths.sass}/*.scss` )
		.pipe( sass() )
		.pipe( gulp.dest( `${paths.dist}/style` ) );
});

gulp.task( 'sass:optimized', function()
{
	return gulp
		.src( `${paths.sass}/*.scss` )
		.pipe( sass({
			outputStyle: 'compressed'
		}))
		.pipe( gulp.dest( `${paths.dist}/style` ) );
});

gulp.task( 'sass:lint', function()
{
	return gulp
		.src( `${paths.sass}/**/*.scss` )
		.pipe( sasslint() )
	    .pipe( sasslint.failOnError() );
});

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

gulp.task( 'deploy', function()
{
	var AWS = {
	  "key":    process.env.AWS_ACCESS_KEY_ID,
	  "secret": process.env.AWS_SECRET_ACCESS_KEY,
	  "bucket": "cabreramade.co",
	  "region": "us-west-2"
	};

	return gulp
		.src( `${paths.dist}/**` )
		.pipe( s3( AWS ) );
});

gulp.task( 'build', ['sass','images','templates'] );
gulp.task( 'build:optimized', ['sass:optimized','images','templates'] );

gulp.task( 'watch', function()
{
	gulp.watch( [`${paths.data}/**/*`, `${paths.partials}/**/*`, `${paths.templates}/**/*`], ['templates'] );
	gulp.watch( [`${paths.images}/**/*`], ['images'] );
	gulp.watch( [`${paths.sass}/**/*`], ['sass:lint','sass:build'] );
});

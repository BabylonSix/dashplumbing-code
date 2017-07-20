//
// Gulp Plugins
//

// Load Gulp
var gulp         = require('gulp');

// pug
var pug          = require('gulp-pug');
var minifyHTML   = require('gulp-minify-html');

// Sitemaps
var sitemap      = require('gulp-sitemap');

// Stylus
var stylus       = require('gulp-stylus');
var axis         = require('axis');        // styles
var rupture      = require('rupture');     // media queries
var typo         = require('typographic'); // typography
var lost         = require('lost');        // grids
var minifyCSS    = require('gulp-csso');

// Post CSS
var postcss      = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var sourcemaps   = require('gulp-sourcemaps');
var combineMQ    = require('gulp-combine-mq');

var rucksack     = require('gulp-rucksack');

// Image Compression
var svgo         = require('imagemin-svgo');

// Browser Sync
var browserSync  = require('browser-sync').create();
var reload       = browserSync.reload;

/// Utilities
var plumber      = require('gulp-plumber'); // Catch Errors
var runSequence  = require('run-sequence');

// Deployment
var ftp          = require('vinyl-ftp');



//
// Source and Destination Files
//


// src files
const src = {
	//code assets
	pug:       ['./src/pug/**/*.pug', '!./src/pug/views/**/*.pug'],
	pugAll:     './src/pug/**/*.pug',
	stylus:     './src/stylus/style.styl',
	stylusAll:  './src/stylus/**/*.styl',
	js:         './src/js/*.js',

	// image assets
	svg:        './src/assets/svg/**/*.svg',
	jpeg:      ['./src/assets/jpg/**/*.jpg', './src/assets/jpg/**/*.jpeg'],
	png:        './src/assets/png/**/*.png'
};


// build directories
const build = {
	html: './build/',
	css:  './build/css/',
	js:   './build/js/',
	img:  './build/img/'
};

// sitemap site url
const siteURL = {
	siteUrl: 'http://www.dashplumbing.us'
};




//
// Gulp Tasks
//


// pug >> HTML
gulp.task('pug', () => {
	return gulp.src(src.pug)
		.pipe(	plumber()	)
		.pipe(	pug({pretty: true})	)
		.pipe(	gulp.dest(build.html)	)
		.pipe(	reload({stream: true})	);
});


// Stylus >> CSS
gulp.task('stylus', () => {
	return gulp.src(src.stylus)
		.pipe(	plumber()	)
		.pipe(	sourcemaps.init()	)
		.pipe(	stylus({
			errors: true,
			use: [axis(), rupture(), typo()]
		})	)
		// .pipe(	rucksack()	)
		.pipe(	postcss([
			lost(),
			autoprefixer({ browsers: ['last 2 versions', '> 5%'] })
		])	)
		.pipe(	combineMQ({
			beautify: true
		})	)
		.pipe(	sourcemaps.write('./sourcemaps/')	)
		.pipe(	gulp.dest(build.css)	)
		.pipe(	reload({stream: true})	);
});


// Scripts >> JS
gulp.task('js', () => {
	return gulp.src(src.js)
		.pipe(	plumber()	)
		.pipe(	gulp.dest(build.js)	)
		.pipe(	reload({stream: true})	);
});


// SVG Pipe
gulp.task('svg', () => {
	return gulp.src(src.svg)
		.pipe(	plumber()	)
		.pipe(	gulp.dest(build.img)	);
});

// JPEG Pipe
gulp.task('jpeg', () => {
	return gulp.src(src.jpeg)
		.pipe(	plumber()	)
		.pipe(	gulp.dest(build.img)	);
});

// PNG Pipe
gulp.task('png', () => {
	return gulp.src(src.png)
		.pipe(	plumber()	)
		.pipe(	gulp.dest(build.img)	);
});


// Browser Sync
gulp.task( 'default', ['pug', 'stylus', 'js', 'svg', 'jpeg', 'png'], () => {

	browserSync.init({
		server: './build/'
	});

	gulp.watch( src.pugAll,    [ 'pug'    ]);
	gulp.watch( src.stylusAll, [ 'stylus' ]);
	gulp.watch( src.js,        [ 'js'     ]);
	gulp.watch( src.svg,       [ 'svg'    ]);
	gulp.watch( src.jpeg,      [ 'jpeg'   ]);
	gulp.watch( src.png,       [ 'png'    ]);

});




//
// Production Gulp Tasks
//


// production directories
var pro = {
	html: '../production/',
	css:  '../production/css/',
	js:   '../production/js/',
	img:  '../production/img/'
};


// pug >> HTML
gulp.task('pro_pug', () => {
	return gulp.src(src.pug)
		.pipe(	plumber()	)
		.pipe(	pug()	)
		.pipe(	minifyHTML({
			conditionals: true
		})	)
		.pipe(	gulp.dest(pro.html)	);
});


// Stylus >> CSS
gulp.task('pro_stylus', () => {
	return gulp.src(src.stylus)
		.pipe(	plumber()	)
		.pipe(	sourcemaps.init()	)
		.pipe(	stylus({
			errors: true,
			use: [axis(), rupture(),typo()]
		})	)
		.pipe(	postcss([
			lost(),
			autoprefixer({ browsers: ['last 2 versions', '> 5%'] })
		])	)
		.pipe(	combineMQ()	)
		.pipe(	minifyCSS({ structureMinimization: true })	)
		.pipe(	gulp.dest(pro.css)	);
});


// Scripts >> JS
gulp.task('pro_js', () => {
	return gulp.src(src.js)
		.pipe(	plumber()	)
		.pipe(	gulp.dest(pro.js)	);
});


// JPEG Optimization
gulp.task('pro_jpeg', () => {
	return gulp.src(src.jpeg)
		.pipe(	plumber()	)
		.pipe(	gulp.dest(pro.img)	);
});

// PNG Optimization
gulp.task('pro_png', () => {
	return gulp.src(src.png)
		.pipe(	plumber()	)
		.pipe(	gulp.dest(pro.img)	);
});

// Sitemap
gulp.task('sitemap', function () {
	gulp.src('./production/**/*.html')
	.pipe(	sitemap(siteURL)	)
	.pipe(	gulp.dest(pro.html)	);
});


// Production Build Task
gulp.task( 'pro', ['pro_pug', 'pro_stylus', 'pro_js', 'pro_jpeg', 'pro_png', 'sitemap'], () => {});




// FTP Deploy Task
gulp.task( 'deploy', () => {

var connection = ftp.create( {
} );

var globs = [
	'production/**' // upload everything in the production folder
];

return gulp.src( globs, { base: '../production/', buffer: false } )

} );


// Production Build and Deploy
gulp.task( 'pd', () => {
	runSequence( 'pro', 'deploy' );
});

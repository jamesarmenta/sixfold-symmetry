var	 gulp = require('gulp'),
sass = require('gulp-sass'),
concat = require('gulp-concat'),
strip = require('gulp-strip-comments'),
jade = require('jade'),
gulpJade = require('gulp-jade'),
browserSync = require('browser-sync'),
livereload = require('gulp-livereload')
reload = browserSync.reload;

gulp.task('default', ['scss','js','jade','sync'], function(){
});

//WATCH
gulp.task('watch', function() {
	livereload();
	// Watch .js files
	gulp.watch('./js/*.js', ['js']);
	// Watch .scss files
	gulp.watch('./scss/*.scss', ['scss']);
	// Watch .jade files
	gulp.watch('./**/*.jade', ['jade']);
});

//SYNC
gulp.task('sync', function() {
	browserSync({
		//logConnections: false,
		//logFileChanges: false,
		notify: false,
		open: false,
		server: {
			baseDir: "./public/"
		}
	});
	gulp.watch('./**/*.jade', ['jade', reload]);
	gulp.watch('./scss/*.scss', ['scss', reload]);
	gulp.watch('./js/*.js', ['js', reload]);
});

//FILE TYPES

//SASS
gulp.task('scss', function () {
	return gulp.src('./scss/**/*.scss')
	.pipe(sass().on('error', sass.logError))
	.pipe(concat('main.css'))
	.pipe(gulp.dest('./public/css'));
});

//JADE
gulp.task('jade', function () {
	return gulp.src('./**/*.jade')
	.pipe(gulpJade({
		jade: jade,
		pretty: true
	}))
	.pipe(gulp.dest('public/'));
});

//ASSETS
gulp.task('assets', function() {
    gulp.src('./assets/*.{jpg,png,svg}')
    .pipe(gulp.dest('./public/assets/'));
});

//JAVSCRIPT
gulp.task('js', function () {
	return gulp.src('./js/**/*.js')
	// .pipe(strip())
	.pipe(gulp.dest('./public/js/'));
});
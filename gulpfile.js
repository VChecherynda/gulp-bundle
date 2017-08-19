var gulp         = require('gulp'), 
	sass         = require('gulp-sass'), 
	browserSync  = require('browser-sync'), 
	concat       = require('gulp-concat'), 
	uglify       = require('gulp-uglifyjs'), 
	babel		 = require('gulp-babel'),
	gutil		 = require('gulp-util'),
	cssnano      = require('gulp-cssnano'), 
	rename       = require('gulp-rename'),
	del          = require('del'),
	imagemin     = require('gulp-imagemin'),
	pngquant     = require('imagemin-pngquant'),
	cache        = require('gulp-cache'),
	sourcemaps   = require('gulp-sourcemaps'),
	autoprefixer = require('gulp-autoprefixer'),
	htmlbuild    = require('gulp-htmlbuild');


var path = {
	src: {
		libsCss: ['src/scss/libs.scss'],
		libsJs: [
			'src/libs/jquery/dist/jquery.min.js', // For js plugins
			'src/libs/slick-carousel/slick/slick.js',
		],
		html: ['src/*.html'],
		scss: ['src/scss/*.scss','!src/scss/libs.scss'],
		js: ['src/js/**/*.js','!src/js/**/*.min.js']
	},
	build: {
		filesCss: [
			'src/css/libs.min.css',
			'src/css/style.min.css'
		],
		filesJs: [
			'src/js/minify/libs.min.js',
			'src/js/minify/scripts.min.js'
		],
		fonts: ['src/fonts/**/*']
	}
}

gulp.task('css-libs', function(){
	return gulp.src(path.src.libsCss)
		.pipe(sass().on('error', sass.logError))
		.pipe(cssnano())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('src/css'))
});

gulp.task('sass', function(){ 
	return gulp.src(path.src.scss) //Input scss files
		.pipe(sourcemaps.init())
			.pipe(sass().on('error', sass.logError)) // Scss into css files
			.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Vendor prefixes
			.pipe(cssnano())
			.pipe(rename({suffix: '.min'}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('src/css')) // Output  folder of css files 
		.pipe(browserSync.reload({stream: true})) // Reload pages when scss is changes
});

gulp.task('browser-sync', function() { 
	browserSync({ 
		server: { // Params of server
			baseDir: 'src'// Basedir - src
		},
		open: false, // Disable server opening when gulp is starting
		notify: false // Disable notifications
	});
});

gulp.task('js-libs', function(){
	return gulp.src(path.src.libsJs)
		.pipe(uglify())
		.pipe(concat('libs.min.js'))
		.pipe(gulp.dest('src/js/minify'))
});

gulp.task('scripts', function() { 
	return gulp.src('src/js/*.js')
		.pipe(sourcemaps.init())
			.pipe(babel({
				presets: ['env']
			}).on('error', function(err) {
	            const message = err.message || '';
	            const errName = err.name || '';
	            const codeFrame = err.codeFrame || '';
	            gutil.log(gutil.colors.red.bold('[JS babel error]')+' '+ gutil.colors.bgRed(errName));
	            gutil.log(gutil.colors.bold('message:') +' '+ message);
	            gutil.log(gutil.colors.bold('codeframe:') + '\n' + codeFrame);
	            this.emit('end');
	        }))
			.pipe(uglify()) // compress JS file
			.pipe(concat('scripts.min.js')) // concatination in new file scripts.min.js
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('src/js/minify')) // Output folder
		.pipe(browserSync.reload({stream: true}))
});

gulp.task('watch', ['browser-sync','css-libs','sass','js-libs','scripts'], function() {
	gulp.watch(path.src.scss, ['sass']); // watching for scss files
	gulp.watch(path.src.js,['scripts']);   // watching for js files
	gulp.watch(path.src.html, browserSync.reload); // watching for html files
});


// DIST mode


gulp.task('clean', function() {
	return del.sync(['dist/**', '!dist'], {force:true}); // Delete dist folder before build
});

gulp.task('img', function() {
	return gulp.src('src/img/**/*') // Input img folder 
		.pipe(cache(imagemin({  // Compress with best configuration with cashing
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('dist/img')); // Output dist folder
});

gulp.task('js-build', function(){
	return gulp.src(path.build.filesJs)
		.pipe(concat('scripts.min.js'))
		.pipe(gulp.dest('./dist/js'))
});

gulp.task('css-build', function(){
	return gulp.src(path.build.filesCss)
		.pipe(concat('styles.min.css'))
		.pipe(gulp.dest('./dist/css'))
});

gulp.task('html', function(){
	return gulp.src(['./src/*.html'])
		.pipe(htmlbuild({
			js: htmlbuild.preprocess.js(function (block) {
				block.write('js/scripts.min.js');
        		block.end();
			}),
			css: htmlbuild.preprocess.css(function (block) {
				block.write('css/styles.min.css');
        		block.end();
			})
		}))
		.pipe(gulp.dest('./dist'));
});

gulp.task('clear', function (callback) {
	return cache.clearAll();
})

gulp.task('build', ['clean','img','css-build','js-build','html'], function() {

	var buildFonts = gulp.src(path.build.fonts) 
	.pipe(gulp.dest('dist/fonts'));

});

gulp.task('default', ['watch']);

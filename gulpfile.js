var gulp = require("gulp"),
	jade = require('gulp-jade'),
	prettify = require('gulp-prettify'),
	wiredep = require('wiredep').stream,
	useref = require('gulp-useref'),
	uglify = require('gulp-uglify'),
	clean = require('gulp-clean'),
	gulpif = require('gulp-if'),
	filter = require('gulp-filter'),
	size = require('gulp-size'),
	imagemin = require('gulp-imagemin'),
	concatCss = require('gulp-concat-css'),
	minifyCss = require('gulp-minify-css'),
	browserSync = require('browser-sync'),
	gutil = require('gulp-util'),
	ftp = require('vinyl-ftp'),
	reload = browserSync.reload,
	autoprefixer = require('gulp-autoprefixer'),
	uncss = require('gulp-uncss'),
	sass = require('gulp-sass'),
	gcallback = require('gulp-callback');
	// coffee = require('gulp-coffee');

// превращаем jade в html
gulp.task('jade', function () {
	gulp.src('app/templates/pages/*.jade')
	.pipe(jade({
		pretty: true
	}))
	.on('error', log)
	.pipe(gulp.dest('app/'))
	.pipe(reload({stream: true}));
});

// Компилируем scss в css
gulp.task('scss', function () {
	gulp.src('app/scss/main.scss')
	.pipe(sass())
	.on('error', log)
	.pipe(autoprefixer({
		browsers: ['last 2 versions', 'ie 8', 'ie 9'],
		cascade: false
	}))
	.pipe(gulp.dest('app/css'))
	.pipe(reload({stream: true}));
});
/*
// превращаем scss в css в папке css/all, затем сливаем в один main.css
gulp.task('scss', function() {
	gulp.src('app/scss/main.scss')
		.pipe(sass({
			noCache: true,
			style: "expanded",
			lineNumbers: true,
			errLogToConsole: true
		}))
		.on('error', log)
		.pipe(autoprefixer({
			browsers: ['last 2 versions', 'ie 8', 'ie 9'],
			cascade: false
		}))
		.pipe(gulp.dest('app/css'))
		/*
		.pipe(gulp.dest('app/css/all'))
		.pipe(gcallback(function() {
			gulp.src('app/css/all/*.css')
				.pipe(concatCss("main.css"))
				.pipe(gulp.dest('app/css'));
		}))

		.pipe(reload({stream: true}));
});
*/
/*
// отдельная задача для старых ие, чтобы не сливался вместе со всеми
gulp.task('scss_oldIe', function() {
	gulp.src('app/scss/oldIe/*.scss')
		.pipe(sass({
			noCache: true,
			style: "expanded",
			lineNumbers: true,
			errLogToConsole: true
		}))
		.on('error', log)
		.pipe(gulp.dest('app/css'));
});
*/

// gulp.task('coffee', function() {
//   gulp.src('app/coffee/**/*.coffee')
//     .pipe(coffee({bare: true}).on('error', gutil.log))
//     .pipe(gulp.dest('app/js'));
// });

// сервер
gulp.task('server', ['jade', 'scss'], function () {
	browserSync({
		notify: false,
		port: 9000,
		server: {
			baseDir: 'app'
		}
	});
});



// wiredep
gulp.task('wiredep', function() {
	gulp.src('app/templates/common/*.jade')
		.pipe(wiredep({
			ignorePath: /^(\.\.\/)*\.\./
		}))
		.pipe(gulp.dest('app/templates/common/'))
});

// watch
gulp.task('watch', function () {
	gulp.watch('app/templates/**/*.jade', ['jade']);
	gulp.watch('app/scss/**/*.scss', ['scss']);
	// gulp.watch('app/coffee/**/*.coffee', ['coffee']);
	//gulp.watch('app/scss/oldIe/*.scss', ['scss_oldIe']);
	gulp.watch('bower.json', ['wiredep']);
	gulp.watch([
		'app/js/**/*.js',
		'app/css/*.css',
		'app/*.html'
	]).on('change', reload);
});


// по команде gulp происходит всё что выше
gulp.task('default', ['server', 'watch']);


// сообщение возникающее при ошибке
var log = function (error) {
  console.log([
	'',
	"----------ERROR MESSAGE START----------",
	("[" + error.name + " in " + error.plugin + "]"),
	error.message,
	"----------ERROR MESSAGE END----------",
	''
  ].join('\n'));
  this.end();
}

//чистим папку dist
gulp.task('clean', function() {
	return gulp.src('dist')
		.pipe(clean());
});

// минифицируем css js кладём в дист
gulp.task('useref', function () {
	var assets = useref.assets();
	return gulp.src('app/*.html')
		.pipe(assets)
		.pipe(gulpif('*.js', uglify()))
		.pipe(gulpif('*.css', minifyCss({compatibility: 'ie8'})))
		.pipe(assets.restore())
		.pipe(useref())
		.pipe(gulp.dest('dist'));
});

// шрифты в dist
gulp.task('fonts', function() {
	gulp.src('app/fonts/*')
		.pipe(filter(['*.eot','*.svg','*.ttf','*.woff','*.woff2']))
		.pipe(gulp.dest('dist/fonts/'))
});

// картинки в dist
gulp.task('images', function () {
	return gulp.src('app/img/**/*')
		.pipe(imagemin({
			progressive: true,
			interlaced: true
		}))
		.pipe(gulp.dest('dist/img'));
});

// доп файлы в dist

gulp.task('php', function () {
	return gulp.src([
		'app/php/**/*',
	]).pipe(gulp.dest('dist/php'));
});

gulp.task('uploads', function () {
	return gulp.src([
		'app/uploads/.htaccess',
		'app/uploads/.gitignore'
	]).pipe(gulp.dest('dist/uploads'));
});

gulp.task('extras', ['php', 'uploads'] ,function () {
	return gulp.src([
		'app/*.*',
		'app/.htaccess',
		'!app/*.html'
	]).pipe(gulp.dest('dist'));
});

// сборка
gulp.task('dist', ['useref', 'images', 'fonts', 'extras'], function () {
	return gulp.src('dist/**/*').pipe(size({title: 'build'}));
});

// удаляем лишний css
gulp.task('uncss', function () {
	return gulp.src('dist/css/*.css')
		.pipe(uncss({
			html: ['dist/*.html']
		}))
		.pipe(gulp.dest('dist/css'));
});

// ОСНОВНАЯ команда для сборки gulp-build
gulp.task('build', ['clean', 'jade'], function () {
	gulp.start('dist')
		.start('uncss');
});

// сервер для dist gulp server-dist
gulp.task('server-dist', function() {
	browserSync({
		notify: false,
		port: 9000,
		server: {
			baseDir: 'dist'
		}
	});
});

// deploy на хостинг gulp deply
gulp.task('deploy', function() {
	var conn = ftp.create({
		host: '',
		user: '',
		password: '',
		parallel: 10,
		log: gutil.log
	});

	var globs = [
		'dist/**/*'
	];

	return gulp.src(globs, { base: 'dist/', buffer: false})
		.pipe(conn.dest(''));
});

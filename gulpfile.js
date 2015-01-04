var gulp = require('gulp');
var concat = require('gulp-concat');
var rimraf = require('gulp-rimraf');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var transpileES6 = require('gulp-6to5');
var del = require('del');

var karma = require('karma').server;

var paths = {
  src: ['src/**/*'],
  dest: 'dist',
  vendor: ['vendor'],
  example: 'template/'
};

gulp.task('compile',['clean'], function () {
  return gulp.src('src/*.js')
  .pipe(concat('ngSails.js'))
  .pipe(transpileES6())
  .pipe(gulp.dest('dist'));
});

gulp.task('example',['clean','compile'],function(){
  return gulp.src(['vendor/angular/angular.js','vendor/socket.io-client/dist/socket.io.js','dist/ngSails.js'])
  .pipe(gulp.dest('template/app'));
})

gulp.task('dev',['clean'],function(){
  return gulp.src(paths.src)
    .pipe(concat('angular-sails.js'))
    .pipe(gulp.dest(paths.dest));
});

gulp.task('examples',['clean'],function(){
  return gulp.src(paths.src)
  .pipe(concat('angular-sails.js'))
  .pipe(gulp.dest(paths.example));
});

gulp.task('build',['clean'],function(){
  return gulp.src(paths.src)
  .pipe(concat('angular-sails.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest(paths.dest));
});

gulp.task('clean',function(cb){
  del(paths.dest,cb);
});

gulp.task('test',['dev'], function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

//gulp.task('default',['dev','build']);

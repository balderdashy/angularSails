var gulp = require('gulp');
var concat = require('gulp-concat');
var rimraf = require('gulp-rimraf');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var del = require('del');

var karma = require('karma').server;

var paths = {
  src: ['src/**/*'],
  dest: 'dist',
  vendor: ['vendor'],
  example: 'example/assets/components/angular-sails'
};


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

gulp.task('default',['dev','build']);

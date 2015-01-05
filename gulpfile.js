var gulp = require('gulp');
var concat = require('gulp-concat');
var rimraf = require('gulp-rimraf');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var transpileES6 = require('gulp-6to5');
var del = require('del');
var wrap = require("gulp-wrap");

var karma = require('karma').server;

var paths = {
  src: [
    'src/Utils.js',
    'src/Body.js',
    'src/Headers.js',
    'src/Request.js',
    'src/Response.js',
    'src/HttpRequest.js',
    'src/SocketRequest.js',
    'src/SocketResponse.js',
    'src/SocketBackend.js',
    'src/NgSails.js'
  ],
  dest: 'dist',
  vendor: ['vendor'],
  example: 'template/'
};

gulp.task('compile:es5',['clean'], function () {
  return gulp.src(paths.src)
  .pipe(transpileES6({
    modules: 'ignore',
    blacklist: ['useStrict']
  }))
  .pipe(concat('ngSails.js'))
  .pipe(ngAnnotate())
  // .pipe(uglify({
  //   minify: true
  // }))
  .pipe(wrap('(function(angular,io){\n <%= contents %>  \n})(angular,window.io)'))
  .pipe(gulp.dest('dist'))
  .pipe(gulp.dest('template/app'))
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

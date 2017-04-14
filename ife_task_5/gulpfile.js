/* jshint ignore: start */
var gulp = require('gulp');
var less = require('gulp-less');
var bSync = require('browser-sync');

// 预编译
gulp.task('tocss', function() {
    gulp.src(['src/less/*.less', '!src/less/def.less'])
        .pipe(less())
        .pipe(gulp.dest('dist/css/'));
});

// 重新加载浏览器
gulp.task('reload', ['tocss'], bSync.reload);

// 打开服务器并监听文件变化
gulp.task('file-watch', ['reload'], function() {
    bSync({
        server: {
            baseDir: './'
        }
    });

    gulp.watch('src/less/*.less', ['tocss']); //兼容less修改
    gulp.watch(['index.html', 'dist/**/*.*'], ['reload']);
});
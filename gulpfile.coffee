# 引入package
gulp = require('gulp')
del = require('del')
uglify = require('gulp-uglify')
minifyCss = require('gulp-minify-css')
minifyhtml=require('gulp-minify-html')
unCss = require('gulp-uncss')
jade = require('gulp-jade')
browserSync = require('browser-sync').create()
runSequence = require('run-sequence')
autoprefixer = require('gulp-autoprefixer');
#rev = require('gulp-rev')
#revCollector = require('gulp-rev-collector')
#获取参数部分
baseDir = './dist/'
baseSouceseDir='./src/**/'
#构建任务
gulp.task('default',(callback)->
   runSequence(['clean'],['build'],['serve','watch'],callback)
)

gulp.task('build',(callback)->
   runSequence(['copy'],['minCss','minJs','jade'],callback)
)

gulp.task('clean',(callback)->
   del([baseDir],callback)
)

gulp.task('copy',->
      gulp.src('*.*')
      .pipe(gulp.dest(baseDir))
)

gulp.task('minJs',->
     gulp.src(baseSouceseDir+'*.js')
     .pipe(uglify())
     .pipe(gulp.dest(baseDir))
)

gulp.task('jade',->
     gulp.src(baseSouceseDir+'*.jade')
     .pipe(jade({petty: true}))
     .pipe(minifyhtml({empty: true}))
     .pipe(gulp.dest(baseDir));
)

gulp.task('minCss',->
    gulp.src("./src/**/*.css")
    .pipe(minifyCss())
    .pipe(unCss({
        ignore: ['/active/']
    }))
    .pipe(gulp.dest(baseDir))
)

gulp.task('concat',->
   gulp.src("./src/*.js")
   .pipe(concat("all.js"),{newLine:';\n'})
   .pipe(gulp.dest(baseDir))
)

gulp.task('serve',->
    browserSync.init({
        server:{
            baseDir:baseDir
        }
        port : 7411
    })
)

gulp.task('watch',->
   gulp.watch(baseSouceseDir+'*.*',['reload'])
)

gulp.task("reload",(callback)->
     runSequence(['build'],['reload-browser'],callback)
)

gulp.task('reload-browser',->
    browserSync.reload();
)
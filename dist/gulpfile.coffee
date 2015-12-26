# 引入package
gulp = require('gulp')
del = require('del')
uglify = require('gulp-uglify')
minifyCss = require('gulp-minify-css')
spriter = require('gulp-css-spriter')
minifyhtml=require('gulp-minify-html')
unCss = require('gulp-uncss')
jade = require('gulp-jade')
browserSync = require('browser-sync').create()
runSequence = require('run-sequence')
autoprefixer = require('gulp-autoprefixer')
base64 = require('gulp-base64')
concat = require('gulp-concat')
rev = require('gulp-rev')
revCollector = require('gulp-rev-collector')
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
#清理目录
gulp.task('clean',(callback)->
   del([baseDir],callback)
)
#复制文件
gulp.task('copy',->
      gulp.src('*.*')
      .pipe(gulp.dest(baseDir))
)
#JS操作
gulp.task('minJs',->
     gulp.src(baseSouceseDir+'*.js')
     .pipe(uglify())
     .pipe(gulp.dest(baseDir))
)
#生成HTML
gulp.task('jade',->
     gulp.src(baseSouceseDir+'*.jade')
     .pipe(jade({petty: true}))
     .pipe(minifyhtml({empty: true}))
     .pipe(gulp.dest(baseDir));
)
#CSS操作
#编译
gulp.task('minCss',->
    gulp.src(baseSouceseDir+'*.css"')
    .pipe(spriter({
        spriteShet:baseDir+'images/sprite.png'
        pathToSpriteSheetFromCSS:'../images/sprite.png'
    }))
    .pipe(minifyCss())
    .pipe(unCss({
        ignore: ['/active/']
    }))
    .pipe(rev())
    .pipe(revCollector())    
    .pipe(gulp.dest(baseDir))
)

#合并
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

gulp.task('base64URi',->
      gulp.src('./src/*.css')
      .pipe(base64({
           baseDir:baseDir
           extensions: ['svg', 'png', /\.jpg#datauri$/i]
           exclude: [/\.server\.(com|net)\/dynamic\//, '--live.jpg']
           maxImageSize: 8*1024
           debug:true 
      }))
      .pipe(concat('main.css'))
      .pipe(gulp.dest(baseDir+'css'))
)
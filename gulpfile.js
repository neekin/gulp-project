/*eslint-disable no-console */
var gulp = require("gulp");
var $ = require("gulp-load-plugins")(gulp);
var browserSync = require("browser-sync");
var del = require("del");
var yaml = require("js-yaml").safeLoad;
var sequence = require("run-sequence");
var fs = require("fs");
// var moment = require("moment");
// var highlight = require("highlight.js").highlightAuto;
var config = {
    CompileDir: "build", //开发编译目录
    SourceDir: "src", //源码目录
    DeploymentDir: "production" //编译到生产目录
};
var path = require("path");


//默认开发模式
gulp.task("default", ["dev"], function (cb) {
    return sequence(["serve", "watch"], cb);
});

gulp.task("clean", function () {
    return del([config.CompileDir, config.DeploymentDir, config.SourceDir + "/_md2html/*.*", config.SourceDir + "/includes/*.*", config.SourceDir + "/pagelist/*.*", config.SourceDir + "posts/*.*"]);
});
gulp.task("serve", function () {
    return browserSync.init({
        server: {
            baseDir: config.CompileDir
        },
        port: 8080,
        localhost: "127.0.0.1"
    });
});

gulp.task("dev", ["delCompileDir"], function (cb) {
    return sequence("html", "pug", "sass", "js", "images", "jsx", cb);
});



gulp.task("delCompileDir", function (cb) {
    return del([config.CompileDir], cb);
});

gulp.task("reload", function (cb) {
    return sequence(["dev"], ["reload-browser"], cb);
});

gulp.task("reload-browser", function () {
    return browserSync.reload();
});

gulp.task("watch", function () {
    return gulp.watch([config.SourceDir + "/**/*.*", "!" + config.SourceDir + "/_**/*.*"], ["reload"]);
});


//compile jade
gulp.task("pug", function () {
    return gulp.src([config.SourceDir + "/**/*.{jade,pug}", "!" + config.SourceDir + "/_**/*.*"])
        .pipe($.plumber())
        .pipe($.changed(config.CompileDir, {
            extension: ".html"
        }))
        .pipe($.pug({
            pretty: true
        }))
        // .pipe(gulp.src(config.CompileDir + "/**/*.json"))
        // .pipe($.revCollector({ replaceReved: true }))
        .pipe(gulp.dest(config.CompileDir));
});

//compile html
gulp.task("html", function () {
    return gulp.src([config.SourceDir + "/**/*.{html,json}", "!" + config.SourceDir + "/_**/*.{html,json}"])
        .pipe(gulp.dest(config.CompileDir));
});

//compile sass
gulp.task("sass", function () {
    return gulp.src([config.SourceDir + "/**/*.{css,scss}", "!" + config.SourceDir + "/_**/_*.*"])
        .pipe($.plumber())
        .pipe($.changed(config.CompileDir, {
            extension: ".css"
        }))
        .pipe($.sass())
        .pipe($.autoprefixer([
            "Android 2.3",
            "Android >= 4",
            "Chrome >= 20",
            "Firefox >= 24",
            "Explorer >= 8",
            "iOS >= 6",
            "Opera >= 12",
            "Safari >= 6"
        ]))
        // .pipe($.rev())
        // .pipe($.revCollector({ replaceReved: true }))
        .pipe(gulp.dest(config.CompileDir));
    // .pipe($.rev.manifest())
    //.pipe(gulp.dest(config.CompileDir + "/cssversions"));
});

//compile jsx
gulp.task("jsx", function () {
    return gulp.src(config.SourceDir + "/**/*.jsx")
        .pipe($.plumber())
        .pipe($.changed(config.CompileDir, {
            extension: ".js"
        }))
        .pipe($.react())
        .pipe(gulp.dest(config.CompileDir));
});

//compile js
gulp.task("js", function () {
    return gulp.src(config.SourceDir + "/**/*.js")
        .pipe($.changed(config.CompileDir, {
            extension: ".js"
        }))
        .pipe(gulp.dest(config.CompileDir));
});

gulp.task("library",function(){
     return gulp.src()
});

//images
gulp.task("images", function () {
    return gulp.src(config.SourceDir + "/**/*.{png,jpg,gif,svg}")
        .pipe($.plumber())
        .pipe($.changed(config.CompileDir))
        .pipe(gulp.dest(config.CompileDir));
});


//用于生产环境
gulp.task("deploy", ["delDeploymentDir","dev"], function () {
    return sequence(["imgmin"], ["cssmin"], ["jsmin"], ["htmlmin"]);
});
gulp.task("delDeploymentDir", function (cb) {
    return del([config.DeploymentDir], cb);
});


//压缩css
gulp.task("cssmin", function () {
    return gulp.src(config.CompileDir + "/**/*.{css,json}")
        // .pipe($.base64({
        //     baseDir: config.CompileDir,
        //     extensions: ["jpg", "jpeg", "png", "gif"],
        //     exclude: [/\.server\.(com|net)\/dynamic\//, "--live.jpg"],
        //     maxImageSize: 2 * 1024, // bytes 
        //     debug: true
        // }))
        .pipe($.css())
        .pipe($.rev())
        .pipe($.revCollector({
            replaceReved: true
        }))
        .pipe(gulp.dest(config.DeploymentDir))
        .pipe($.rev.manifest())
        .pipe(gulp.dest(config.CompileDir + "/version/css"));
});


//压缩html
gulp.task("htmlmin", function () {
    return gulp.src(config.CompileDir + "/**/*.{html,json}")
        .pipe($.revCollector({
            replaceReved: true
        }))
        .pipe($.htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest(config.DeploymentDir));
});


//压缩图片
gulp.task("imgmin", function () {
    return gulp.src(config.CompileDir + "/**/*.{png,jpg,gif,svg}")
        .pipe($.imagemin({})) //开发环境用起来太慢 打包生产环境时使用
        .pipe($.rev())
        .pipe(gulp.dest(config.DeploymentDir))
        // .pipe(upload({qn: qnOptions}))
        .pipe($.rev.manifest())
        .pipe(gulp.dest(config.CompileDir + "/version/images"));
});


//压缩js

gulp.task("jsmin", function () {
    return gulp.src(config.CompileDir + "/**/*.{js,json}")
        .pipe($.plumber())
        .pipe($.revCollector({
            replaceReved: true
        }))
        .pipe($.uglify())
        .pipe($.rev())
        .pipe(gulp.dest(config.DeploymentDir))
        .pipe($.rev.manifest())
        .pipe(gulp.dest(config.CompileDir + "/version/js"));
});

//雪碧图
gulp.task("sprite", ["deploy"], function () {
    // return gulp.src(config.CompileDir + "/**/*.css")
    //     // .pipe($.cssSpriter({
    //     //     // 生成的spriter的位置
    //     //     "spriteSheet": config.CompileDir + "/images/sprite.png",
    //     //     // 生成样式文件图片引用地址的路径
    //     //     // 如下将生产：backgound:url(../images/sprite20324232.png)
    //     //     "pathToSpriteSheetFromCSS": "/images/sprite.png"
    //     // }))
    //     .pipe($.spriter({
    //         sprite: "sprite.png",
    //         slice: "./" + config.CompileDir + "/images/",
    //         outpath: "./" + config.CompileDir + "/images/"
    //     }))
    //     //产出路径
    //     .pipe(gulp.dest(config.CompileDir));

    var timestamp = +new Date();
    var spritepath = "./" + config.DeploymentDir + "/images/"+"sprite"+timestamp+".png";
    return gulp.src(config.DeploymentDir + "/**/*.css")
        .pipe($.spriter({
            spriteSheet:spritepath,
            pathToSpriteSheetFromCSS:"../images/"+"sprite"+timestamp+".png",
             spritesmithOptions: {
                padding: 10
            }
        }))
        .pipe($.base64())
        .pipe(gulp.dest("."));
});
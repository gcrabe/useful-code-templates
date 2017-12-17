"use strict";

var gulp 		= require("gulp");
var stylus 		= require("gulp-stylus");
var sourcemaps 	= require("gulp-sourcemaps");
var del 		= require("del");
var runSequence = require("run-sequence");
var newer 		= require("gulp-newer");
var browserSync = require("browser-sync").create();
var notify 		= require("gulp-notify");
var combiner 	= require("stream-combiner2").obj;
var gulpIf 		= require("gulp-if");
var eslint 		= require("gulp-eslint");
var through2 	= require("through2").obj;
var fs 			= require("fs");
var debug		= require("gulp-debug");
var resolver 	= require("stylus").resolver;

var isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == "development";

gulp.task("styles", function() {
	return gulp.src("frontend/styles/main.styl")
		.pipe(gulpIf(isDevelopment, sourcemaps.init()))
		.pipe(stylus({
			define: {
				url: resolver()
			}
		}))
		.pipe(gulpIf(isDevelopment, sourcemaps.write()))
		.pipe(gulp.dest("public"));
});

gulp.task("clean", function() {
	return del("public");
});

gulp.task("assets", function() {
	return gulp.src("frontend/assets/**")
		.pipe(newer("public"))
		.pipe(gulp.dest("public"));
});

gulp.task("lint", function() {
	var eslintResults = {},
		cacheFilePath = process.cwd() + "/tmp/lintCache.json";

	try {
		eslintResults = JSON.parse(fs.readFileSync(cacheFilePath));
  	} catch (e) {
  		console.log(e.message);
  	}

	return gulp.src("frontend/**/*.js", { read: false })
		.pipe(debug({ title: "src" }))
		.pipe(gulpIf(
			function(file) {
				return eslintResults[file.path] 
					&& eslintResults[file.path].mtime == file.stat.mtime.toJSON();
			},
			through2(function(file, enc, callback) {
				file.eslint = eslintResults[file.path].eslint;
				callback(null, file);
			}),
			combiner(
				through2(function(file, enc, callback) {
					file.contents = fs.readFileSync(file.path);
					callback(null, file);
				}),
				eslint(),
				debug({ title: "eslint" }),
				through2(function(file, enc, callback) {
					eslintResults[file.path] = {
						eslint: file.eslint,
						mtime: file.stat.mtime
					};
					callback(null, file);
				})
			)
		))
		.pipe(eslint.format())
		.on("end", function() {
			fs.writeFileSync(cacheFilePath, JSON.stringify((eslintResults)));
		});
});

gulp.task("build", function(callback) {
	runSequence("clean", ["styles", "assets"], callback);
});

gulp.task("watch", function() {
	gulp.watch("frontend/styles/**/*.*", ["styles"]);
	gulp.watch("frontend/assets/**/*.*", ["assets"]);
});

gulp.task("serve", function() {
	browserSync.init({
		server: "public"
	});

	browserSync.watch("public/**/*.*").on("change", browserSync.reload);
});

gulp.task("dev", function(callback) {
	runSequence("build", ["watch", "serve"], callback);
});

gulp.task("default", function(callback) {
	runSequence("clean", ["styles", "assets"], callback);
});

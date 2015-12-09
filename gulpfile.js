var gulp = require('gulp');
var jasmine = require('gulp-jasmine');
var tsc = require('gulp-tsc');

gulp.task('build_tests', function () {
    gulp.src('./spec/*.ts').pipe(tsc({
        "module": "commonjs",
        "noImplicitAny": true,
        "preserveConstEnums": true,
        "target": "es5",
        "declaration": true,
        "listFiles": true,
        "diagnostics": true,
        "noResolve": false,
        "suppressImplicitAnyIndexErrors": true,
        "noEmitOnError": true,
        "version": "1.5.3",
        "experimentalDecorators":true,
        "emitDecoratorMetadata":true
    })).pipe(gulp.dest('./spec'));
});

gulp.task('test', ['build_tests'], function () {
    gulp.src(['./spec/**/*_spec.js'])
        .pipe(jasmine({verbose: false, includeStackTrace: true}));
});

gulp.task('build', function () {
    gulp.src('./src/**/*.ts').pipe(tsc({
        "module": "commonjs",
        "noImplicitAny": true,
        "preserveConstEnums": true,
        "target": "es5",
        "declaration": true,
        "listFiles": true,
        "diagnostics": true,
        "noResolve": false,
        "suppressImplicitAnyIndexErrors": true,
        "noEmitOnError": true,
        "version": "1.7.3",
        "emitDecoratorMetadata":true,
        "experimentalDecorators":true

    })).pipe(gulp.dest('./dist'));
});
const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('build', () =>
    gulp.src('src/**/*.ts')
        .pipe(babel())
        .pipe(gulp.dest('dist/src/'))
);

gulp.task('watch', () => {
    gulp.watch('src/**/*.ts', gulp.series('build'));
 });
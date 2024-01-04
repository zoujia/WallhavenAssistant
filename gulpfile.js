const { src, dest, series } = require('gulp');
const del = require('delete');
const uglify = require('gulp-uglify');
const cleanCss = require('gulp-clean-css');

function cleanOldFiles(cb) {
    del(['dist'], cb);
}

const cleanCssConfig = {
    rebase: false
};

function minCSS () {
    return src(['css/*.css'])
        .pipe(cleanCss(cleanCssConfig))
        .pipe(dest('dist/css'));
}

function minJS () {
    return src(['js/content-script.js', 'js/popup.js', 'js/service-worker.js'])
        .pipe(uglify({
            compress: {
                drop_console: true
            }
        }))
        .pipe(dest('dist/js'));
}

function syncMainFiles () {
    return src(['manifest.json', 'popup.html', 'css/images/*.*', 'icons/*.*', 'images/*.*', 'js/jquery.1.12.4.min.js'], { cwdbase: true })
        .pipe(dest('dist/'));
}

exports.default = series(cleanOldFiles, syncMainFiles, minJS, minCSS);

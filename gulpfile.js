const { src, dest, watch, parallel, series } = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const autoPrefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const del = require('del');
const imagemin = require('gulp-imagemin');
const { gifsicle, mozjpeg, optipng, svgo } = require('gulp-imagemin');

function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'app/'
    }
  })
}

function styles(){
  return src('app/scss/style.scss')
  .pipe(scss({outputStyle: 'expanded'}))
  .pipe(concat('style.min.css'))
  .pipe(autoPrefixer({
    overrideBrowserslist: ['last 10 versions'],
    grid: true
  }))
  .pipe(dest('app/css'))
  .pipe(browserSync.stream())
}

function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'app/js/main.js'
  ])
  .pipe(concat('main.min.js'))
  .pipe(uglify())
  .pipe(dest('app/js'))
  .pipe(browserSync.stream())
}


function images(){
  return src('app/images/**/*.*')
  .pipe(imagemin([
    gifsicle({ interlaced: true }),
    mozjpeg({ quality: 75, progressive: true }),
    optipng({ optimizationLevel: 5 }),
    svgo({
      plugins: [
        {
          name: 'removeViewBox',
          active: true
        },
        {
          name: 'cleanupIDs',
          active: false
        }
      ]
    })
]))
  .pipe(dest('dist/images'))
}


function build() {
  return src([
    'app/**/*.html',
    'app/css/style.min.css',
    'app/js/main.min.js',
  ], {base: 'app'})
  .pipe(dest('dist'))
}

function cleanDist() {
  return del('dist')
}

function watching(){
  watch(["app/scss/**/*.scss"], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(["app/**/*.html"]).on("change", browserSync.reload);
}


exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.images = images;
exports.cleanDist = cleanDist;
exports.build = series(cleanDist, images, build);


exports.watching = watching;
exports.default = parallel(styles, scripts , browsersync, watching)
const { series, src, dest, watch } = require("gulp");

// Gulp Plugins
const sass = require("gulp-sass");
const useref = require("gulp-useref");
const uglify = require("gulp-uglify");
const gulpIf = require("gulp-if");
const imagemin = require("gulp-imagemin");
const cache = require("gulp-cache");
const del = require("del");

// Browsersync
const browserSync = require("browser-sync").create();

function compileSass(cb) {
  cb();
  return (
    src("src/sass/index.scss")
      .pipe(sass())
      // Prevent Gulp from crashing on error.
      .on("error", function(err) {
        console.log(err.toString());

        this.emit("end");
      })
      .pipe(dest("src/sass"))
      .pipe(browserSync.stream())
  );
}

function minifyJs() {
  return (
    src("src/*.html")
      .pipe(useref())
      // Minifies only if it's a JavaScript file.
      .pipe(gulpIf("*.js", uglify()))
      .pipe(dest("dist"))
  );
}
// Copy Index.css into dist folder
function css() {
  return src("src/sass/*.css")
  .pipe(dest("dist/sass"))
}

function images() {
  return (
    src("src/images/*.png")
      // Cache images that run through imagemin.
      .pipe(cache(imagemin()))
      .pipe(dest("dist/images"))
  );
}

function fonts() {
  return src("src/fonts/**/*").pipe(dest("dist/fonts"));
}

function watchFiles() {
  // Start Browsersync
  browserSync.init({
    server: {
      baseDir: "src"
    }
  });

  // Watch for SCSS and Sass file changes.
  watch("src/**/*.+(sass|scss)", compileSass);
  // Watch for All other file changes, excluding sass/scss/css in the src/ directory and reload browser.
  watch(["src/**/*", "!src/**/*.+(sass|scss|css)"]).on(
    "change",
    browserSync.reload
  );
}

// Clean out the dist folder.
function cleanDist(cb) {
  cb();
  return del.sync("dist");
}

exports.build = series(
  cleanDist,
  compileSass,
  minifyJs,
  css,
  images,
  fonts,
);
exports.clean = cleanDist;
exports.watch = watchFiles;
exports.default = watchFiles;

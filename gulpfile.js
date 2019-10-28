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

// Development Server Tasks

class Dev {
  static compileSass(cb) {
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
  static watchFiles() {
    // Start Browsersync
    browserSync.init({
      server: {
        baseDir: "src"
      }
    });

    // Watch for SCSS and Sass file changes.
    watch("src/**/*.+(sass|scss)", this.compileSass);
    // Watch for All other file changes, excluding sass/scss/css in the src/ directory and reload browser.
    watch(["src/**/*", "!src/**/*.+(sass|scss|css)"]).on(
      "change",
      browserSync.reload
    );
  }
}

// Build Tasks

function fonts() {
  return src("src/fonts/**/*").pipe(dest("dist/fonts"));
}

function images() {
  return (
    src("src/images/*.png")
      // Cache images that run through imagemin.
      .pipe(cache(imagemin()))
      .pipe(dest("dist/images"))
  );
}

function javascript() {
  return (
    src("src/*.html")
      .pipe(useref())
      // Minifies only if it's a JavaScript file.
      .pipe(gulpIf("*.js", uglify()))
      .pipe(dest("dist"))
  );
}
function css() {
  return src("src/sass/*.css").pipe(dest("dist/sass"));
}

function svg() {
  return src("src/svg/*").pipe(dest("dist/svg"));
}

function clean(cb) {
  cb();
  return del.sync("dist");
}


// Exports

exports.build = series(
  clean,
  Dev.compileSass,
  fonts,
  images,
  javascript,
  css,
  svg
);
exports.clean = clean;
exports.watch = Dev.watchFiles;
exports.default = Dev.watchFiles;

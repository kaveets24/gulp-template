// Gulp Plugins
const { src, series, dest, watch, parallel } = require("gulp");
const {
  sass,
  concat,
  sassGlob,
  sourcemaps,
  uglify,
  babel,
  autoprefixer,
  cleanCss,
  clean,
  cache,
  imagemin
} = require("gulp-load-plugins")();

// BrowserSync
const browserSync = require("browser-sync").create();

// Pathname Global Variable

const globs = {
  sass: "src/**/*.scss",
  js: "src/js/**/*.js",
  json: "src/**/*.json",
  html: "src/**/*.html",
  md: "src/**/*.md",
  images: "src/images/**/*.+(png|jpeg|jpg|svg)",
  fonts: "src/fonts/**/*"
};

const srcPaths = {
  root: "src/",
  html: "src/index.html",
  sass: "src/sass/main.scss",
  sassRoot: "src/sass/",
  js: "src/js/main.js"
};

const buildPaths = {
  root: "build/",
  css: "build/css/",
  fonts: "build/fonts/",
  images: "build/images/",
  js: "build/js/"
};

function compileJs() {
  return src(globs.js)
    .pipe(
      babel({
        presets: ["@babel/env"],
        plugins: [["@babel/plugin-proposal-class-properties", { loose: true }]]
      })
    )
    .pipe(
      concat("main.js")
        .pipe(uglify())
        .pipe(dest(buildPaths.js))
    );
}

// CSS
function compileSass(cb) {
  cb();
  return src([srcPaths.sass])
    .pipe(sassGlob())
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(autoprefixer("last 4 versions"))
    .pipe(concat("main.css"))
    .pipe(sourcemaps.write())
    .pipe(dest(buildPaths.css));
}

function html() {
  return src(srcPaths.html).pipe(dest(buildPaths.root));
}

function images() {
  return src(globs.images)
    .pipe(cache(imagemin()))
    .pipe(dest(buildPaths.images));
}
function fonts() {
  return src(globs.fonts).pipe(dest(buildPaths.fonts));
}

function watchFiles() {
  const files = Object.values(globs);
  return watch(files, series(parallel(compileSass, compileJs)));
}

// Clean /build
function cleanBuildDir() {
  return src(buildPaths.root, { read: false, allowEmpty: true }).pipe(
    clean({ force: true })
  );
}

class BrowserSync {
  // Initialize BrowserSync for WordPress instead of for the styleguide.
  static init() {
    browserSync.init({
      server: {
        baseDir: buildPaths.root
      }
    });
  }

  static watch() {
    const files = Object.values(globs);
    return watch(files, parallel(html, compileSass, compileJs)).on(
      "change",
      browserSync.reload
    );
  }
}

// Tasks

// gulp
exports.default = series(
  parallel(compileSass, html, compileJs, images, fonts),
  parallel(BrowserSync.init, BrowserSync.watch)
);
// gulp build
exports.build = series(
  cleanBuildDir,
  parallel(compileSass, html, compileJs, images, fonts)
);
// gulp watch
exports.watch = watchFiles;

// gulp clean
exports.clean = cleanBuildDir;

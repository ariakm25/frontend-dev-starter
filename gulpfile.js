const autoprefixer = require("autoprefixer");
const browserSync = require("browser-sync").create();
const figures = require("figures");
const gulp = require("gulp");
const gulpAutoprefixer = require("gulp-autoprefixer");
const gulpClean = require("gulp-clean");
const gulpColor = require("gulp-color");
const gulpConcat = require("gulp-concat");
const gulpCssnano = require("gulp-cssnano");
const gulpImagemin = require("gulp-imagemin");
const gulpNunjucks = require("gulp-nunjucks");
const gulpPostcss = require("gulp-postcss");
const gulpSass = require("gulp-sass");
const gulpSourcemaps = require("gulp-sourcemaps");
const gulpUtil = require("gulp-util");
const imageminMozjpeg = require("imagemin-mozjpeg");
const purgeCss = require("@fullhuman/postcss-purgecss");
const tailwindCSS = require("tailwindcss");
const webpack = require("webpack-stream");

const srcDir = "./src";
const distDir = "./dist";
const isProd = process.env.NODE_ENV === "production" ? true : false;
const webpackConfig = isProd
  ? require("./webpack.config.prod")
  : require("./webpack.config.js");

const stylesDir = `${srcDir}/styles`;
const scriptsDir = `${srcDir}/scripts`;
const imagesDir = `${srcDir}/images`;
const htmlDir = `${srcDir}/html`;

const logger = (text, symbol = figures.info, color = "YELLOW") => {
  console.log(gulpColor(`${symbol} - ${text}`, color));
};

gulp.task("clean", () => {
  logger("[Cleaning] Cleaning old dist..");
  return gulp
    .src(distDir, {
      read: false,
      allowEmpty: true,
    })
    .pipe(gulpClean())
    .on("end", () => logger("[Cleaning] Success!", figures.tick, "GREEN"))
    .on("error", () => logger("[Cleaning] Failed", figures.cross, "RED"));
});

gulp.task("scripts", () => {
  logger("[Scritps] Compiling...");
  return gulp
    .src(`${scriptsDir}/app.js`)
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(`${distDir}/assets/scripts`))
    .on("end", () => logger("[Scritps] Success!", figures.tick, "GREEN"))
    .on("error", () => logger("[Scritps] Failed", figures.cross, "RED"));
});

gulp.task("styles", () => {
  logger("[Styles] Compiling...");
  return gulp
    .src(`${stylesDir}/**/*.sass`)
    .pipe(gulpSass().on("error", gulpSass.logError))
    .pipe(
      gulpPostcss([
        tailwindCSS(),
        autoprefixer,
        ...(isProd
          ? [
              purgeCss({
                content: [`${htmlDir}/**/*.html`],
                defaultExtractor: (content) =>
                  content.match(/[\w-/:]+(?<!:)/g) || [],
              }),
            ]
          : []),
      ])
    )
    .pipe(gulpAutoprefixer())
    .pipe(gulpSourcemaps.init())
    .pipe(gulpConcat("app.css"))
    .pipe(isProd ? gulpCssnano() : gulpUtil.noop())
    .pipe(gulpSourcemaps.write("."))
    .pipe(gulp.dest(`${distDir}/assets/styles`))
    .on("end", () => logger("[Styles] Success!", figures.tick, "GREEN"))
    .on("error", () => logger("[Styles] Failed", figures.cross, "RED"));
});

gulp.task("images", () => {
  logger("[Images] Optimizing...");
  return gulp
    .src(`${imagesDir}/**/*.*`)
    .pipe(gulpImagemin([imageminMozjpeg({ quality: 80 })]))
    .pipe(gulp.dest(`${distDir}/assets/images`))
    .on("end", () => logger("[Images] Success!", figures.tick, "GREEN"))
    .on("error", () => logger("[Images] Failed", figures.cross, "RED"));
});

gulp.task("html", () => {
  logger("[HTML] Compiling...");
  return gulp
    .src(`${htmlDir}/*.html`)
    .pipe(
      gulpNunjucks.compile({
        name: "Tetsu",
      })
    )
    .pipe(gulp.dest(distDir))
    .on("end", () => logger("[HTML] Success!", figures.tick, "GREEN"))
    .on("error", () => logger("[HTML] Failed", figures.cross, "RED"));
});

gulp.task("watch", () => {
  browserSync.init({
    server: {
      baseDir: "./dist",
    },
  });

  gulp
    .watch(`${scriptsDir}/**/*.*`, gulp.series("scripts"))
    .on("change", browserSync.reload);
  gulp
    .watch(`${stylesDir}/**/*.*`, gulp.series("styles"))
    .on("change", browserSync.reload);
  gulp
    .watch(`${imagesDir}/**/*.*`, gulp.series("images"))
    .on("change", browserSync.reload);
  gulp
    .watch(`${htmlDir}/**/*.*`, gulp.series("html"))
    .on("change", browserSync.reload);
});

gulp.task(
  "build",
  gulp.series("clean", gulp.parallel("scripts", "styles", "images", "html"))
);

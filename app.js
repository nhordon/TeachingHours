let createError = require('http-errors');

const dotenv = require('dotenv');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

dotenv.config({ path: './.env' });

global.__basedir = __dirname;   
//ROUTERS
let indexRouter = require('./routes/index');
let specialitiesRouter = require('./routes/specialities');
let groupsRouter = require('./routes/groups');
let categoriesRouter = require ('./routes/categories');
let teachersRouter = require('./routes/teachers');
let pckRouter = require('./routes/pck');
let subjectsRouter = require('./routes/subjects');

let upload_planRouter = require('./routes/upload_plan');
let edit_navtRouter = require('./routes/edit_navt');
let edit_navt_teachRouter = require('./routes/edit_navt_teach');
let assign_subteacherRouter = require('./routes/assign_subteacher');
let leaderpck_navtRouter = require('./routes/leaderpck_navt');
let report_navtRouter = require('./routes/report_navt');
let teachers_navtRouter = require('./routes/teachers_navt');
let teachers_cardRouter = require('./routes/teachers_card');
let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//ROUTERS USE
app.use('/', indexRouter);
app.use('/specialities', specialitiesRouter);
app.use('/groups', groupsRouter);
app.use('/categories', categoriesRouter);
app.use('/teachers', teachersRouter);
app.use('/pck', pckRouter);
app.use('/subjects', subjectsRouter);

app.use('/upload_plan', upload_planRouter);
app.use('/edit_navt', edit_navtRouter);
app.use('/edit_navt_teach', edit_navt_teachRouter);
app.use('/assign_subteacher', assign_subteacherRouter);
app.use('/leaderpck_navt', leaderpck_navtRouter);
app.use('/report_navt', report_navtRouter);
app.use('/teachers_navt', teachers_navtRouter);
app.use('/teachers_card', teachers_cardRouter);
app.get('/help', function(req, res) {
  res.sendFile('views/help.html', {root: __dirname })
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

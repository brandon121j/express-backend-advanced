const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

const userRouter = require('./routes/user/userRouter');

app.use(cors());
app.options('*', cors());

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use('/api/auth/users', userRouter);

module.exports = app;

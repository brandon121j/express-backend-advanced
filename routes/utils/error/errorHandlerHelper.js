const ErrorClass = require("./ErrorClass");

function handleCastErrorDB(err) {
	const message = `Invalid ${err.path}: ${err.value}.`;
	return new ErrorClass(message, 400);
}

function handleDuplicateFieldsDB(err) {
	const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

	const message = `Duplicate field value: ${value}. Please use another value!`;
	return new ErrorClass(message, 400);
}

function handleValidationErrorDB(err) {
	const errors = Object.values(err.errors).map((el) => el.message);

	const message = `Invalid input data. ${errors.join('. ')}`;
	return new ErrorClass(message, 400);
}

function handleJWTExpired() {
	new ErrorClass('Invalid token. Please log in again!', 401);
}

function handleJWTExpiredError() {
	new ErrorClass('Your token has expired! Please log in again.', 401);
}

function sendErrorDev(err, req, res) {
	if (req.originalUrl.startsWith('/api')) {
		return res.status(err.statusCode).json({
			statusCode: err.statusCode,
			error: err,
			stack: err.stack,
		});
	}

	return res.status(err.statusCode).json({
		title: 'Something went wrong!',
		msg: err.message,
	});
}

function sendErrorProd(err, req, res) {
	if (req.originalUrl.startsWith('/api')) {
		if (err.isOperational) {
			return res.status(err.statusCode).json({
				status: err.status,
				message: err.message,
			});
		}
	}

	return res.status(500).json({
		status: 'error',
		message: 'Something went very wrong!',
	});
}

function erroHandlerFunction(err, req, res) {

	
	err.statusCode = err.statusCode || 500;

	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, req, res);
	} else if (process.env.NODE_ENV === 'production') {
		let error = { ...err };
		error.message = err.message;

		if (error.name === 'CastError') error = handleCastErrorDB(error);

		if (error.code === 11000) error = handleDuplicateFieldsDB(error);

		if (error.name === 'ValidationError')
			error = handleValidationErrorDB(error);

		if (error.name === 'JsonWebTokenError') error = handleJWTExpired();

		if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

		sendErrorProd(error, req, res);
	}
}

module.exports = erroHandlerFunction;

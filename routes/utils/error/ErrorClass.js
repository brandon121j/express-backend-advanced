function ErrorClass(error, statusCode = 500) {
	let errorObj = {};

	if (typeof error === 'object') {
		if (error.code) {
			return handleMongoDuplicationError(error, statusCode);
		} else {
			return handleMongoServerValidationError(error, statusCode);
		}
	}

	if (typeof error === 'string') {
		errorObj.statusCode = statusCode;
		errorObj.message = error;

		return errorObj;
	}
}

function handleMongoServerValidationError(error) {
	let mongoErrorObj = error.errors;
	let errorObj = {};

	for (var errName in mongoErrorObj) {
		switch (mongoErrorObj[errName].properties.type) {
			case 'required':
				errorObj.statusCode = 400;
				errorObj.message = mongoErrorObj[errName].properties.message;
				errorObj.errorInfo = `Missing information, ${mongoErrorObj[errName].properties.message}`;
				break;

			case 'minlength':
				errorObj.statusCode = 400;
				errorObj.message = mongoErrorObj[errName].properties.message;
				errorObj.errorInfo = 'Password must be minimum of 8 characters';
				break;

			case 'max':
				errorObj.statusCode = 400;
				errorObj.message = mongoErrorObj[errName].properties.message;
				errorObj.errorInfo = 'You exceeded the maximum number';
				break;

			case 'regexp':
				errorObj.statusCode = 500;
				errorObj.message = mongoErrorObj[errName].properties.message;
				errorObj.errorInfo = `${mongoErrorObj[errName].properties.path} ${mongoErrorObj[errName].properties.message}`;
				break;

			default:
				errorObj.statusCode = 400;
				errorObj.message = mongoErrorObj[errName].properties.message;
				errorObj.errorInfo = 'Missing information';
				break;
		}
	}
}

function handleMongoDuplicationError(error) {
	let errorObj = {};

	switch (error.code) {
		case 11000:
		case 11001:
			errorObj.statusCode = 409;
			errorObj.message = { ...error.keyValue, errorInfo: 'dplucate' };
			break;
		default:
			errorObj.statusCode = 409;
			errorObj.message = { ...error.keyValue, errorInfo: 'dplucate' };
			break;
	}

	return errorObj;
}

module.exports = ErrorClass;

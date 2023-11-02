function handleErrors(res, err) {
    if (err) { 
        console.error(err); 
    }

    var statusCode = 500;
    if (err === 'ER_DUP_ENTRY') {
        statusCode = 409;
    }
    res.statusCode = statusCode;
}

function createErrorData(errorCode, errorMessage, errorMessageIds) {
    return { code: errorCode, error: errorMessage, ids: errorMessageIds };
}

module.exports = {
    handleErrors,
    createErrorData
}
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

function createErrorData(error, localizedError) {
    return { error: error, localizedError: localizedError };
}

module.exports = {
    handleErrors,
    createErrorData
}
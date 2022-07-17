function handleErrors(res, err) {
    if (err) { 
        console.error(err); 
    }
    res.statusCode = 500;
}

module.exports = {
    handleErrors
}
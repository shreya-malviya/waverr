const ErrorHandler = require('../utils/errorHandler');

module.exports = (err , req , res ,next) =>{
    err.statusCode = err.statuscode || 500;
    err.message = err.message || `Internal erver error`;

    // wrong mongodb ID error 
    if(err.name === "castError"){
        const message =    `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message,400);
    }

    // Mongoose dublicate key error
    if(err.code === 11000){
        const message = `dublicate ${Object.keys(err.keyValue)} Enter `;
        err= new ErrorHandler(message,400);
    }

    //Wrong JWT error
    if(err.name === 'jsonWebTokenError'){
        const message = `json web token is invalid , try again`;
        err = new ErrorHandler(message,400);
    }

    //Jwt expire error
    if(err.name === 'TokenExpiredError'){
        const message = `json web token is expired , try again`;
        err = new ErrorHandler(message,400);
    }
    console.log("err: ", err,"\nerrStack: ",err.stack);
res.status(err.statusCode).json({
        success:false,
        // error: err.stack,
        err:err.message,
        error: err.stack
    });
};
const sendToken = (user,statusCode,res)=>{
    const token = user.getJWTToken();

    // options for cookie

    const options = {
        expires : Date.now() + process.env_COOKIE_EXPIRE *24*60*60*1000,
        httpOnly:true,
    }
    if(res.status == 200){
        cookies.set('jwt', res.data.token);
        cookies.set('email', res.data.email)
    }

    res.cookie('token',token,options);
    res.status(statusCode).json({
        success:true,
        user,
        token
    })


}

module.exports = sendToken
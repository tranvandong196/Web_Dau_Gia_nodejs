module.exports = function(req, res, next) {
	if(req.session.isCanSale === true)
	{
		if(req.originalUrl == '/account/reqUpAccount')
		{
			res.redirect('/home');
		}
	}
    if (req.session.isLogged === true) {
        next();
    } else {
    	var url = '/account/login?retUrl=' + req.originalUrl;
        res.redirect(url);
    }
};
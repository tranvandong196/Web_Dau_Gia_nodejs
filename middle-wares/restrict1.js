module.exports = function(req, res, next) {
    if (req.session.isLogged === true) {
    	if(req.session.isCanSale === true)
        	next();
        else
        {
        	var url = '/account/profile/' + req.session.user.id;
        	res.redirect(url);
        }
    } else {
    	var url = '/account/login?retUrl=' + req.originalUrl;
        res.redirect(url);
    }
};
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    console.debug('request to /');
    res.render('index', { title: 'Auth0 integration' });
});



module.exports = router;

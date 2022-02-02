var express = require('express');
var router = express.Router();
var validator = require("../validators/validator");
var userController = require('../controllers/userController');

//redirect to login page if no session is found
checkLoginStatus = function(req, res, next){
    var user = req.session.user;
    if(!user){
      return res.redirect("/user/login");
    }
    next();
}

localQuery = function(req, res, next) {
    res.locals.userSession = req.session.user;
    next();
};

// >>>>>>>>>>>> SVAKI CONTROLLER KOJI TREBA SESSION DATA ZA RENDER VIEWA TREBA localQuery FUNKCIJU <<<<<<<<<<<<<<<<
router.get('/', userController.userIndex);
router.get('/register', userController.registerUser);
router.post('/register', validator.registerValidate, userController.registerUser);

router.get('/login', localQuery, userController.loginUser);
router.post('/login', validator.loginValidate, localQuery, userController.loginUser);

router.post('/logout', userController.logoutUser);
router.get('/logout', userController.logoutUser);
/*router.get('/:id',
    function(req, res, next){
        res.locals.id = req.params.id;
        next();
    },
    userController.getUserByID
);*/
router.get('/edit', localQuery, userController.editUser);

router.post("/fantasyClub", validator.fantasyClubValidate, userController.fantasyClub);

module.exports = router;
var express = require('express');
var router = express.Router();
var apiCont = require('../controllers/api');
var validator = require("../validators/validator");

//redirect to login page if no session is found
checkLoginStatus = function(req, res, next){
    var user = req.session.user;
    if(!user){
      return res.redirect("/user/login");
    }
    next();
  }

router.get('/getPlayersByClubId/:clubID', validator.getPlayersByClubIdValidate, apiCont.getPlayersByClubId); //provjeri get za validaciju jel radi
router.post('/checkCreds', validator.checkCredsValidate, apiCont.checkCreds);
router.post('/checkRegistration', validator.checkRegistrationValidate, apiCont.checkRegistration);
router.post('/getPlayers', apiCont.getPlayers);
router.post('/savePlayerToFClub', validator.savePlayerToFClubValidate, apiCont.savePlayerToFClub);
router.delete('/deletePlayerFromFClub', validator.deletePlayerFromFClubValidate, apiCont.deletePlayerFromFClub);
router.put('/saveFClubName', validator.saveFClubNameValidate, apiCont.saveFClubName);

module.exports = router;
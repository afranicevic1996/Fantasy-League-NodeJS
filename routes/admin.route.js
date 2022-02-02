var express = require('express');
var router = express.Router();
var adminController = require('../controllers/adminController');
var validator = require("../validators/validator");
var path = require('path');
const multer  = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images')
    },
    filename: function (req, file, cb) {
      console.log("file mime tip: " + file.mimetype);
      //srediti extenziju po mimetype
      var mime = file.mimetype.split("/");
      var ext = "safeExt";
      if(mime[0] == "image"){
        ext = mime[1];
      }
      else if(mime[0] == "text"){
        if(mime[1] == "plain"){
          ext = "txt";
        }
      }
      cb(null, Date.now() + "." + ext)
    }
  });

const upload = multer({storage: storage});

localQuery = function(req, res, next) {
  res.locals.userSession = req.session.user;
  next();
};

//redirect to login page if no session is found or if user role is not admin
checkLoginStatus = function(req, res, next){
  var user = req.session.user;
  if(!user || user.role != "admin"){
    return res.redirect("/user/login");
  }
  next();
}

// >>>>>>>>>>>> SVAKI CONTROLLER KOJI TREBA SESSION DATA ZA RENDER VIEWA TREBA localQuery FUNKCIJU <<<<<<<<<<<<<<<<
router.get('/', checkLoginStatus, localQuery, adminController.adminIndex);
router.get('/manageClubs', checkLoginStatus, localQuery, adminController.manageClubs);
router.post('/manageClubs', checkLoginStatus, localQuery, upload.single("pictureFile"), validator.createClubValidate, adminController.manageClubs);
router.delete('/manageClubs', checkLoginStatus, validator.clubIdValidate, adminController.manageClubs);
router.put('/manageClubs', checkLoginStatus, upload.single("pictureFile"), validator.editClubValidate, adminController.manageClubs);

router.get('/managePlayers',  localQuery, adminController.managePlayers); //checkLoginStatus
router.post('/managePlayers',  localQuery, upload.single("pictureFile"), validator.createPlayerValidate, adminController.managePlayers); //checkLoginStatus
router.delete('/managePlayers',  validator.playerIdValidate, adminController.managePlayers); //checkLoginStatus
router.put('/managePlayers',  upload.single("pictureFile"), validator.editPlayerValidate, adminController.managePlayers); //checkLoginStatus

router.get('/manageGames',  localQuery, adminController.manageGames); //checkLoginStatus
router.post('/manageGames',  localQuery, validator.createGameValidate, adminController.manageGames); //checkLoginStatus
router.delete('/manageGames',  localQuery, validator.deleteGameValidate, adminController.manageGames); //checkLoginStatus
router.put('/manageGames',  localQuery, validator.editGameValidate, adminController.manageGames); //checkLoginStatus

router.get('/finishGame/:clubID', adminController.finishGame);

module.exports = router;
const { check } = require('express-validator');

exports.loginValidate = [
    check("username").trim().escape()
        .not().isEmpty().withMessage("Username cannot be empty!").bail()
        .isLength({min: 3}).withMessage("minimum 3 chars").bail(),
    check("password").trim().escape()
        .not().isEmpty().withMessage("Password cannot be empty").bail()
        .isLength({min: 5}).withMessage("Password must contain minimum 5 chars").bail(),
    (err, req, res, next) => {
        next();
    }
]

exports.registerValidate = [
    check("username").trim().escape()
        .not().isEmpty().withMessage("Username cannot be empty!").bail()
        .isLength({min: 3}).withMessage("minimum 3 chars").bail(),
    check("password").trim().escape()
        .not().isEmpty().withMessage("Password cannot be empty").bail()
        .isLength({min: 5}).withMessage("Password must contain minimum 5 chars").bail()
        .custom((value, {req, loc, path}) => {
            if (value != req.body.password2){
                throw new Error("Passwords don't match");
            }else{
                return value;
            }
        }).bail(),
    check("password2").trim().escape()
        .not().isEmpty().withMessage("Password2 cannot be empty").bail()
        .isLength({min: 5}).withMessage("Password2 must contain minimum 5 chars").bail(),
    check("email").trim().escape()
        .not().isEmpty().withMessage("Email cannot be empty").bail()
        .isEmail().normalizeEmail().withMessage("Incorrect email format").bail(),
    (err, req, res, next) => {
        next();
    }
]

exports.clubIdValidate = [
    check("dataID").trim().escape()
        .not().isEmpty().withMessage("clubID cannot be empty!").bail()
        .optional({ checkFalsy: true }).isNumeric().withMessage("clubID must be a number").bail(),  
    (err, req, res, next) => {
        next();
    }  
]

exports.createClubValidate = [
    check("name").trim().escape()
        .not().isEmpty().withMessage("Club name cannot be empty!").bail()
        .isLength({min: 3}).withMessage("Name minimum 3 chars").bail(),
    check("location").trim().escape()
        .not().isEmpty().withMessage("Location cannot be empty!").bail()
        .isLength({min: 3}).withMessage("Location minimum 3 chars").bail(),
    (err, req, res, next) => {
        next();
    }    
]

exports.editClubValidate = [
    check("id").trim().escape()
        .not().isEmpty().withMessage("clubID cannot be empty!").bail()
        .optional({ checkFalsy: true }).isNumeric().withMessage("clubID must be a number").bail(),
    check("name").trim().escape()
        .not().isEmpty().withMessage("Club name cannot be empty!").bail()
        .isLength({min: 3}).withMessage("Name minimum 3 chars").bail(),
    check("location").trim().escape()
        .not().isEmpty().withMessage("Location cannot be empty!").bail()
        .isLength({min: 3}).withMessage("Location minimum 3 chars").bail(),
    (err, req, res, next) => {
        next();
    }    
]

exports.createPlayerValidate = [
    check("name").trim().escape()
        .not().isEmpty().withMessage("Player name cannot be empty!").bail()
        .isLength({min: 3}).withMessage("Player name minimum 3 chars").bail(),
    check("surname").trim().escape()
        .not().isEmpty().withMessage("Surname cannot be empty!").bail()
        .isLength({min: 3}).withMessage("Surname minimum 3 chars").bail(),
    check("clubID").trim().escape()
        .not().isEmpty().withMessage("ClubID cannot be empty!").bail()
        .optional({ checkFalsy: true }).isNumeric().withMessage("ClubID must be a number").bail(),
    check("positionID").trim().escape()
        .not().isEmpty().withMessage("PositionID cannot be empty!").bail()
        .optional({ checkFalsy: true }).isNumeric().withMessage("PositionID must be a number").bail(),
    (err, req, res, next) => {
        next();
    }    
]

exports.playerIdValidate = [
    check("dataID").trim().escape()
        .not().isEmpty().withMessage("PlayerID cannot be empty!").bail()
        .optional({ checkFalsy: true }).isNumeric().withMessage("PlayerID must be a number").bail(),  
    (err, req, res, next) => {
        next();
    }  
]

exports.editPlayerValidate = [
    check("id").trim().escape()
        .not().isEmpty().withMessage("PlayerID cannot be empty!").bail()
        .optional({ checkFalsy: true }).isNumeric().withMessage("PlayerID must be a number").bail(),
    check("name").trim().escape()
        .not().isEmpty().withMessage("Player name cannot be empty!").bail()
        .isLength({min: 3}).withMessage("Player name minimum 3 chars").bail(),
    check("surname").trim().escape()
        .not().isEmpty().withMessage("Player surname cannot be empty!").bail()
        .isLength({min: 3}).withMessage("Player surname minimum 3 chars").bail(),
    check("clubID").trim().escape()
        .not().isEmpty().withMessage("ClubID cannot be empty!").bail()
        .isLength({min: 1}).withMessage("ClubID cannot be empty!").bail()
        .optional({ checkFalsy: true }).isNumeric().withMessage("ClubID must be a number").bail(),
    check("positionID").trim().escape()
        .not().isEmpty().withMessage("PositionID cannot be empty!").bail()
        .optional({ checkFalsy: true }).isNumeric().withMessage("PositionID must be a number").bail(),
    (err, req, res, next) => {
        next();
    }    
]

exports.createGameValidate = [
    check("homeclubID").trim().escape()
        .not().isEmpty().withMessage("HomeclubID cannot be empty!").bail()
        .optional({ checkFalsy: true }).isNumeric().withMessage("HomeclubID must be a number").bail(),
    check("awayclubID").trim().escape()
        .not().isEmpty().withMessage("AwayclubID cannot be empty!").bail()
        .optional({ checkFalsy: true }).isNumeric().withMessage("AwayclubID must be a number").bail(),
    (err, req, res, next) => {
        next();
    }   
]

exports.deleteGameValidate = [
    check("dataID").trim().escape()
        .not().isEmpty().withMessage("gameID cannot be empty!").bail()
        .optional({ checkFalsy: true }).isNumeric().withMessage("gameID must be a number").bail(),  
    (err, req, res, next) => {
        next();
    }  
]

exports.editGameValidate = [
    check("id").trim().escape()
        .not().isEmpty().withMessage("GameID cannot be empty!").bail()
        .optional({ checkFalsy: true }).isNumeric().withMessage("GameID must be a number").bail(),
    check("homeclubID").trim().escape()
        .not().isEmpty().withMessage("HomeclubID cannot be empty!").bail()
        .optional({ checkFalsy: true }).isNumeric().withMessage("HomeclubID must be a number").bail(),
    check("awayclubID").trim().escape()
        .not().isEmpty().withMessage("AwayclubID cannot be empty!").bail()
        .optional({ checkFalsy: true }).isNumeric().withMessage("AwayclubID must be a number").bail(),
    (err, req, res, next) => {
        next();
    }   
]

//user

exports.getPlayersByClubIdValidate = [
    check("clubID").trim().escape()
        .not().isEmpty().withMessage("clubID cannot be empty!").bail()
        .optional({ checkFalsy: true }).isNumeric().withMessage("clubID must be a number").bail(),  
    (err, req, res, next) => {
        next();
    }  
]

exports.checkCredsValidate = [
    check("username").trim().escape()
        .not().isEmpty().withMessage("username cannot be empty!").bail()
        .isLength({min: 3}).withMessage("username must contain minimum 3 chars").bail(),
    check("password").trim().escape()
        .not().isEmpty().withMessage("password cannot be empty!").bail()
        .isLength({min: 3}).withMessage("password must contain minimum 3 chars").bail(),
    (err, req, res, next) => {
        next();
    }   
]

exports.checkRegistrationValidate = [
    check("username").trim().escape()
        .not().isEmpty().withMessage("username cannot be empty!").bail()
        .isLength({min: 3}).withMessage("username must contain minimum 3 chars").bail(),
    check("password").trim().escape()
        .not().isEmpty().withMessage("password cannot be empty!").bail()
        .isLength({min: 3}).withMessage("password must contain minimum 3 chars").bail(),
    check("email").trim().escape()
        .not().isEmpty().withMessage("Email cannot be empty").bail()
        .isEmail().normalizeEmail().withMessage("Incorrect email format").bail(),
    (err, req, res, next) => {
        next();
    }   
]

exports.deletePlayerFromFClubValidate = [
    check("dataID").trim().escape()
        .not().isEmpty().withMessage("playerID cannot be empty!").bail()
        .optional({ checkFalsy: true }).isNumeric().withMessage("playerID must be a number").bail(),  
    (err, req, res, next) => {
        next();
    }  
]

exports.saveFClubNameValidate = [
    check("fClubName").trim().escape()
        .not().isEmpty().withMessage("Fantasy club name cannot be empty!").bail()
        .isLength({min: 3}).withMessage("Fantasy club name must contain minimum 3 chars").bail(), 
    (err, req, res, next) => {
        next();
    }  
]

exports.savePlayerToFClubValidate = [
    check("playerID").trim().escape()
        .not().isEmpty().withMessage("playerID cannot be empty!").bail()
        .optional({ checkFalsy: true }).isNumeric().withMessage("playerID must be a number").bail(),  
    (err, req, res, next) => {
        next();
    }  
]

exports.fantasyClubValidate = [
    check("fClubName").trim().escape()
        .not().isEmpty().withMessage("Fantasy club name cannot be empty!").bail()
        .isLength({min: 3}).withMessage("Fantasy club name must contain minimum 3 chars").bail(), 
    (err, req, res, next) => {
        next();
    }  
]




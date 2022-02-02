const Player = require('../models/playerModel');
const Club = require('../models/clubModel');
var User = require("../models/userModel");
const Positions = require('../models/positionsModel');
const FantasyClub = require('../models/fantasyClubModel');
var Validator = require("../validators/validateStuff");
const { validationResult } = require("express-validator");

//get all players from club by clubid
exports.getPlayersByClubId = async function(req, res){
    if(req.method == "GET"){
        const err = validationResult(req);

        //checking validation errors
        if(!err.isEmpty()){
            var msg = await Validator.readValidationErrors(err);
            var result = {error: true, statusMessage: msg};
            return res.send(JSON.stringify(result));
        }

        //abort if club with id does not exist
        if(!await Club.checkIfExists(req.params.clubID)){
            var result = {error: true, data: "Klub sa id: " + req.params.clubID + " ne postoji!"}
            return res.send(JSON.stringify(result));
        }

        var result = await Player.getAllPlayersByClubId(req.params.clubID);

        //abort if error happened
        if(!result){
            result = {error: true, data: "Doslo je do greske u dohvatu igraca!"}
            return res.send(JSON.stringify(result));            
        }

        //if no players are found
        if(!result.length){
            result = {error: false, data: "Nema igraca za odabrani klub"}
            return res.send(JSON.stringify(result)); 
        }

        var clubs = await Club.getAllClubs();

        //abort if error happened
        if(!clubs){
            result = {error: true, data: "Doslo je do greske u dohvatu svih klubova!"}
            return res.send(JSON.stringify(result));            
        }

        var positions = await Positions.getAllPositions();
        
        //abort if error happened
        if(!positions){
            result = {error: true, data: "Doslo je do greske u dohvatu svih pozicija!"}
            return res.send(JSON.stringify(result));             
        }

        result = {error: false, data: result, clubs: clubs, positions: positions}
        return res.send(JSON.stringify(result));         

    }
}

//checking user credentials for login
exports.checkCreds = async function(req, res){
    const err = validationResult(req);

    //checking validation errors
    if(!err.isEmpty()){
        var msg = await Validator.readValidationErrors(err);
        var result = {error: true, statusMessage: msg};
        return res.send(JSON.stringify(result));
    }

    if(!await User.checkCreds(req.body.username, req.body.password)){
        var result = {error: true, data: "Unijeli ste netocne podatke!"}
        return res.send(JSON.stringify(result));        
    }

    var result = {error: false, data: "Ispravni podaci, može se forma submitat!"}
    return res.send(JSON.stringify(result)); 
}

//check if user already exists
exports.checkRegistration = async function(req, res){
    const err = validationResult(req);

    //checking validation errors
    if(!err.isEmpty()){
        var msg = await Validator.readValidationErrors(err);
        var result = {error: true, statusMessage: msg};
        return res.send(JSON.stringify(result));
    }

    var user = new User(req.body.username, req.body.email, req.body.password, "user");

    //abort if username/email is taken
    if(await user.checkIfExists()){
        var result = {error: true, data: "Vec postoji takav username ili email!"};
        return res.send(JSON.stringify(result));         
    }

    var result = {error: false, data: "OK!"}
    return res.send(JSON.stringify(result)); 
}

//get all players from user input
//options: player name, clubid, player positions
exports.getPlayers = async function(req, res){
    if(req.method == "POST"){
        var data = {}, cbList = [], j = 0, playersList, result;
        //get all checked checkboxes
        var checkboxes = req.body.checked;

        //if player name is passed
        if(req.body.name)
            data["name"] = req.body.name;

        if(Number.isInteger(Number(req.body.clubID)))
            data["clubID"] = req.body.clubID

        //if any checkboxes are checked
        if(checkboxes.length > 0){
            var x;
            for(var i = 0; i < checkboxes.length; i++){
                x = Number(checkboxes[i]);
                if(Number.isInteger(x)){
                    cbList[j++] = x;
                }else{
                    console.log("nije int");
                }
            }

            data["checkbox"] = cbList;
        }

        playersList = await Player.getPlayersBySearchData(data);

        //abort if error happened
        if(playersList === false){
            result = {error: true, statusMessage: "Dogodila se greška!"};
            return res.send(JSON.stringify(result));
        }

        //if no data is found
        if(playersList === 0){
            result = {error: false, data: false};
            return res.send(JSON.stringify(result));
        }

        result = {error: false, data: playersList};        
        return res.send(JSON.stringify(result));
    }
}

//save player to user's fantasy club
exports.savePlayerToFClub = async function(req, res){
    const err = validationResult(req);

    //checking validation errors
    if(!err.isEmpty()){
        var msg = await Validator.readValidationErrors(err);
        var result = {error: true, statusMessage: msg};
        return res.send(JSON.stringify(result));
    }
    
    var result, user = req.session.user, fClub;

    //abort if http method is not post
    if(req.method != "POST"){
        console.log("nije post, nista");
        return false;
    }

    //abort if player with playerid does not exist
    if(!await Player.checkIfExists(req.body.playerID)){
        result = {error: true, statusMessage: "Ne postoji igrač s tim ID!"};
        return res.send(JSON.stringify(result));
    }

    fClub = await FantasyClub.getFClubByUserId(user.id);
    //abort if user does not have fantasy club
    if(!fClub){
        result = {error: true, statusMessage: "Nemate svoj fantasy klub!"};
        return res.send(JSON.stringify(result));        
    }

    //abort if player is already in user's fantasy club
    if(await FantasyClub.playerExistsInFClub(user.id, req.body.playerID)){
        result = {error: true, statusMessage: "Igrač je već u vašem fantasy klubu!"};
        return res.send(JSON.stringify(result));
    }

    //adding player to user's fantasy club
    if(!await FantasyClub.addPlayerToFClub(fClub.id, req.body.playerID)){
        result = {error: true, statusMessage: "Greška prilikom dodavanja igrača u fantasy klub!"};
        return res.send(JSON.stringify(result));    
    }

    result = {error: false, statusMessage: "Igrač dodan u fantasy klub!"};
    return res.send(JSON.stringify(result)); 
}

//deleting player from user's fantasy club
exports.deletePlayerFromFClub = async function(req, res){
    const err = validationResult(req);

    //checking validation errors
    if(!err.isEmpty()){
        var msg = await Validator.readValidationErrors(err);
        var result = {error: true, statusMessage: msg};
        return res.send(JSON.stringify(result));
    }

    //abort if http method is not delete
    if(req.method != "DELETE"){
        console.log("nije post, nista");
        return false;
    }

    //abort if player with playerid does not exist
    if(!await Player.checkIfExists(req.body.dataID)){
        result = {error: true, statusMessage: "Igrač ne postoji!"};
        return res.send(JSON.stringify(result));        
    }

    var user = req.session.user;
    //abort if player does not exist in player's fantasy club
    if(!await FantasyClub.playerExistsInFClub(user.id, req.body.dataID)){
        result = {error: true, statusMessage: "Igrač nije u vašem klubu!"};
        return res.send(JSON.stringify(result));        
    }

    //abort if user does not have fantasy club
    if(!await FantasyClub.checkIfUserHasFclub(user.id)){
        result = {error: true, statusMessage: "Nemate svoj fantasy klub!"};
        return res.send(JSON.stringify(result));      
    }

    //deleting player from user's fantasy club
    if(!await FantasyClub.deletePlayerFromFClub(user.id, req.body.dataID)){
        result = {error: true, statusMessage: "Greška u brisanju igrača iz fantasy kluba!"};
        return res.send(JSON.stringify(result));       
    }

    result = {error: false, statusMessage: "Igrač izbrisan iz fantasy kluba!"};
    return res.send(JSON.stringify(result));  
}

//saving new fantasy club name
exports.saveFClubName = async function(req, res){
    const err = validationResult(req);

    //checking validation errors
    if(!err.isEmpty()){
        var msg = await Validator.readValidationErrors(err);
        var result = {error: true, statusMessage: msg};
        return res.send(JSON.stringify(result));
    }

    //abort if http method is not put
    if(req.method != "PUT")
        return false;

    var user = req.session.user;
    var fClub = await FantasyClub.getFClubByUserId(user.id);
    //abort if user does not have fantasy club
    if(!fClub){
        result = {error: true, statusMessage: "Nemate svoj fantasy klub!"};
        return res.send(JSON.stringify(result));      
    }
    
    //saving new fantasy club name
    if(!await FantasyClub.saveFClubName(fClub.id, req.body.fClubName)){
        result = {error: true, statusMessage: "Greška prilikom izmjene imena kluba!"};
        return res.send(JSON.stringify(result)); 
    }

    result = {error: false, statusMessage: "Ime kluba uspješno promijenjeno!"};
    return res.send(JSON.stringify(result));
}
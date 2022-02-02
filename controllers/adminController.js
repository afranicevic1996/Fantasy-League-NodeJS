var express = require('express');
var path = require('path');
var validator = require("email-validator");
var User = require("../models/userModel");
var Club = require("../models/clubModel");
var Validator = require("../validators/validateStuff");
var views = process.cwd() + "/views/";
const bcrypt = require('bcrypt');
const { validationResult } = require("express-validator");
const Player = require('../models/playerModel');
const Positions = require('../models/positionsModel');
const Game = require('../models/gameModel');

//admin homepage
exports.adminIndex = async function(req, res){
    if(req.method == "GET"){
        return res.render(views + "adminPanel.pug");
    }
}

//admin manage clubs
exports.manageClubs = async function(req, res){
    //manage clubs default
    if(req.method == "GET"){
        var clubs = await Club.getAllClubs();
        return res.render(views + "manageClubs.pug", {clubs: clubs});
    }

    //new club
    if(req.method == "POST"){
        const err = validationResult(req);
        var clubs = await Club.getAllClubs();
        var result;

        //checking validation errors
        if(!err.isEmpty()){
            var msg = await Validator.readValidationErrors(err);
            result = {error: true, statusMessage: msg};
            return res.render(views + "manageClubs.pug", {clubs: clubs, status: result});
        }

        //if no file is submitted
        if(!req.file){
            result = {error: true, statusMessage: "File je obavezan!"};
            return res.render(views + "manageClubs.pug", {clubs: clubs, status: result});
        }

        var club = new Club(null, req.body.name, req.body.location, req.file.filename);
        if(!await club.createClub()){
            console.log("error u kreiranju kluba");
            result = {error: true, statusMessage: "Error u kreiranju kluba!"};
            return res.render(views + "manageClubs.pug", {clubs: clubs, status: result});
        }
        
        result = {error: false, statusMessage: "Klub kreiran!"};
        return res.render(views + "manageClubs.pug", {clubs: clubs, status: result});
    }

    //delete club
    if(req.method == "DELETE"){
        const err = validationResult(req);

        //checking validation errors
        if(!err.isEmpty()){
            var msg = await Validator.readValidationErrors(err);
            var result = {error: true, statusMessage: msg};
            return res.send(JSON.stringify(result));
        }

        var clubID = req.body.dataID;
        if(!await Club.deleteClub(clubID)){
            var result = {error: true, statusMessage: "Error pri brisanju kluba!"};
            return res.send(JSON.stringify(result));
        }

        var result = {error: false, statusMessage: "Klub izbrisan!"};
        return res.send(JSON.stringify(result));
    }

    //edit club
    if(req.method == "PUT"){
        const err = validationResult(req);

        //checking validation errors
        if(!err.isEmpty()){
            var msg = await Validator.readValidationErrors(err);
            var result = {error: true, statusMessage: msg};
            return res.send(JSON.stringify(result));
        }

        //if no file was submitted filename will be null, old file (image) will stay
        if(!req.file){
            var club = new Club(req.body.id, req.body.name, req.body.location, null);
        }else{
            var club = new Club(req.body.id, req.body.name, req.body.location, req.file.filename);
        }

        if(!await club.editClub()){
            var result = {error: true, statusMessage: "Error pri editiranju kluba!"};
            return res.send(JSON.stringify(result));
        }

        var result = {error: false, statusMessage: "Klub editiran!"};
        return res.send(JSON.stringify(result));               
    }    
}

//admin manage players
exports.managePlayers = async function(req, res){
    var clubs = await Club.getAllClubs();
    var players = await Player.getAllPlayers();
    var positions = await Positions.getAllPositions();

    //manage players default
    if(req.method == "GET"){
        return res.render(views + "managePlayers.pug", {clubs: clubs, players: players, positions: positions});
    }

    //new player
    if(req.method == "POST"){
        const err = validationResult(req);

        //checking validation errors
        if(!err.isEmpty()){
            var msg = await Validator.readValidationErrors(err);
            var result = {error: true, statusMessage: msg};
            return res.render(views + "managePlayers.pug", {clubs: clubs, status: result, players: players, positions: positions});
        }

        //if no file is submitted
        if(!req.file){
            result = {error: true, statusMessage: "File je obavezan!"};
            return res.render(views + "managePlayers.pug", {clubs: clubs, status: result, players: players, positions: positions});
        }

        //check if club with id exists 
        if(!await Club.checkIfExists(req.body.clubID)){
            console.log("klub sa id: " + req.body.clubID + " ne postoji!");
            return res.render(views + "managePlayers.pug", {clubs: clubs, players: players, positions: positions});
        }

        //check if position with id exists
        if(!await Positions.checkIfExists(req.body.positionID)){
            result = {error: true, statusMessage: "Pozicija ne postoji!"};
            return res.render(views + "managePlayers.pug", {clubs: clubs, status: result, players: players, positions: positions});           
        }

        var player = new Player(null, req.body.name, req.body.surname, req.body.clubID, req.file.filename, req.body.positionID);
        if(!await player.createPlayer()){
            console.log("greska u dodavanju igraca");
            return res.render(views + "managePlayers.pug", {clubs: clubs, players: players, positions: positions});
        }

        console.log("ok dodavanje igraca");
        return res.redirect("/admin/managePlayers");       
    }

    //delete player
    if(req.method == "DELETE"){
        const err = validationResult(req);

        //checking validation errors
        if(!err.isEmpty()){
            var msg = await Validator.readValidationErrors(err);
            var result = {error: true, statusMessage: msg};
            return res.send(JSON.stringify(result));
        }

        if(!await Player.deletePlayer(req.body.dataID)){
            var result = {error: true, statusMessage: "Error pri brisanju igraca!"};
            return res.send(JSON.stringify(result));            
        }

        var result = {error: false, statusMessage: "Igrac izbrisan!"};
        return res.send(JSON.stringify(result));
    }

    //edit player
    if(req.method == "PUT"){
        const err = validationResult(req);

        //checking validation errors
        if(!err.isEmpty()){
            var msg = await Validator.readValidationErrors(err);
            var result = {error: true, statusMessage: msg};
            return res.send(JSON.stringify(result));
        }

        //check if club with id exists
        if(!await Club.checkIfExists(req.body.clubID)){
            var result = {error: true, statusMessage: "Klub sa tim IDom ne postoji!"};
            return res.send(JSON.stringify(result)); 
        }
        
        //check if player with id exists
        if(!await Player.checkIfExists(req.body.id)){
            var result = {error: true, statusMessage: "Igrac sa tim IDom ne postoji!"};
            return res.send(JSON.stringify(result));            
        }

        //if no file was submitted filename will be null, old file (image) will stay
        if(!req.file){
            var player = new Player(req.body.id, req.body.name, req.body.surname, req.body.clubID, null, req.body.positionID);
        }else{
            var player = new Player(req.body.id, req.body.name, req.body.surname, req.body.clubID, req.file.filename, req.body.positionID);
        }

        if(!await player.editPlayer()){
            var result = {error: true, statusMessage: "Error pri editiranju igraca!"};
            return res.send(JSON.stringify(result));
        }

        var result = {error: false, statusMessage: "Igrac editiran!"};
        return res.send(JSON.stringify(result));  
    }
}

//admin manage games
exports.manageGames = async function(req, res){
    var clubs = await Club.getAllClubs();
    var games = await Game.getAllGames();

    //manage games default
    if(req.method == "GET"){
        for(var i = 0; i < games.length; i++){
            games[i].date = games[i].date.replace(" ", "T");
        }
        
        return res.render(views + "manageGames.pug", {clubs: clubs, games: games});
    }

    //new game
    if(req.method == "POST"){
        const err = validationResult(req);

        //checking validation errors
        if(!err.isEmpty()){
            var msg = await Validator.readValidationErrors(err);
            var result = {error: true, statusMessage: msg};
            return res.send(JSON.stringify(result));
        }

        var game = new Game(null, req.body.homeclubID, req.body.date, req.body.awayclubID);
        if(!await game.createGame()){
            var result = {error: true, statusMessage: "Greska prilikom kreiranja utakmice!"};
            return res.send(JSON.stringify(result));
        }

        var result = {error: false, statusMessage: "Utakmica kreirana!"};
        return res.send(JSON.stringify(result));
    }

    //delete game
    if(req.method == "DELETE"){
        const err = validationResult(req);

        //checking validation errors
        if(!err.isEmpty()){
            var msg = await Validator.readValidationErrors(err);
            var result = {error: true, statusMessage: msg};
            return res.send(JSON.stringify(result));
        }

        //check if game with id exists
        if(!await Game.checkIfExists(req.body.dataID)){
            var result = {error: true, statusMessage: "Utakmica ne postoji!"};
            return res.send(JSON.stringify(result));            
        }

        //if error occured
        if(!await Game.deleteGame(req.body.dataID)){
            var result = {error: true, statusMessage: "Greska u brisanju utakmice!"};
            return res.send(JSON.stringify(result));             
        }

        var result = {error: false, statusMessage: "Utakmica izbrisana!"};
        return res.send(JSON.stringify(result)); 
    }

    //edit game
    if(req.method == "PUT"){
        const err = validationResult(req);

        //checking validation errors
        if(!err.isEmpty()){
            var msg = await Validator.readValidationErrors(err);
            var result = {error: true, statusMessage: msg};
            return res.send(JSON.stringify(result));
        }

        //check if game with id exists 
        if(!await Game.checkIfExists(req.body.id)){
            var result = {error: true, statusMessage: "Utakmica ne postoji!"};
            return res.send(JSON.stringify(result));             
        }

        var game = new Game(req.body.id, req.body.homeclubID, req.body.date, req.body.awayclubID);

        //if error occured
        if(!await game.editGame()){
            var result = {error: true, statusMessage: "Greska prilikom editiranja utakmice!"};
            return res.send(JSON.stringify(result));
        }

        var result = {error: false, statusMessage: "Utakmica editirana!"};
        return res.send(JSON.stringify(result)); 
    }
}

exports.finishGame = async function(req, res){
    if(req.method == "GET"){
        res.send("ok id je: " + req.params.clubID);
    }
}
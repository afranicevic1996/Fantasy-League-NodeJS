var express = require('express');
var path = require('path');
var validator = require("email-validator");
var User = require("../models/userModel");
var FantasyClub = require("../models/fantasyClubModel");
var Club = require("../models/clubModel");
var Positions = require('../models/positionsModel');
var views = process.cwd() + "/views/";
const bcrypt = require('bcrypt');
const { validationResult } = require("express-validator");

//homepage for user
exports.userIndex = function(req, res){
    res.sendFile(views + 'user.html');
}

//registering new user
exports.registerUser = async function(req, res){
    //if method is get show default page
    if(req.method == 'GET')
        return res.render(views + 'register.pug');

    //register user if method is post
    if(req.method == 'POST'){
        const err = validationResult(req);
        //checking for validation errors
        if(!err.isEmpty()){
            var errorMsg = err.errors;
            errorMsg = errorMsg[0].msg;
            return res.render(views + "register.pug", {message: errorMsg});
        }

        var user = new User(null, req.body.username, req.body.email, req.body.password, "user");
        var checkIfExists = await user.checkIfExists();

        //abort if username/email are taken
        if(checkIfExists)
            return res.render(views + "register.pug", {message: "Username/email already taken"});
        
        user.password = await bcrypt.hash(user.password, 10); //password hashing
        var register = await user.registerUser();

        if(register){
            //kreiraj sesiju za status poruku
            return res.redirect("login");
        }else{
            return res.render(views + "register.pug", {message: "Error during registration"});
        }       
    }
}

//login user
exports.loginUser = async function(req, res){
    //if method is get show default page
    if(req.method == 'GET'){
        return res.render(views + 'login.pug');
    }
    
    //login user if method is post
    if(req.method == 'POST'){
        const err = validationResult(req);
        //checking for validation errors
        if(!err.isEmpty()){
            var errorMsg = err.errors;
            errorMsg = errorMsg[0].msg;
            return res.render(views + "login.pug", {message: errorMsg})
        }

        var username = req.body.username;
        var password = req.body.password;
        var checkCreds = await User.checkCreds(username, password);
        
        //abort if credentials do not match
        if(!checkCreds){
            console.log("los password ili kriva kombinacija");
            return res.render(views + 'login.pug');
        }

        //get information about user
        var user = await User.getUserData(username);
        req.session.user = user;

        //redirect according to user role
        if(user.role == "user")
            return res.redirect("edit");
        
        if(user.role == "admin")
            return res.redirect("/admin");
    }
}

//logout
exports.logoutUser = function(req, res){
    if(req.method == 'GET'){
        req.session.destroy();
        return res.redirect("login");      
    }

    if(req.method == 'POST'){
        req.session.destroy();
        return res.redirect("login");
    }
}

//edit user
exports.editUser = async function(req, res, next){
    if(req.method == 'GET'){
        var user = req.session.user;
        var fClub = await FantasyClub.getFClubByUserId(user.id); //get user's fantasy club
        var clubs = await Club.getAllClubs(); //get all clubs
        var positions = await Positions.getAllPositions(); //get all player positions

        if(!fClub)
            return res.render(views + "editUser.pug", {user: user, fClub: fClub, clubs: clubs, positions: positions});
        
        var gi = 0, bi = 0, vi = 0, ni = 0, ki = 0;
        var fClubPlayersSorted = {
            golmani: [],
            branici: [],
            vezni: [],
            napadaci: [],
            klupa: []
        };

        var fClubPlayers = await FantasyClub.getFClubPlayers(fClub.id);

        //sorting players by positions and firstTeam/bench
        for(var i = 0; i < fClubPlayers.length; i++){
            if(fClubPlayers[i].positionID === 1){
                if(fClubPlayers[i].isFirstTeam)
                    fClubPlayersSorted.golmani[gi++] = fClubPlayers[i];
                else
                    fClubPlayersSorted.klupa[ki++] = fClubPlayers[i];
            }
            else if(fClubPlayers[i].positionID === 2){
                if(fClubPlayers[i].isFirstTeam)
                    fClubPlayersSorted.branici[bi++] = fClubPlayers[i];
                else
                    fClubPlayersSorted.klupa[ki++] = fClubPlayers[i];
            }
            else if(fClubPlayers[i].positionID === 3){
                if(fClubPlayers[i].isFirstTeam)
                    fClubPlayersSorted.vezni[vi++] = fClubPlayers[i];
                else
                    fClubPlayersSorted.klupa[ki++] = fClubPlayers[i];
            }
            else if(fClubPlayers[i].positionID === 4){
                if(fClubPlayers[i].isFirstTeam)
                    fClubPlayersSorted.napadaci[ni++] = fClubPlayers[i];
                else
                    fClubPlayersSorted.klupa[ki++] = fClubPlayers[i];
            }
        }

        return res.render(views + "editUser.pug", {user: user, fClub: fClub, clubs: clubs, positions: positions, fClubPlayers: fClubPlayersSorted});
    } 
}

//creating fantasy club
exports.fantasyClub = async function(req, res, next){
    const err = validationResult(req);

    //checking for validation errors
    if(!err.isEmpty()){
        var errorMsg = err.errors;
        errorMsg = errorMsg[0].msg;
        var result = {error: true, statusMessage: errorMsg};
        return res.send(JSON.stringify(result));
    }

    if(req.method == "POST"){
        var name = req.body.fClubName;
        name = name.trim();
        name = name.replace(/\s+/g, " ");

        //abort if fantasy club name is not valid
        if(!name.length){
            var result = {error: true, statusMessage: "Ime kluba ne smije biti prazno!"};
            return res.send(JSON.stringify(result));
        }

        //abort if fantasy club name already exists
        if(await FantasyClub.checkIfFantasyClubNameExists(name)){
            var result = {error: true, statusMessage: "Ime kluba je već zauzeto!"};
            return res.send(JSON.stringify(result));            
        }

        var user = req.session.user;
        //abort if user already has a fantasy club
        if(await FantasyClub.checkIfUserHasFclub(user.id)){
            var result = {error: true, statusMessage: "Već imate klub!"};
            console.log(result);
            return res.send(JSON.stringify(result));            
        }

        var fClub = new FantasyClub(null, name, user.id);
        //creating club
        if(!await fClub.createFantasyClub()){
            var result = {error: true, statusMessage: "Doslo je do greške prilikom kreiranja kluba!"};
            return res.send(JSON.stringify(result));             
        }

        var result = {error: false, statusMessage: "Klub uspješno kreiran!"};
        return res.send(JSON.stringify(result)); 
    }
}
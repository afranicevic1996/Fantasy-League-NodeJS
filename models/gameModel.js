const db = require('../config/db');
const bcrypt = require('bcrypt');
const fs = require('fs');
var Club = require("../models/clubModel");

module.exports = class Game{
    constructor(id, homeclubID, date, awayclubID){
        this.id = id;
        this.homeclubID = homeclubID;
        this.date = date;
        this.awayclubID = awayclubID;
    }

    //getting all games
    static async getAllGames(){
        try {
            //selecting data about the game and clubs involved
            var query =
                'SELECT games.id, games.homeclubID, c1.name AS homeclubName, c1.fileName AS homefileName,'+
                'games.date, games.awayclubID, c2.name AS awayclubName, c2.fileName AS awayfileName '+
                'FROM games '+
                'JOIN clubs c1 ON games.homeclubID=c1.id '+
                'JOIN clubs c2 ON games.awayclubID=c2.id;';
            const [rows, fields] = await db.query(query);
            if(!rows.length)
                return false;
            
            return rows;
        }
        catch (error) {
            console.error(error);
            return false;
        }       
    }

    //checking if game with given id exists
    static async checkIfExists(gameID){
        try {
            var query =
            'SELECT id FROM games WHERE id=?';
            const [rows, fields] = await db.query(query, [gameID]);
            if(!rows.length)
                return false;
            
            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }         
    }

    //creating new game
    async createGame(){
        try {
            //abort if home/away club does not exist
            if(!await Club.checkIfExists(this.homeclubID) || !await Club.checkIfExists(this.awayclubID))
                return false;

            var query =
            'INSERT INTO games (homeclubID, date, awayclubID) VALUES (?, ?, ?)';
            const [rows, fields] = await db.query(query, [this.homeclubID, this.date, this.awayclubID]);
            if(!rows.affectedRows)
                return false;
            
            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }       
    }

    //deleting game
    static async deleteGame(gameID){
        try {
            var query =
            'DELETE FROM games WHERE id=?';
            var [rows, fields] = await db.query(query, [gameID]);
            if(!rows.affectedRows)
                return false;
            
            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }          
    }

    //edit game
    async editGame(){
        try {
            //abort if home/away club does not exist
            if(!await Club.checkIfExists(this.homeclubID) || !await Club.checkIfExists(this.awayclubID))
                return false;

            var query =
            'UPDATE games SET homeclubID=?, date=?, awayclubID=? WHERE id=?';
            var [rows, fields] = await db.query(query, [this.homeclubID, this.date, this.awayclubID, this.id]);
            if(!rows.affectedRows)
                return false;
            
            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }        
    }
    
}
const db = require('../config/db');
const bcrypt = require('bcrypt');
const fs = require('fs')

module.exports = class Player{
    constructor(id, name, surname, clubID, fileName, positionID){
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.clubID = clubID;
        this.fileName = fileName;
        this.positionID = positionID;
    }

    //check if player with id exists
    static async checkIfExists(playerID){
        try {
            var query =
            'SELECT * FROM players WHERE id=?';
            const [rows, fields] = await db.query(query, [playerID]);
            if(!rows.length)
                return false;
            
            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }       
    }

    //get all players
    static async getAllPlayers(){
        try {
            var query =
            'SELECT * FROM players';
            const [rows, fields] = await db.query(query);
            return rows;
        }
        catch (error) {
            console.error(error);
            return false;
        }        
    }

    //get all players by club id
    static async getAllPlayersByClubId(clubID){
        try {
            var query =
            'SELECT * FROM players WHERE clubID=?';
            const [rows, fields] = await db.query(query, [clubID]);
            return rows;
        }
        catch (error) {
            console.error(error);
            return false;
        }        
    }

    //creating a player
    async createPlayer(){
        try {
            var query =
            'INSERT INTO players (name, surname, clubID, fileName, positionID) VALUES (?, ?, ?, ?, ?)';
            const [rows, fields] = await db.query(query, [this.name, this.surname, this.clubID, this.fileName, this.positionID]);
            if(!rows.affectedRows)
                return false;
            
            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }         
    }

    //deleting a player
    static async deletePlayer(playerID){
        try {
            var query =
            'SELECT fileName FROM players WHERE id=?';
            var [rows, fields] = await db.query(query, [playerID]);

            if(!rows.length)
                return false;
            
            var filePath = "./public/images/" + rows[0].fileName; //full path to image of deleting player          
            var query =
            'DELETE FROM players WHERE id=?';
            [rows, fields] = await db.query(query, [playerID]);
            if(!rows.affectedRows)
                return false;
            
            //removing image from the server
            fs.unlink(filePath, (error) => {
                if(error) console.error(error);
            });

            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }

    //edit player
    async editPlayer(){
        try {
            if(this.fileName == null){ //edit without new file
                var query =
                'UPDATE players SET name=?, surname=?, clubID=?, positionID=? WHERE id=?';
                var [rows, fields] = await db.query(query, [this.name, this.surname, this.clubID, this.positionID, this.id]);

                if(!rows.affectedRows)
                    return false;
                
                return true;
            }else{ //edit if new file was sent
                var query =
                'SELECT fileName FROM players WHERE id=?';
                var [rows, fields] = await db.query(query, [this.id]);

                if(!rows.length)
                    return false;

                var filePath = "./public/images/" + rows[0].fileName;

                //removing old image file from the server
                fs.unlink(filePath, (error) => {
                    if(error) console.error(error);
                });                

                query =
                'UPDATE players SET name=?, surname=?, clubID=?, fileName=?, positionID=? WHERE id=?';
                [rows, fields] = await db.query(query, [this.name, this.surname, this.clubID, this.fileName, this.positionID, this.id]); 
                
                if(!rows.affectedRows)
                    return false;

                return true;
            }

        }
        catch (error) {
            console.error(error);
            return false;
        }
    }

    //getting players by user input data
    //player name
    //club id
    //player positions (checkboxes)
    static async getPlayersBySearchData(data){
        if(!data.name && !data.clubID) //abort if player name and club id is not set, too broad search
            return false;
        
        try{
            //query to select all info about the players
            var query = 
                "SELECT players.id, players.name, players.surname, players.fileName, players.positionID, players.clubID, clubs.name AS clubName FROM `players` " + 
                "JOIN clubs ON players.clubID=clubs.id WHERE ";    
            
            //if player name is set add sql
            if(data.name)
                query += "players.name LIKE '%" + data.name + "%' ";

            //if club id is set add sql
            if(data.clubID){
                if(data.name)
                    query += "AND players.clubID=" + data.clubID + " ";
                else
                    query += "players.clubID=" + data.clubID + " ";
            }

            //if any checkbox have been checked add sql
            if(data.checkbox){
                query += "AND (";
                for(var i = 0; i < data.checkbox.length; i++){
                    //if only one position is checked
                    if(data.checkbox.length === 1){
                        query += "players.positionID=" + data.checkbox[i] + ")";
                        break;
                    }

                    //first data in data.checkbox
                    if(i === 0){
                        query += "players.positionID=" + data.checkbox[i] + " ";
                        continue;
                    }

                    //last data in data.checkbox
                    if(i === data.checkbox.length - 1){
                        query += "OR players.positionID=" + data.checkbox[i] + ")";
                        break;
                    }

                    query += "OR players.positionID=" + data.checkbox[i] + " ";
                }
            }

            var [rows, fields] = await db.query(query);
            if(!rows.length)
                return 0;

            return rows;
        }
        catch(error){
            console.error(error);
            return false;
        }
    }
}
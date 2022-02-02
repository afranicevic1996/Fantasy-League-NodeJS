const db = require('../config/db');
const bcrypt = require('bcrypt');
const fs = require('fs')

module.exports = class Club{
    constructor(id, name, location, fileName){
        this.id = id;
        this.name = name;
        this.location = location;
        this.fileName = fileName;      
    }

    //get all clubs
    static async getAllClubs(){
        try {
            var query =
            'SELECT * FROM clubs';
            const [rows, fields] = await db.query(query);
            return rows;
        }
        catch (error) {
            console.error(error);
            return false;
        }        
    }

    //check if club exists
    static async checkIfExists(clubID){
        try {
            var query =
            'SELECT name FROM clubs WHERE id=?';
            const [rows, fields] = await db.query(query, [clubID]);

            //return false if club was not found
            if(!rows.length)
                return false;

            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }        
    }

    //create club
    async createClub(){
        try {
            var query =
            'INSERT INTO clubs (name, location, fileName) VALUES (?, ?, ?)';
            const [rows, fields] = await db.query(query, [this.name, this.location, this.fileName]);

            //return false if club was not inserted
            if(!rows.affectedRows)
                return false;

            return true;
        }
        catch (error) {
            console.error(error);
            return error;
        }
    }

    static async deleteClub(clubID){
        try {
            var query =
            'SELECT fileName FROM clubs WHERE id=?';
            var [rows, fields] = await db.query(query, [clubID]);
            var filePath = "./public/images/" + rows[0].fileName; //path to images folder          

            query =
            'DELETE FROM clubs WHERE id=?';
            [rows, fields] = await db.query(query, [clubID]);
            if(!rows.affectedRows)
                return false;
            
            //deleting deleted club's image
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

    //edit club
    async editClub(){
        try {
            if(this.fileName == null){ //edit without new file
                var query =
                'UPDATE clubs SET name=?, location=? WHERE id=?';
                var [rows, fields] = await db.query(query, [this.name, this.location, this.id]);

                if(!rows.affectedRows)
                    return false;
                
                return true;
            }else{
                var query =
                'SELECT fileName FROM clubs WHERE id=?';
                var [rows, fields] = await db.query(query, [this.id]);

                if(!rows.length)
                    return false;

                var filePath = "./public/images/" + rows[0].fileName;

                //deleting old picture
                fs.unlink(filePath, (error) => {
                    if(error) console.error(error);
                });                

                query =
                'UPDATE clubs SET name=?, location=?, fileName=? WHERE id=?';
                [rows, fields] = await db.query(query, [this.name, this.location, this.fileName, this.id]); 
                
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
}
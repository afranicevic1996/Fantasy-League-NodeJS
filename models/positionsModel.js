const db = require('../config/db');

module.exports = class Positions{
    constructor(id, positionName){
        this.id = id;
        this.positionName = positionName;
    }

    //get all positions
    static async getAllPositions(){
        try {
            var query =
            'SELECT * FROM positions';
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

    //check if position with id exists
    static async checkIfExists(positionID){
        try {
            var query =
            'SELECT * FROM positions WHERE id=?';
            const [rows, fields] = await db.query(query, [positionID]);
            if(!rows.length)
                return false;

            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }        
    }
}
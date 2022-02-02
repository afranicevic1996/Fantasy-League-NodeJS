module.exports = class Validator{
    constructor(){};

    static async readValidationErrors(errList){
        var errorMsg = errList.errors;
        errorMsg = errorMsg[0].msg;
        return errorMsg;
    }
}
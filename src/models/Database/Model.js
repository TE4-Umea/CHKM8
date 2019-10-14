module.exports = class Model {


    constructor(key = 'id', table, value) {
        this.key = key;
        this.table = table;
        this.value = value;
        this.object = this.getModel(this.key, this.value);
    }

    /**
     * Gets a specific models database entry.
     * 
     * @param {string} key 
     * @param {string} value 
     */
    getModel(key, value) {
    }

    /**
     * Specifies if a model has a one to many relation with another model.
     * 
     * @param {Model} model
     */
    hasMany(model) {
        
    }


    /**
     * Specifies if a model has a one to one relation with another model.
     * 
     * @param {Model} model 
     */
    hasOne(model) {
        return 
    }

    /**
     * Specifices if a model belongs to another model.
     * 
     * @param {Model} model 
     */
    belongsTo(model) {
        // return model()
    }
};
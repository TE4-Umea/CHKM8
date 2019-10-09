class CheckTypes {
    constructor() {
        this.types = [];
        this.add('other');
        this.add('web');
        this.add('slack');
        this.add('card');
    }

    get_name(id) {
        return this.types[id];
    }

    get_id(name) {
        for (var i = 0; i < this.types.length; i++)
            if (this.types[i] == name) return i;
    }

    add(name) {
        this.types.push(name);
    }
}

module.exports = CheckTypes;

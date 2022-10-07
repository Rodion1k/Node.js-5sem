const EventEmitter = require('events');
const users = [
    {id: '1', name: 'John', bDay: '1990-01-01'},
    {id: '2', name: 'Mark', bDay: '2000-01-02'},
    {id: '3', name: 'Artem', bDay: '2010-01-03'},
];

class DataBaseManager extends EventEmitter {
    constructor() {
        super();
        this.data = users;
        this.index = 0;
    }

    select = () => {
        return this.data;
    }
    insert = user => {
        if (this.data.find(item => item.id === user.id)) {
            return false;
        }
        this.data.push(user);
        this.index++;
        return true;
    }
    update = (id, user) => {
        const index = this.data.findIndex(u => u.id === id);
        if (index === -1) {
            return false;
        }
        this.data[index] = user;
        return true;
    }
    delete = id => {
        const index = this.data.findIndex(u => u.id === id);
        if (index === -1) {
            return false;
        }
        this.data.splice(index, 1);
        this.index--;
        return true;
    }
    commit = () => {
    }
    emit = (method, req, resp) => {
        super.emit(method, req, resp);
    }
    on = (method, callback) => {
        super.on(method, callback);
    }
}


module.exports = DataBaseManager;
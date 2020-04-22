
// localStorage
var ls = {
    set: function (name, value) {
        localStorage.setItem(name, JSON.stringify(value));
        return value;    
    },

    get: function (name, defaultValue) {
        if (undefined === localStorage[name]) {
            if (undefined !== defaultValue) {
                ls.set(name, defaultValue);
                return defaultValue;
            } else {
                return null;
            }
        }
        try {
            return JSON.parse(localStorage.getItem(name));
        } catch (e) {
            ls.set(name, defaultValue);
            return defaultValue;
        }
    },

    remove: function (name) {
        localStorage.removeItem(name);
    }
};

// sessionStorage
var ss = {
    set: function (name, value) {
        sessionStorage.setItem(name, JSON.stringify(value));
        return value;    
    },

    get: function (name, defaultValue) {
        if (undefined === sessionStorage[name]) {
            if (undefined !== defaultValue) {
                ls.set(name, defaultValue);
                return defaultValue;
            } else {
                return null;
            }
        }
        try {
            return JSON.parse(sessionStorage.getItem(name));
        } catch (e) {
            ls.set(name, defaultValue);
            return defaultValue;
        }
    },

    remove: function (name) {
        sessionStorage.removeItem(name);
    }
};
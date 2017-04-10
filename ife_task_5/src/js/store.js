var store = (function() {
    var db = window.localStorage;

    var get = function(key) {
        return JSON.parse(db.getItem(key));
    };

    var set = function(key, value) {
        db.setItem(key, JSON.stringify(value));
    };

    var data = function(key, value) {
        if (value === null || value === undefined) {
            return get(key);
        } else {
            return set(key, value);
        }
    };

    var remove = function(key) {
        db.removeItem(key);
    };

    var clear = function() {
        db.clear();
    };
    
    return {
        get: get,
        set: set,
        data: data,
        remove: remove
    };
})();
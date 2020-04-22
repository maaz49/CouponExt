
var Store = function(){
	this._map = {};
	this._map['storeInfo'] = '/store/info/';
	this._map['storeCodes'] = '/store/codes/';
    this._map['storeSearch'] = '/store/search/';
}

Store.prototype.init = function() {

};

Store.prototype.info = function(domain, url, email, callback) {
    var data = {
        'domain': domain,
        'url': url,
        'email': email,
    };
	ajax(this._map['storeInfo'], data, function(response){
        callback(response);
    },function(xhr){});
}

Store.prototype.codes = function(domain, url, callback) {
    var data = {
        'domain': domain,
        'url': url,
    };
    ajax(this._map['storeCodes'], data, function(response){
        callback(response);
    },function(xhr){
        callback(xhr);
    });
}

Store.prototype.search = function(data, callback) {
    ajax(this._map['storeSearch'], data, function(response){
        callback(response);
    },function(xhr){});
}

var store = new Store();
store.init();

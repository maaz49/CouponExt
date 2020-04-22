
var Activity = function(){
    this._map = {};
    this._map['checkIn'] = '/activity/check-in-v2/';
    this._map['checkInClick'] = '/activity/check-in/click';
    this._map['checkInDetail'] = '/activity/check-in-detail-v2/';
    this._map['info'] = '/activity/info/';
    this._map['receiveGold'] = '/activity/receive-gold/';
}

Activity.prototype.init = function() {

};

Activity.prototype.info = function() {
    return _ajax(this._map['info']);
}

Activity.prototype.receiveGold = function(type) {
    return _ajax(this._map['receiveGold'], {
        type,
    });
}

Activity.prototype.checkInClick = function() {
    return _ajax(this._map['checkInClick'], {
        client_time: moment().format("YYYY-MM-DD HH:mm:ss"),
        client_date: moment().format("YYYY-MM-DD"),
        client_ym: moment().format("YYYY-MM"),
    });
}

Activity.prototype.checkIn = function(url) {
    return _ajax(this._map['checkIn'], {ct: moment().format("YYYY-MM-DD HH:mm:ss"), url});
}

Activity.prototype.checkInDetail = function() {
    return _ajax(this._map['checkInDetail'], {ct: moment().format("YYYY-MM-DD HH:mm:ss")});
}

var activity = new Activity();
activity.init();

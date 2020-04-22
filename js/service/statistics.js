
var Statistics = function(){
	this._map = {};
	this._map['afsrcTraffic'] = '/statistics/afsrc-traffic/';
	this._map['reActivate'] = '/statistics/re-activate/';
    this._map['userValidCode'] = '/statistics/user-valid-code/';
    this._map['toSupportMerchant'] = '/statistics/to-support-merchant/';
    this._map['log'] = '/statistics/log/';
    this._map['autoTestFeedbackRecord'] = '/statistics/auto-test-feedback-record/';
    this._map['needIt'] = '/statistics/need-it/';
    this._map['atService'] = '/statistics/at-service/';
    this._map['firstQualifying'] = '/statistics/first-qualifying/';
    this._map['remindCheckIn'] = '/statistics/remind-check-in/';
    this._map['popupAutoMoveLog'] = '/statistics/popup-auto-move-log/';
}

Statistics.prototype.init = function() {

};

Statistics.prototype.switchPos = function() {
	
}

Statistics.prototype.popupAutoMoveLog = function(data = {}) {
    return _ajax(this._map['popupAutoMoveLog'], data);
}

Statistics.prototype.remindCheckIn = function(data = {}) {
    return _ajax(this._map['remindCheckIn'], data);
}

Statistics.prototype.firstQualifying = function(data = {}) {
    return _ajax(this._map['firstQualifying'], data);
}

Statistics.prototype.atService = function(data = {}) {
    return _ajax(this._map['atService'], data);
}

Statistics.prototype.needIt = function(data = {}) {
    return _ajax(this._map['needIt'], data);
}

Statistics.prototype.autoTestFeedbackRecord = function(data = {}) {
    _ajax(this._map['autoTestFeedbackRecord'], data);
}

Statistics.prototype.log = function(data = {}) {
    _ajax(this._map['log'], data);
}

Statistics.prototype.toSupportMerchant = function(data = {}) {
    ajax(this._map['toSupportMerchant'], data ,function(data){
    },function(xhr){});
}

Statistics.prototype.afsrcTraffic = function(domain, url, type = "") {
    var data = {
        'url': url,
        'domain': domain,
        'type': type
    }
    ajax(this._map['afsrcTraffic'], data ,function(data){
    },function(xhr){});
}

Statistics.prototype.reActivate = function(domain) {
    var data = {
        'domain': domain,
    }
    ajax(this._map['reActivate'], data ,function(data){
    },function(xhr){});
}

Statistics.prototype.userValidCode = function(domain, code) {
    var data = {
        'domain': domain,
        'code': code
    }
    ajax(this._map['userValidCode'], data ,function(data){
    },function(xhr){});
}

var statistics = new Statistics();
statistics.init();

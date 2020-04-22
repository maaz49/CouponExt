
var Home = function(){
	this._blackList = [];
    this._afsrcWhiteList = [];
	this._afsrcList = {};
    this._adHomeList = {};
    this._adSearch = {};
    this._feedback = {};
    this._map = {};
	this._map['afsrcList'] = '/home/afsrc-list/';
    this._map['afsrcWhiteList'] = '/home/afsrc-white-list/';
	this._map['blackList'] = '/home/black-list/';
    this._map['adHome'] = '/home/ads/?pos=home';
    this._map['adSearch'] = '/home/ads/?pos=search';
    this._map['feedback'] = '/home/feedback/';
    this._map['hotDeals'] = '/home/hot-deals/';
}

Home.prototype.init = function() {
    this.blackList();
    this.afsrcList();
    this.afsrcWhiteList();
};

Home.prototype.hotDeals = function() {
	return _ajax(this._map['hotDeals'], {
        client_date: moment().format("YYYY-MM-DD"),
        hl: chrome.i18n.getMessage('lang'),
        day: new Date().getDay()
    });
};

Home.prototype.afsrcList = function() {
    var self = this;
	ajax(this._map['afsrcList'], {} ,function(data){
		self._afsrcList = data || {};
	},function(xhr){});
};

Home.prototype.afsrcWhiteList = function() {
    var self = this;
    ajax(this._map['afsrcWhiteList'], {} ,function(data){
        self._afsrcWhiteList = data || ['coupert.com'];
    },function(xhr){});
};

Home.prototype.blackList = function() {
    var self = this;
	ajax(this._map['blackList'], {} ,function(data){
        self._blackList = data.black_domains || [];
    },function(xhr){});
};

Home.prototype.adHome = function(callback) {
    var self = this;
    ajax(this._map['adHome'], {} ,function(data){
        self._adHomeList = data;
        callback(data);
    },function(xhr){});
}

Home.prototype.ads = function() {
    return _ajax(this._map['adHome']);
}

Home.prototype.adSearch = function() {
    ajax(this._map['adSearch'], {} ,function(data){
        this._adSearch = data;
    },function(xhr){});
}

Home.prototype.feedback = function(data, callback) {
    ajax(this._map['feedback'], data ,function(response){
        callback();
    },function(xhr){});
}

Home.prototype.isBlackDomain = function(domain) {
    return -1 != this._blackList.indexOf(domain);
}

Home.prototype.isAfsrcURL = function(url) {
    for (var index = 0; index < this._afsrcWhiteList.length; index++) {
        if (url && -1  != url.toLowerCase().indexOf(this._afsrcWhiteList[index])) {
            return 'self-traffic';//self traffic
        }
    }
    /*if (url && -1 != url.toLowerCase().indexOf('afsrc=1')) {
        return {scope:'TAB'};
    }*/
    for (var af in this._afsrcList) { //other publisher trafffic
        for (var index = 0; index < this._afsrcList[af].length; index++) {
            if (url && -1 != url.toLowerCase().indexOf(this._afsrcList[af][index]['Keywords'])) {
                // this._afsrcList[af][index]['OverridePopup'] = "YES";
                return {scope:this._afsrcList[af][index]['Scope'], "af":af, "afsrc-popup": this._afsrcList[af][index]['AfsrcPopup'], "override-popup": this._afsrcList[af][index]['OverridePopup']};
            }
            if (url && isValidURL(url, this._afsrcList[af][index]['Keywords'])) {
                // this._afsrcList[af][index]['OverridePopup'] = "YES";
                return {scope:this._afsrcList[af][index]['Scope'], "af":af, "afsrc-popup": this._afsrcList[af][index]['AfsrcPopup'], "override-popup": this._afsrcList[af][index]['OverridePopup']};
            }
        }
    }
    return undefined;//Organic traffic
}

var home = new Home();
home.init();

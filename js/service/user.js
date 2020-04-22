
var User = function(){
	this._map = {};
    this._map['userInfo'] = '/user/info/';
	this._map['userInstall'] = '/user/install/';
	this._map['userUninstall'] = '/user/uninstall/';
    this._map['userSignin'] = '/user/signin/';
    this._map['userSignup'] = '/user/signup/';
    this._map['userToken'] = '/user/token/';
    this._map['userToken'] = '/user/token/';
    this._map['userLogout'] = '/user/logout/';
    this._map['authFacebook'] = '/auth/facebook/?action=check-fb-login';
    this._map['userResetPassword'] = '/user/reset-password/';
    this._map['userClickException'] = '/user/click-exception/';
    this._map['userShareCode'] = '/user/share-code/';
    this._map['userCompleteProfile'] = '/user/complete-profile/';
    this._map['userTasks'] = '/user/tasks/';
}

User.prototype.init = function() {

};

User.prototype.tasks = function() {
    return _ajax(this._map['userTasks'], {
        client_date: moment().format("YYYY-MM-DD"),
        hl: chrome.i18n.getMessage('lang'),
        day: new Date().getDay()
    });
}

User.prototype.userCompleteProfile = function(data = {}) {
    return _ajax(this._map['userCompleteProfile'], data);
}

User.prototype.userShareCode = function(data = {}, success, fail) {
    ajax(this._map['userShareCode'], data ,function(response){
        success(response);
    },function(xhr){
        if (!!fail) {
            fail(xhr);
        }
    });
}

User.prototype.clickException = function(type, position) {
    var data = {
        'type': type,
        'position': position
    }
    ajax(this._map['userClickException'], data ,function(response){
    },function(xhr){});
}

User.prototype.info = function(data, success, fail) {
    ajax(this._map['userInfo'], data ,function(response){
        success(response);
    },function(xhr){
        if (!!fail) {
            fail(xhr);
        }
    });
}

User.prototype.install = function(guid) {
    ajax(this._map['userInstall'], {} ,function(data){
    },function(xhr){});
}

User.prototype.uninstall = function(guid) {
    ajax(this._map['userUninstall'], {} ,function(data){
    },function(xhr){});
}

User.prototype.signin = function(data, success, error) {
    ajax(this._map['userSignin'], data ,function(response){
        success(response);
    },function(xhr){
        error(xhr);
    });
}

User.prototype.signup = function(data, success, error) {
    ajax(this._map['userSignup'], data ,function(response){
        success(response);
    },function(xhr){
        error(xhr);
    });
}

User.prototype.token = function(success, error) {
    ajax(this._map['userToken'], {} ,function(response){
        success(response);
    },function(xhr){
        error(xhr);
    });
}

User.prototype.logout = function(callback) {
    ajax(this._map['userLogout'], {} ,function(response){
        callback(response);
    },function(xhr){});
}

User.prototype.fbLogin = function(success, error) {
    ajax(this._map['authFacebook'], {} ,function(response){
        success(response);
    },function(xhr){
        error(xhr);
    }, {url:baseURL + this._map['authFacebook']});
}

User.prototype.resetPassword = function(data, success, error) {
    ajax(this._map['userResetPassword'], data ,function(response){
        success(response);
    },function(xhr){
        error(xhr);
    });
}

var user = new User();
user.init();

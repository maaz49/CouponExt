'use strict';

var Service = function(){	
	this._map = {};
    this._map['merchantClick'] = '/service/merchant/click/';
    this._map['dealClick'] = '/service/deal/click/';
    this._map['closeClick'] = '/service/close/click';
    this._map['iconClick'] = '/service/icon/click/';
	this._map['ccClick'] = '/service/cc/click/';
	this._map['ccImpr'] = '/service/cc/impr/';
    this._map['cbClick'] = '/service/cb/click/';
    this._map['cbImpr'] = '/service/cb/impr/';
    this._map['cbInjectImpr'] = '/service/cb/inject-impr/';
    this._map['cbInjectError'] = '/service/cb/inject-error/';
    this._map['atClick'] = '/service/at/click/';
    this._map['atImpr'] = '/service/at/impr/';
    this._map['searchClick'] = '/service/search/click/';
    this._map['atApplyBestCode'] = '/service/at/apply-best-code/';
    this._map['serviceError'] = '/service/error/log/';
    this._map['hotDealClick'] = '/service/hot-deals/click/';
}

Service.prototype.init = function() {

};

Service.prototype.hotDealClick = function(dealId, trackingId) {
    var data = {
        deal_id: dealId,
        tracking_id: trackingId,
        client_time: moment().format("YYYY-MM-DD HH:mm:ss"),
        client_date: moment().format("YYYY-MM-DD"),
    };
    ajax(this._map['hotDealClick'], data ,function(data){
    },function(xhr){});
};

Service.prototype.searchClick = function(storeId, trackingId, type) {
    var data = {
        'store_id':storeId,
        'tracking_id': trackingId,
        'type': type
    };
    ajax(this._map['searchClick'], data ,function(data){
    },function(xhr){});
};

Service.prototype.serviceError = function(domain, url, errorType, errorPosition, errorMessage) {
    var data = {
        'domain':domain,
        'url': url,
        'error_type': errorType,
        'error_position': errorPosition,
        'error_message': errorMessage,
    };
    ajax(this._map['serviceError'], data ,function(data){
    },function(xhr){});
};

Service.prototype.merchantClick = function(storeId, trackingId, userEmail) {
    var data = {
        'store_id':storeId,
        'tracking_id': trackingId,
        'user_email': userEmail
    };
    ajax(this._map['merchantClick'], data ,function(data){
    },function(xhr){});
};

Service.prototype.dealClick = function(storeId, dealId, trackingId, userEmail) {
    var data = {
        'store_id':storeId,
        'deal_id': dealId,
        'tracking_id': trackingId,
        'user_email': userEmail
    };
    ajax(this._map['dealClick'], data ,function(data){
    },function(xhr){});
};

Service.prototype.closeClick = function(domain, storeId, type) {
    var data = {
        'domain':domain,
        'store_id': storeId,
        'type': type
    };
    ajax(this._map['closeClick'], data ,function(data){
    },function(xhr){});
};

Service.prototype.iconClick = function(domain, storeId) {
    var data = {
        'domain':domain,
        'store_id': storeId
    };
    ajax(this._map['iconClick'], data ,function(data){
    },function(xhr){});
};

Service.prototype.ccClick = function(storeId, couponId, trackingId, userEmail) {
    var data = {
        'store_id': storeId,
        'coupon_id': couponId,
        'tracking_id': trackingId,
        'user_email': userEmail
    };
    ajax(this._map['ccClick'], data ,function(data){
    },function(xhr){});
};

Service.prototype.ccImpr = function(domain, storeId) {
    var data = {
        'domain': domain,
        'store_id': storeId
    };
    ajax(this._map['ccImpr'], data ,function(data){
    },function(xhr){});
};

Service.prototype.cbClick = function(domain, storeId, clickType, trackingId, leastOrderAmount, cashbackPercentage, image, userEmail) {
    var data = {
        'img': image,
        'domain': domain,
        'store_id': storeId,
        'click_type': clickType,
        'tracking_id': trackingId,
        'least_order_amount': leastOrderAmount,
        'cashback_percentage': cashbackPercentage,
        'user_email': userEmail
    };
    ajax(this._map['cbClick'], data ,function(data){
    },function(xhr){});
};

Service.prototype.cbImpr = function(domain, url, image = '', type) {
    var data = {
        'domain': domain,
        'url': url,
        'img': image,
        type: type
    };
    ajax(this._map['cbImpr'], data ,function(data){
    },function(xhr){});
};

Service.prototype.cbInjectImpr = function(domain, url) {
    var data = {
        'domain': domain,
        'url': url,
    };
    ajax(this._map['cbInjectImpr'], data ,function(data){
    },function(xhr){});
};

Service.prototype.cbInjectError = function(storeId, errorMsg) {
    var data = {
        'store_id': storeId,
        'error_msg': errorMsg,
    };
    ajax(this._map['cbInjectError'], data ,function(data){
    },function(xhr){});
};

Service.prototype.atClick = function(storeId, clickType, trackingId,  userEmail) {
    var data = {
        'store_id': storeId,
        'click_type': clickType,
        'tracking_id': trackingId,
        'user_email': userEmail
    };
    ajax(this._map['atClick'], data ,function(data){
    },function(xhr){});
};

Service.prototype.atImpr = function(domain, url) {
    var data = {
        'domain': domain,
        'url': url
    };
    ajax(this._map['atImpr'], data ,function(data){
    },function(xhr){});
};

Service.prototype.atApplyBestCode = function(bestCoupon, saving, couponId) {
    var data = {
        'coupon': bestCoupon,
        'saving': saving,
        'coupon_id': couponId
    };
    ajax(this._map['atApplyBestCode'], data ,function(data){
    },function(xhr){});
};

var service = new Service();
service.init();


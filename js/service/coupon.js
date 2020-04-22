var Coupon = function(){
	this._map = {};
	this._map['couponWork'] = '/coupon/work/';
	this._map['couponExpire'] = '/coupon/expire/';
	this._map['couponIsBest'] = '/coupon/is-best/';
}

Coupon.prototype.init = function() {

};

Coupon.prototype.work = function(data) {
	ajax(this._map['couponWork'], data ,function(data){
    },function(xhr){});
}

Coupon.prototype.expire = function(data) {
    ajax(this._map['couponExpire'], data ,function(data){
    },function(xhr){});
}

Coupon.prototype.isBest = function(coupon_id) {
	var data = {
		'coupon_id': coupon_id,
		'batch_number': ls.get("batch-number")
	};
    ajax(this._map['couponIsBest'], data ,function(data){
    },function(xhr){});
}
var coupon = new Coupon();
coupon.init();

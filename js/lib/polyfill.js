"use strict";

    const baseURL = "https://www.coupert.com";
    const imgURL = baseURL;
    const apiURL = baseURL + "/api";

    const googleReviewURL = "https://chrome.google.com/webstore/detail/coupert-instant-coupons-a/mfidniedemcgceagapgdekdbmanojomk/reviews";

    const twitterShareURL = "https://www.twitter.com/share?url=https://www.coupert.com/share/twitter/{REF}/&text=Just saved some cash using the Coupert app! Join Coupert for free and get $2 bonus NOW!";
    const facebookShareURL = "https://www.facebook.com/dialog/share?app_id=827844234051458&display=popup&href=https://www.coupert.com/share/facebook/{REF}/";
    const messagesShareURL = "https://www.facebook.com/dialog/send?app_id=827844234051458&link=coupert.com/share/facebook/{REF}/&redirect_uri=https://www.coupert.com/share/facebook/{REF}/";
    const emailShareURL = "mailto:?subject=[[subject]]&body=[[body]]";

    const ambassadorProgramURL =  baseURL + "/ambassador-program?utm_source=extension&utm_campaign=US&utm_content=";

    const feedbackURL = baseURL + "/feedback?site=US";

    const REFER_FRIEND_URL = baseURL + "/ref/";

    const howItWorksURL = baseURL + "/how-it-works/?utm_source=extension&utm_campaign=US&utm_content=";

    const GUIDE_URL = baseURL + "/guide/?utm_source=extension&utm_campaign=US&utm_content=";

    const PRIVACY_POLICY_URL = baseURL + "/privacy/";

    const TERMS_OF_USE_URL = baseURL + "/terms/";

    const WELCOME_URL = baseURL + "/welcome?site=US&utm_source=extension&utm_campaign=US&utm_content=";

    const FIRST_QUALIFYING_DEALS = baseURL + "/first-qualifying-deals?utm_source=extension&utm_campaign=US&utm_content=";

    const BLACK_FRIDAY = baseURL + "/black-friday?site=US&utm_source=extension&utm_campaign=US&utm_content=";
    
    const CHRISTMAS = baseURL + "/christmas?site=US&utm_source=extension&utm_campaign=US&utm_content=";

    const CREDIT_CARD = baseURL + "/credit-cards?site=US&_v=2&guid=";

    const HELP_URL = baseURL + "/help?site=US&utm_source=extension&utm_campaign=US&utm_content=";

    const CART_URL = baseURL + "/checkout/cart?site=US&utm_source=extension&utm_campaign=US&utm_content=";

    function ajax(uri, data, resolve, reject, options = {}) {
        data = Object.assign(data, basicParam());
        console.log(apiURL + uri)
        var params = {
            url:apiURL + uri,
            method:'GET',
            dataType:"json",
            async: true,
            data:data
        };
        console.log('Parameters')
        console.log(Object.assign(params, options))
        $.ajax(Object.assign(params, options)).done(function(data){
            console.log('data')
            console.log(data);
            ls.set("uid", ("uid" in data ? data.uid : ""));
            if ("_c" in data && data["_c"] != ls.get("_c")) {
                if (typeC(home) !== "undefined") {
                    home.init();
                }
                ls.set("_c", data["_c"]);
            }
            if(data && data.ret_code == 0)
                resolve(data.data);
            else {
                reject(data);
            }
        }).fail(function(xhr){
            reject(xhr);
        });
    }

    function _ajax(uri, data = {}, options = {}){
        console.log(apiURL + uri);
        data = Object.assign(data, basicParam());
        var params = {
            url: apiURL + uri,
            type: 'GET',
            dataType: "json",
            async: true,
            data: data
        };

        return new Promise((resolve, reject) => {
            $.ajax(Object.assign(params, options))
            .done(function (data) {
                resolve(data);
            })
            .fail(function (xhr) {
                reject(xhr);
            });
        });
    }

    function delay(milliseconds) {
        var promiseCancel, promise = new Promise(function(resolve, reject){
            var timeOutId = setTimeout(resolve, milliseconds);
            promiseCancel = function (){
                clearTimeout(timeoutId);
                reject(Error('Cancelled'));
            }
        });
        promise.cancel = function() {
            promiseCancel();
        }
        return promise;
    }

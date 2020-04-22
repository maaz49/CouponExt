// when content.js loaded, start initialize
init();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse){
    switch (message.action) {
        case 'get-cart-total':
            getCartTotal(message, sendResponse);
            break;
        case 'at-popup-minimize':
            showSmallATPopup();
            break;
        case 'get:url':
            sendResponse({url:window.location.href});
            break;
        case 'Cookies-get':
            sendResponse({name: message.name, value: Cookies.get(message.name, message.options || {})});
            break;
        case 'Cookies-set':
            Cookies.set(message.name, message.value, message.options || {});
            break;
        case 'need-it':
            needIt();
            break;
        case 'show-close-tips':
            showCloseTips(message);
            break;
        case 'show-guidance-popup':
            showGuidancePopup();
            break;
        case "check-if-content-loaded":
            checkIfContentLoaded(message, sendResponse);
            break;
        case "refer-friend":
            referFriend(message, sendResponse);
            break;
        case "first-visit-popup-cb":
            firstVisitPopupCB(message);
            break;
        case "inject-cb-button":
            injectCbButton(message);
            break;
        case "reset-inject-cb-button":
            resetInjectCbButton();
            break;
        case "set-inject-cb-button-actived":
            setInjectCbButtonActived();
            break;
        case "checkout":
            checkout(message);
            break;
        case "check-web-flag":
            checkWebFlag(message, sendResponse);
            return true;
        case "show-iframe":
            showIframe(message);
            break;
        case "hide-iframe":
            hideIframe(message);
            break;
        case "close-iframe":
            closeIframe(message);
            break;
        case "execute-test-rule":
            executeTestRule(message, sendResponse);
            return true;// when use async, must return true
        case "apply-best-code":
            applyBestCode(message);
            break;
        case "get-last-result":
            getLastResult(message);
            break;
        case "show-at-testing-page":
            showAtTestingPage();
            break;
        case "show-at-success-result-page":
            showAtSuccessResultPage();
            break;
        case "show-at-error-result-page":
            showAtErrorResultPage();
            break;
        case "show-store-popup-page":
            showStorePopupPage(message);
            break;
        case "show-feedback-page":
            showFeedbackPage(message);
            break;
        case "show-gold-increase-page":
            showGoldIncreasePage(message);
            break;
        case "show-ambassador-program-popup-page":
            showAmbassadorProgramPopupPage(message);
            break;
        case "show-dialog":
            showDialog(message, sender, sendResponse);
            break;
        case "preloading-store-popup-page":
            preloadingStorePopupPage();
            break;
        case "reloading-store-popup-page":
            reloadingStorePopupPage(message);
            break;
        case "show-cb-popup-page":
            showcbPopupPage();
            break;
        case "remove-cookie":
            removeCookieOnContent(message);
            break;
        case "set-affiliate-cookie":
            setAffiliateCookie(message, sendResponse);
            break;
        case "set-cashback-cookie":
            setCashbackCookie(message, sendResponse);
            break;
        case "set-cache-or-cookie":
            setCacheOrCookieOnContent(message, sendResponse);
            break;
        case "get-cache-or-cookie":
            getCacheOrCookieOnCentent(message, sendResponse);
            break;
        case "remove-cache-or-cookie":
            removeCacheOrCookieOnContent(message);
            break;
        case "switch-panel-location":
            switchPanelLocation(message);
            break;
        case "set_saved":
            $(".ship_order_summary").append("<span style='font-size:18px;'> Saved with coupert :</span>");
            $(".ship_order_summary").append("<span style='font-size:18px;' class='text-right;'>"+message.saved+"</span>");
            break;
        case "best-code-applied-check":
            bestCodeAppliedCheck(message);
            break;
        default:
            break;
    }
});

function getCartTotal(message, sendResponse) {
    var cartTotalPriceSelector = message.cart_total_price_selector;
    if (!!cartTotalPriceSelector) {
        if ($(cartTotalPriceSelector).length > 0) {
            var price = $.trim($(cartTotalPriceSelector).text());
            sendResponse({price: price});
        }
    }
}

function needIt() {
    chrome.runtime.sendMessage({action:'need-it', url: window.location.href});
}

/*----------------------------- checkout ----------------------------*/
    function checkIfContentLoaded(message, sendResponse){
        var url = window.location.href;
        sendResponse({"action": "completed", "url": url});
    }

    function firstVisitPopupCB(message){
        if ("YES" == Cookies.get("cb_activate")) {
            return ;
        }
        if ("YES" === Cookies.get("cb_first_visit_popup")) {
            return ;
        }
        if ("YES" === Cookies.get("cb_override_working")) {
            return ;
        }
        if ("YES" !== Cookies.get("cb_first_visit_turnoff")) {
            showFirstVisitCBPopup();
            Cookies.set("cb_first_visit_popup", "YES", {expires: 60 * 60 * 2, domain: message['root-domain']});
        }
    }

    function injectCbButton(message){
        let data = message["data"];
        let injectElement = data["store-info"]["inject_cb_button"];
        if (!injectElement) {
            return ;
        }
        let rules = injectElement.split("@@@");
        if (rules.length > 0) {
            for (let index = 0; index < rules.length; index ++) {
                let rule = rules[index].split("###");
                let element = rule[0].trim();
                let method = rule[1].trim();
                if (!element) {
                    return ;
                }
                let sendData = {
                    domain: data["domain"],
                    url: window.location.href,
                    errorType: "CB-INJECTION-INSERT-ERROR",
                    errorPosition: "cb-injection-insert",
                };
                waitFor(function(){return $(element).length;}, function(){
                }, 60*1000*2, function(e){
                    sendData["errorMessage"] = e.toString();
                    sendMessageToBackground("service:serviceError", sendData);
                });
                waitFor(function(){return $(element).length;}, function(){
                    console.log(element, "injected!!!");
                    injectCbButtonHtml(element, method, data);
                }, 60*1000*18, function(errorMsg){
                });
            }
        }
    }

    function checkout(message){
        if (refreshAtTesting() || refreshAtSuccess()) {
            return ;
        }
        if (analyzeAjaxResult() || refreshBCPopup()) {
            return ;
        }
        webFlagCheck(message);
        getUserValidCode(message);
    }

    function analyzeAjaxResult(){
        if (!!getCookie("ajax_at_success_flag")) {
            checkBodyElementIsExist();
            return true;
        }
        return false;
    }

    function refreshBCPopup(){
        var sessionCache = batchGetSessionCache("bc-has-popped-up");
        if ("YES" === sessionCache["bc-has-popped-up"]) {
            return false;
        }
        var bcPopup = getCookie('refresh_bc_popup');
        if ("YES" == bcPopup) {
            showBcPopupPage();
            return true;
        }
        return false;
    }

    function refreshAtTesting(){
        if ("YES" == getCookie("refresh_at_flag")) {
            showAtTestingPage();
            return true;
        }
        return false;
    }

    function refreshAtSuccess(){
        if ("YES" == getCookie("refresh_at_success_flag")) {
            showAtSuccessResultPage();
            return true;
        }
        return false;
    }

    function checkBodyElementIsExist(){
        var interval = setInterval(function () {
            if ($('body').length != 0) {
                clearInterval(interval);
                showAtSuccessResultPage();
            }
        }, 100);
    }

    function webFlagCheck(message){
        if ('YES' === Cookies.get('at_closed')) {
            return ;
        }
        var webFlag = message.info.web_flags;
        if (!!webFlag) {
            let sendData = {
                domain: message["domain"],
                url: window.location.href
            };
            waitFor(function(){eval(webFlag);console.log("sub web check:", webcheck);return webcheck;}, function(){
            }, 60*1000*1.5, function(e){
                var errorStr = e.toString();
                if(-1 !== errorStr.indexOf("Timeout")) {
                    sendData["errorType"] = "WEB-CHECK-NO-RESULT-ERROR";
                    sendData["errorPosition"] = "web-check-no-result";
                    sendData["errorMessage"] = errorStr;
                } else {
                    sendData["errorType"] = "RULE-EXECUTE-ERROR";
                    sendData["errorPosition"] = "WebFlags";
                    sendData["errorMessage"] = errorStr;
                }
                sendMessageToBackground("service:serviceError", sendData);
            });
            waitFor(function(){eval(webFlag);console.log("web check:", webcheck);return webcheck;}, function(){
                if (!!message.info.cart_total_price_selector) {
                    showATPopupHStyle(message.info.cart_total_price_selector);
                } else if (!!message.info.apply_element) {
                    showATPopupStyle(message.info.apply_element);
                } else {
                    showAtPopupPage(message);
                }
            }, 60*1000*30, function(e){
            });
        } else {
            if (!!message.info.cart_total_price_selector) {
                showATPopupHStyle(message.info.cart_total_price_selector);
            } else if (!!message.info.apply_element) {
                showATPopupStyle(message.info.apply_element);
            } else {
                showAtPopupPage(message);
            }
        }
    }

    function getUserValidCode(message){
        var getCodeRule = message.info.get_code;
        if (!!getCodeRule) {
            var rule = getCodeRule.split("%%%");
            var checkWebElement = rule[0];
            var extractCode = rule[1];
            if(!!checkWebElement && !!extractCode){
                var alreadyFetchedCode = [];
                waitFor(function(){return eval(checkWebElement);}, function(){
                    eval(extractCode);
                    if (valid_code && !alreadyFetchedCode.includes(valid_code) && alreadyFetchedCode.length <= 10) {
                        chrome.runtime.sendMessage({action:"save-valid-code",domain:message.domain,validCode:valid_code});
                        alreadyFetchedCode.push(valid_code);
                    }
                }, 60*1000*50);
            }
        }
    }

    function checkWebFlag(message, sendResponse){
        var webFlag = message["web-flag"];
        if (!!webFlag) {
            waitFor(function(){eval(webFlag);return webcheck;}, function(){
                sendResponse({
                    "data": 1
                });
            }, 60*1000*30, function(errorMsg){
            });
        } else {
            sendResponse({
                "data": 1
            });
        }
    }
/*------------------------------ > ^_^ < ----------------------------*/


/*---------------------- cookie cache operation ---------------------*/
    function removeCookieOnContent(message, sendResponse){
        if ("string" == typeof message.name) {
            removeCookie(message.name, message.domain);
        } else {
            for (var i = 0; i < message.name.length; i++){
                removeCookie(message.name[i], message.domain);
            }
        }
    }

    function setAffiliateCookie(message, sendResponse){
        let relation = message.relation;
        let domain = message.domain;
        let options = {
            expires: 60*60*2
        };
        if (!!domain) {
            options["domain"] = domain;
        }
        if ("competitor" === relation) {
            if ("self" === Cookies.get("affiliate_relation", options)) {
                chrome.runtime.sendMessage({action: "override-cookie", domain: domain, value: "YES"});
                Cookies.set("affiliate_relation", relation, options);
            }
            sendResponse({"status": "competitor"});
        } else {
            chrome.runtime.sendMessage({action: "override-cookie", domain: domain, value: "NO"});
            if ("self" !== Cookies.get("affiliate_relation", options)) {
                Cookies.set("affiliate_relation", relation, options);
                sendResponse({"status": "competitor"});
            } else {
                sendResponse({"status": "self"});
            }
        }
    }

    function setCashbackCookie(message, sendResponse){
        setCookie("cb_activate", "YES", 60*60*2, message.domain);
        sendResponse({"status": "success"});
    }

    function setCacheOrCookieOnContent(message, sendResponse) {
        if ("cookie" in message) {
            batchSetCookie(message.cookie);
        }
        if ("cache" in message) {
            if ("type" in message && "session" == message.type) {
                batchSetSessionCache(message.cache);
            } else {
                batchSetCache(message.cache);
            }
        }
        if ("session-cache" in message) {
            batchSetSessionCache(message["session-cache"]);
        }
        if ("local-cache" in message) {
            batchSetCache(message["local-cache"]);
        }
        sendResponse({"status": "success"});
    }

    function getCacheOrCookieOnCentent(message, sendResponse){
        var data = {};
        if ("cookie" in message) {
            var temp = batchGetCookie(message.cookie);
            data = Object.assign(data, temp);
        }
        if ("cache" in message) {
            if ("type" in message && "session" == message.type) {
                var temp = batchGetSessionCache(message.cache);
                data = Object.assign(data, temp);
            } else {
                var temp = batchGetCache(message.cache);
                data = Object.assign(data, temp);
            }
        }
        if ("session-cache" in message) {
            var temp = batchGetSessionCache(message["session-cache"]);
            data = Object.assign(data, temp);
        }
        if ("local-cache" in message) {
            var temp = batchGetCache(message["local-cache"]);
            data = Object.assign(data, temp);
        }
        sendResponse(data);
    }

    function removeCacheOrCookieOnContent(message){
        if ("cookie" in message) {
            batchRemoveCookie(message.cookie);
        }
        if ("cache" in message) {
            if ("type" in message && "session" == message.type) {
                batchRemoveSessionCache(message.cache);
            } else {
                batchRemoveCache(message.cache);
            }
        }
        if ("session-cache" in message) {
            batchRemoveSessionCache(message["session-cache"]);
        }
        if ("local-cache" in message) {
            batchRemoveCache(message["local-cache"]);
        }
    }
/*------------------------------ > ^_^ < ----------------------------*/


/*------------------------ execute test rule ------------------------*/
    var testing_flag = {};
    function executeTestRule(message, sendResponse){
        var rule = message.rule;
        var code = message.code;
        domain = message.domain;
        var org_price = null;
        var now_price = null;
        var result_tips = "";
        var data = {};
        let sendData = {
            domain: message["domain"],
            url: window.location.href,
            errorType: "RULE-EXECUTE-ERROR"
        };
        try {
            eval(rule.get_price);
        } catch (e) {
            sendData["errorPosition"] = "get_price";
            sendData["errorMessage"] = e.toString();
            sendMessageToBackground("service:serviceError", sendData);
        }
        // if ("YES" != rule.is_refresh) {
            if ("YES" == rule.is_promise) {
                new Promise(function (resolve) {
                    try {
                        eval(rule.remove_init);
                    } catch (e) {
                        sendData["errorPosition"] = "remove_init";
                        sendData["errorMessage"] = e.toString();
                        sendMessageToBackground("service:serviceError", sendData);
                    }
                }).then(function (resolve) {
                    // call at-testing.js send next code
                    if ("YES" == rule.is_mix) {
                        setTimeout(function () {
                            execJs('window.location.reload();');
                        }, 500);
                    } else {
                        data["org_price"] = !!data["org_price"] ? data["org_price"] : org_price;
                        data["now_price"] = !!data["now_price"] ? data["now_price"] : now_price;
                        data["result_tips"] = !!data["result_tips"] ? data["result_tips"] : result_tips;
                        let responseDate = excuteApplyCodeRule(data, rule, code, domain);
                        sendResponse({
                            "action": "next-code",
                            "data": responseDate,
                        });
                    }
                });
            } else {
                try {
                    eval(rule.remove_init);
                } catch (e) {
                    sendData["errorPosition"] = "remove_init";
                    sendData["errorMessage"] = e.toString();
                    sendMessageToBackground("service:serviceError", sendData);
                }
                if ("YES" == rule.is_mix) {
                    setTimeout(function () {
                        execJs('window.location.reload();');
                    }, 500);
                } else {
                    data["org_price"] = !!data["org_price"] ? data["org_price"] : org_price;
                    data["now_price"] = !!data["now_price"] ? data["now_price"] : now_price;
                    data["result_tips"] = !!data["result_tips"] ? data["result_tips"] : result_tips;
                    let responseDate = excuteApplyCodeRule(data, rule, code, domain);
                    sendResponse({
                        "action": "next-code",
                        "data": responseDate,
                    });
                }
            }
        // }
    }

    function excuteApplyCodeRule(data, rule, code, domain){
        let org_price = (null != data['org_price']) ? data["org_price"] : null;
        let now_price = (null != data['now_price']) ? data["now_price"] : null;
        let result_tips = !!data['result_tips'] ? data["result_tips"] : "";
        let sendData = {
            domain: domain,
            url: window.location.href,
            errorType: "RULE-EXECUTE-ERROR"
        };
        try {
            eval(rule.apply_code);
        } catch (e) {
            sendData["errorPosition"] = "apply_code";
            sendData["errorMessage"] = e.toString();
            sendMessageToBackground("service:serviceError", sendData);
        }
        org_price = (null != data['org_price']) ? data["org_price"] : org_price;
        now_price = (null != data['now_price']) ? data["now_price"] : now_price;
        result_tips = !!data['result_tips'] ? data["result_tips"] : result_tips;
        return {
            "code": code,
            "org_price" : org_price,
            "now_price" : now_price,
            "result_tips" : result_tips
        };
    }

    function getLastResult(message){
        var rule = message.rule;
        let sendData = {
            domain: message["domain"],
            url: window.location.href,
            errorType: "RULE-EXECUTE-ERROR"
        };
        try {
            eval(rule.get_last_price);
            var cache = batchGetSessionCache(["now-price", "currency-be-used-last", "tips-be-showed-last"]);
            set_now_price(cache["now-price"], cache["currency-be-used-last"], cache["tips-be-showed-last"]);
        } catch (e) {
            sendData["errorPosition"] = "get_last_price";
            sendData["errorMessage"] = e.toString();
            sendMessageToBackground("service:serviceError", sendData);
        }
    }
/*------------------------------ > ^_^ < ----------------------------*/


/*------------------------- apply best code -------------------------*/
    function applyBestCode(message, sendMessage){
        var data = {};
        var code = message.best_code.Code;
        var rule = message.rule;
        if ("YES" == rule.is_ajax) {
            setCookie("ajax_at_success_flag", "YES", 20);
            setCookie("ajax_at_success_first_popup", "YES", 20);
        }
        let sendData = {
            domain: message["domain"],
            url: window.location.href,
            errorPosition: "apply_best_code",
            errorType: "RULE-EXECUTE-ERROR"
        };
        if ("YES" == rule.is_promise) {
            return Promise(function (resolve) {
                try {
                    eval(rule.apply_best_code);
                } catch (e) {
                    sendData["errorMessage"] = e.toString();
                    sendMessageToBackground("service:serviceError", sendData);
                }
            }).then(function (resolve) {});
        } else {
            try {
                eval(rule.apply_best_code);
            } catch (e) {
                sendData["errorMessage"] = e.toString();
                sendMessageToBackground("service:serviceError", sendData);
            }
        }
    }

    function bestCodeAppliedCheck(message){
        let rule = message["rule"];
        window.bestPrice = message["best_price"];
        if (!rule) {
            return ;
        }
        let sendData = {
            domain: message["domain"],
            url: window.location.href,
        };
        waitFor(rule, "", 10000, function(e){
            let errorStr = e.toString();
            console.log(errorStr);
            if (-1 !== errorStr.indexOf("BestCodeApplied")) {
                return ;
            } else if (-1 !== errorStr.indexOf("Timeout")) {
                sendData["errorType"] = "BEST-CODE-APPLIED-CHECK-ERROR";
                sendData["errorPosition"] = "best-code-not-applied";
                sendData["errorMessage"] = errorStr;
            } else {
                sendData["errorType"] = "RULE-EXECUTE-ERROR";
                sendData["errorPosition"] = "best_code_applied_check";
                sendData["errorMessage"] = errorStr;
            }
            window.bestPrice = undefined;
            sendMessageToBackground("service:serviceError", sendData);
        });
    }
/*------------------------------ > ^_^ < ----------------------------*/


/*-------------------------- page operation -------------------------*/
    function showIframe(message){
        if (!message.iframe) {
            $("#__COUPERT_US__").show();
            return;
        }
        for(var i = 0; i < message.iframe.length; i++) {
            $("#"+message.iframe[i]).show();
        }
    }

    function hideIframe(message){
        if (!message.iframe) {
            $("#__COUPERT_US__").hide();
            return;
        }
        for(let i = 0, len = message.iframe.length; i < len; i++) {
            $("#"+message.iframe[i]).hide();
        }
    }

    function closeIframe(message){
        if (!message.iframe) {
            $("#__COUPERT_US__").remove();
            return;
        }
        for(var i = 0; i < message.iframe.length; i++) {
            $("#"+message.iframe[i]).remove();
        }
    }

    function showGoldIncreasePage(message){
        if ("session-cache" in message) {
            batchSetSessionCache(message["session-cache"]);
        }
        var htmlFile="page/gold-increase-notify-popup.html";
        waitFor(function(){return $("body").length;}, function(){
            loadHtmlFile(htmlFile, {"name": "__COUPERT_US_INCREASE_NOTIFY__","top": "15px", "right": "15px", "width": "340px","height": "500px"});
        }, 1080000);
    }

    function showFeedbackPage(message){
        var htmlFile="page/feedback.html";
        loadHtmlFile(htmlFile, {"name": "__COUPERT_US_FEEDBACK__","top": "0px", "right": "0px", "width": "100%", "height": "100%", "background": "rgba(0,0,0,.7)", "z-index":"9999999999999 !important"});
    }

    function showATPopupHStyle() {
        waitFor(function(){return $('body').length;}, function(){
            $("#__COUPERT_US_WITH_H__").remove();
            var htmlFile="page/at-popup-h.html";
            loadHtmlFile(htmlFile, {"name": "__COUPERT_US_WITH_H__", "top": "15px", "right": "15px", "width": "280px", "height": "580px"});
        }, 1080000);
    }

    function showATPopupStyle(rule) {
        if ("YES" == getCookie("at_testing") || "YES" == getCookie("at_turnoff")) {
            return ;
        }
        if ($(".at-test-box").length > 0) {
            return ;
        }
        rule = rule.split("###");
        let element = rule[0].trim();
        let position = typeof rule[1] === 'undefined' ? "DOWN": rule[1].trim().toUpperCase();
        if ($(element).length <= 0) {
            return ;
        }
        var htmlFile="";
        switch (position) {
            case 'DOWN':
                htmlFile="page/at-popup-arrow-up.html";
                break;
            case 'LEFT':
                htmlFile="page/at-popup-arrow-right.html";
                break;
            case 'UP':
                htmlFile="page/at-popup-arrow-down.html";
                break;
            case 'RIGHT':
                htmlFile="page/at-popup-arrow-left.html";
                break;
            default :
                htmlFile="page/at-popup-arrow-up.html";
                break;
        }
        waitFor(function(){return $(element).length;}, function(){
            $("#__COUPERT_US_AT_OTHER__").remove();
            loadHtmlFile(htmlFile, {"name": "__COUPERT_US_AT_OTHER__", "top": "5px", "right": "15px", "width": "294px", "height": "210px"});
            setATPopupStylePosition(document.querySelector(element), position);
            resizeListener(document.querySelector(element), position);
            scrollListener(document.querySelector(element), position);
        }, 1080000);
    }

    function showAtPopupPage(){
        if ("YES" == getCookie("at_testing") || "YES" == getCookie("at_turnoff") || 'YES' == Cookies.get('at_closed')) {
            return ;
        }
        if ($(".at-test-box").length > 0) {
            return ;
        }
        var url = window.location.href;
        var subdomain = getDomainFromURL(url);
        var domain = getRootDomain(subdomain);
        var merchants = [
            /(^|\.)homedepot\.com/i,
            /(^|\.)fnac\.com/i,
            /(^|\.)asos\.com/i,
            /(^|\.)casasbahia\.com\.br/i,
            /(^|\.)wayfair\.com/i,
            /(^|\.)rakuten\.com/i,
        ];
        if (merchants.some((urlRegexp) => {
            return urlRegexp.test(domain);
        })) {
            showSimpleATPopup();
        } else {
            showNormalATPopup();
        }
    }

    function showSmallATPopup() {
        waitFor(function(){return $("body").length;}, function(){
            $("#__COUPERT_US_AT_MINI__").remove();
            var htmlFile="page/at-mini-popup.html";
            loadHtmlFile(htmlFile, {name:'__COUPERT_US_AT_MINI__', "top": "5px", "right": "15px", "width": "280px", "height": "60px"});
        }, 1080000);
    }

    function showNormalATPopup() {
        waitFor(function(){return $("body").length;}, function(){
            $("#__COUPERT_US_AT__").remove();
            var htmlFile="page/at-popup.html";
            loadHtmlFile(htmlFile, {name:'__COUPERT_US_AT__',"top": "15px", "right": "15px", "width": "280px", "height": "570px"});
        }, 1080000);
    }
    
    function showSimpleATPopup() {
        waitFor(function(){return $("body").length;}, function(){
            $("#__COUPERT_US_AT__").remove();
            var htmlFile="page/at-popup-simple.html";
            loadHtmlFile(htmlFile, {name:'__COUPERT_US_AT__', "top": "15px", "right": "15px", "width": "280px", "height": "570px"});
        }, 1080000);
    }

    function showAtTestingPage(){
        waitFor(function(){return $("body").length;}, function(){
            $("#__COUPERT_US_AT__").remove();
            $("#__COUPERT_US_AT_MINI__").remove();
            $("#__COUPERT_US__").remove();
            $("#__COUPERT_US_STORE__").hide();
            var htmlFile="page/at-testing.html";
            loadHtmlFile(htmlFile, {"top": "0px", "right": "0px", "width": "100%", "height": "100%", "background": "rgba(0,0,0,.7)"});
        }, 1080000);
    }

    function showAtSuccessResultPage(){
        waitFor(function(){return $("body").length;}, function(){
            $("#__COUPERT_US__").remove();
            var htmlFile="page/at-success-result.html";
            var param = {"top": "0px", "right": "0px", "width": "100%", "height": "100%", "background": "rgba(0,0,0,.7)"};
            loadHtmlFile(htmlFile, param);
        }, 1080000);
    }

    function showAtErrorResultPage(){
        waitFor(function(){return $("body").length;}, function(){
            $("#__COUPERT_US__").remove();
            var htmlFile="page/at-error-result.html";
            var param = {"top": "0px", "right": "0px", "width": "100%", "height": "100%", "background": "rgba(0,0,0,.7)"};
            loadHtmlFile(htmlFile, param);
        }, 1080000);
    }

    function showStorePopupPage(message){
        let hasOtherPopup = false;
        if($("#__COUPERT_US_GUIDANCE_POPUP__").length) {
            $("#__COUPERT_US_GUIDANCE_POPUP__").remove();
            hasOtherPopup = true;
        }
        if($("#__COUPERT_US_AMBASSADOR_PROGRAM__").length) {
            $("#__COUPERT_US_AMBASSADOR_PROGRAM__").remove();
            hasOtherPopup = true;
        }
        if($("#__COUPERT_US_FEEDBACK__").length) {
            $("#__COUPERT_US_FEEDBACK__").remove();
            hasOtherPopup = true;
        }
        if($("#__COUPERT_FIRST_VISIT_POPUP_US__").length) {
            $("#__COUPERT_FIRST_VISIT_POPUP_US__").remove();
            hasOtherPopup = true;
        }
        if ($('#__COUPERT_US_CB_NOTIFY__').length) {
            $('#__COUPERT_US_CB_NOTIFY__').remove();
            hasOtherPopup = true;
        }
        if ($('#__COUPERT_US_INCREASE_NOTIFY__').length) {
            $('#__COUPERT_US_INCREASE_NOTIFY__').remove();
            hasOtherPopup = true;
        }
        if($("#__COUPERT_US__").length) {
            $("#__COUPERT_US__").remove();
            $("#__COUPERT_US_STORE__").hide();
            hasOtherPopup = true;
        }
        if($("#__COUPERT_US_WITH_H__").length) {
            $("#__COUPERT_US_WITH_H__").remove();
            $("#__COUPERT_US_STORE__").hide();
            hasOtherPopup = true;
        }
        if($("#__COUPERT_US_AT__").length) {
            $("#__COUPERT_US_AT__").remove();
            $("#__COUPERT_US_STORE__").hide();
            hasOtherPopup = true;
        }
        if($("#__COUPERT_US_CB__").length) {
            $("#__COUPERT_US_CB__").remove();
            $("#__COUPERT_US_STORE__").hide();
            hasOtherPopup = true;
        }
        if ($('#__COUPERT_US_CLOSE_TIPS__').length) {
            $('#__COUPERT_US_CLOSE_TIPS__').remove();
        }
        if (hasOtherPopup) return ;
        if (!$("#__COUPERT_US_STORE__").length) {
            var htmlFile="page/store-popup.html";
            var param = {"name": "__COUPERT_US_STORE__","top": "15px","right": "15px", "left": "auto", "width": "360px","height": "620px","background-color": "#f5f5f5","box-shadow": "rgba(0, 0, 0, 0.3) 1px 1px 6px","hide":""};
            if ("display" in message) {
                delete param["hide"];
            }
            if ("attr" in message) {
                param["attr"] = message["attr"];
            }
            waitFor(function(){return $("body").length;}, function(){
                loadHtmlFile(htmlFile, param);
            }, 1080000);
        } else {
            if ($("#__COUPERT_US_STORE__").is(":hidden")) {
                $("#__COUPERT_US_STORE__").show();
            } else {
                $("#__COUPERT_US_STORE__").hide();
            }
        }
    }

    function preloadingStorePopupPage(){
        if ("YES" == getCookie("refresh_at_flag")) {
            return ;
        }
        waitFor(function(){return $("body").length;}, function(){
            if ($("#__COUPERT_US_STORE__").length > 0 && "icon-click" == $("#__COUPERT_US_STORE__").attr("source")) {
                return ;
            }
            $("#__COUPERT_US_STORE__").remove();
            var htmlFile="page/store-popup.html";
            var options = {"name": "__COUPERT_US_STORE__","top": "15px", "right": "15px", "left": "auto", "width": "360px","height": "620px","background-color": "#f5f5f5","box-shadow": "rgba(0, 0, 0, 0.3) 1px 1px 6px", "hide": "YES"};
            waitFor(function(){return $("body").length;}, function(){
                loadHtmlFile(htmlFile, options);
            }, 1080000);
        }, 1080000);
    }

    function reloadingStorePopupPage(message){
        if ("cache" in message) {
            batchSetCache(message.cache);
        }
        if ("session-cache" in message) {
            var sessionCache = message["session-cache"];
            if ("cookie-overrided" in sessionCache && "YES" == sessionCache["cookie-overrided"]
                && "tab-id" in message
                && "YES" !== message["override-popup"]) {
                chrome.runtime.sendMessage({action:"set-icon-badge", "tab-id":message["tab-id"]});
                ss.set("cookie-overrided", "YES");
            } else if ("cookie-overrided" in sessionCache && "NO" == sessionCache["cookie-overrided"]) {
                ss.set("cookie-overrided", "NO");
            }
        }
        if ("close-coupert" in message) {
            $("#__COUPERT_US__").remove();
        }
        if (!("replace" in message)) {
            $("#__COUPERT_US_STORE__").remove();
        }
        var htmlFile="page/store-popup.html";
        var options = {"name": "__COUPERT_US_STORE__","top": "15px","right": "15px", "left": "auto", "width": "360px","height": "620px","background-color": "#f5f5f5","box-shadow": "rgba(0, 0, 0, 0.3) 1px 1px 6px"};
        if ("hide" in message) {
            options["hide"] = "YES";
        } else if ("auto" in message) {
            options["auto"] = "YES";
            options["replace"] = "YES";
        }
        waitFor(function(){return $("body").length;}, function(){
            loadHtmlFile(htmlFile, options);
        }, 1080000);
    }

    function showcbPopupPage(){
        if ("YES" == getCookie("cb_turnoff") || "YES" == getCookie("cb_activate") || 'YES' == Cookies.get('cb_closed')) {
            return ;
        }
        waitFor(function(){return $("body").length;}, function(){
            $("#__COUPERT_US_CB__").remove();
            var htmlFile="page/cb-popup.html";
            loadHtmlFile(htmlFile, {"name": "__COUPERT_US_CB__", "top": "15px", "right": "15px", "width": "280px", "height": "650px"});
        }, 1080000);
    }

    function showFirstVisitCBPopup(){
        waitFor(function(){return $("body").length;}, function(){
            $("#__COUPERT_FIRST_VISIT_POPUP_US__").remove();
            var htmlFile="page/cb-first-visit-popup.html";
            loadHtmlFile(htmlFile, {"name": "__COUPERT_FIRST_VISIT_POPUP_US__", "top": "15px", "right": "15px", "width": "436px", "height": "94px", "box-shadow": "0 10px 18px 2px rgba(0,0,0,.1)"});
        }, 1080000);
    }

    function switchPanelLocation(message){
        if ("string" == typeC(message.iframe)) {
            var iframeName = message.iframe;
            var loc = getCache("panel-location");
            if (!!loc && "right" == loc) {
                setCache("panel-location", "left");
                $("#" + iframeName).css("left", "15px");
                $("#" + iframeName).css("right", "auto");
            } else if (!!loc && "left" == loc) {
                setCache("panel-location", "right");
                $("#" + iframeName).css("right", "15px");
                $("#" + iframeName).css("left", "auto");
            } else {
                setCache("panel-location", "left");
                $("#" + iframeName).css("left", "15px");
                $("#" + iframeName).css("right", "auto");
            }
        }
    }

    function showAmbassadorProgramPopupPage(message){
        var htmlFile="page/ambassador-program-popup.html";
        waitFor(function(){return $("body").length;}, function(){
            loadHtmlFile(htmlFile, {"name":"__COUPERT_US_AMBASSADOR_PROGRAM__", "top": "15px", "right": "15px", "width": "420px","height": "130px"});
        }, 1080000);
    }

    function showMessageNotifyPopupPage(message){
        var htmlFile="page/message-notify-popup.html";
        waitFor(function(){return $("body").length;}, function(){
            loadHtmlFile(htmlFile, {"name":"__COUPERT_US_MESSAGE_NOTIFY__", "top": "15px", "right": "15px", "width": "360px","height": "460px"});
        }, 1080000);
    }

    function referFriend(message, sendResponse){
        var htmlFile="page/refer-friend.html";
        waitFor(function(){return $("body").length;}, function(){
            $("#__COUPERT_US_REFER_FRIEND__").remove();
            loadHtmlFile(htmlFile, {"name":"__COUPERT_US_REFER_FRIEND__", "top": "0px", "right": "0px", "width": "100%", "height": "100%", "background": "rgba(0,0,0,.7)"});
        }, 1080000);
    }

    function showDialog(message, sender, sendResponse){
        switch(message.type) {
            case "override-cookie":
                overrideCookieDialog(message, sender, sendResponse);
                break;
            default:
                break;
        }
    }

    function overrideCookieDialog(message, sender, sendResponse){
        if ("YES" === Cookies.get("cb_override_turnoff")) {
            return ;
        }
        if ("YES" === Cookies.get("cb_override_showed")) {
            return ;
        }
        Cookies.set("cb_override_working", "YES", {expires: 20});
        waitFor(function(){return $("body").length;}, function(){
            $("#__COUPERT_US_CB_OVERRIDE_NOTIFY__").remove();
            var htmlFile="page/cb-override-notify.html";
            loadHtmlFile(htmlFile, {"name":"__COUPERT_US_CB_OVERRIDE_NOTIFY__", "top": "15px", "right": "15px", "width": "336px", "height": "218px","box-shadow": "0 3px 7px 1px rgba(0,0,0,.1)", "z-index":"3147483649 !important"});
        }, 1080000);
    }

    function showGuidancePopup() {
        waitFor(function(){return $("body").length;}, function(){
            $("#__COUPERT_US_GUIDANCE_POPUP__").remove();
            var htmlFile="page/guidance-popup.html";
            loadHtmlFile(htmlFile, {"name": "__COUPERT_US_GUIDANCE_POPUP__", "top": "15px", "right": "15px", "width": "280px", "height": "394px","box-shadow": "0 10px 18px 2px rgba(0,0,0,.1)"});
        }, 1080000);
    }

    function showCloseTips(message) {
        var panel = message.panel || 'at';
        waitFor(function(){return $("body").length;}, function(){
            $("#__COUPERT_US_CLOSE_TIPS__").remove();
            var htmlFile="page/close-tips.html?panel="+panel;
            loadHtmlFile(htmlFile, {"name": "__COUPERT_US_CLOSE_TIPS__", "top": "15px", "right": "15px", "width": "400px", "height": "100px","box-shadow": "0 10px 18px 2px rgba(0,0,0,.1)"});
        }, 1080000);
    }
/*------------------------------ > ^_^ < ----------------------------*/


/*------------------------------- init ------------------------------*/
    function init(){
        writeCoupertItemOnBody();
        clearCookieAndCache();
        topAddEventListener();
        showPanelWhenVisitSiteWelcomePage();
    }

    function showPanelWhenVisitSiteWelcomePage() {
        var url = window.location.toString();
        var subdomain = getDomainFromURL(url);
        var domain = getRootDomain(subdomain);
        if (/(^|\.)coupert\./.test(domain)) {
            var jsUrl = new URL(url);
            if ('/welcome' === jsUrl.pathname) {
                reloadingStorePopupPage({});
            }
        }
    }

    function topAddEventListener() {
        $(document).ready(function(){
            $('.9650D805DAC60BDC906D11B719D8C9D9').click(function () {
                Cookies.set('click_position', 'DailyCheckInOnWeb');
                showStorePopupPage({"display": "YES"});
            });
        });
    }

    function writeCoupertItemOnBody(){
        ss.set('cpt_url', window.location.href);
        ls.set('ls_cpt_url', window.location.href);
        $("html").attr("coupert-item", "9AF8D9A4E502F3784AD24272D81F0381");
    }

    function clearCookieAndCache(){
        batchRemoveSessionCache(["contentJsIsLoaded"]);
        batchRemoveCookie(["at_testing"]);
    }
/*------------------------------ > ^_^ < ----------------------------*/

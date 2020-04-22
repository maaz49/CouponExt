/**
 * background page
 */
// do something when install
chrome.runtime.onInstalled.addListener(function(details){
    if ("install" == details.reason) {
        setCache("new_install", "1");
        setTimeout(function(){
            user.install(guid());
            openWindow(WELCOME_URL + "install&client_id=" + guid());
        },1500);
    }
});


/*----------------------------- Afsrc -----------------------------*/
    function setAfsrc(tabId, rootDomain, value){
        var key = tabId.toString() + ":afsrc";
        var afsrcStorage = getCache(key);
        var data = {};
        if(!!afsrcStorage){
            data = JSON.parse(afsrcStorage);    
        }
        data[rootDomain] = value;
        setCache(key, JSON.stringify(data));
    }

    function analyzeAfsrc(tabId, rootDomain, tab, tabURL, domain){
        let redirectPath = RedirectPath.getTab(tabId);
        redirectPath.lastactive = new Date().getTime();
        let path = redirectPath.path;
        var trafficResult = undefined;
        // if use $().each(), cannot terminate the loop with return
        for (var index = 0; index < path.length; index++) {
            let pathItem = path[index];
            let url = pathItem.url;
            let redirect_url = pathItem.redirect_url;
            trafficResult = home.isAfsrcURL(url) || home.isAfsrcURL(redirect_url);
            if ("self-traffic" === trafficResult) {
                break;
            }
            analyzeAfsrcResult(tabId, rootDomain, tab, domain, url, trafficResult);
        }
        if (trafficResult === undefined) {
            var trafficResult = home.isAfsrcURL(tabURL);
            if (trafficResult === undefined || "self-traffic" === trafficResult)
                return;
            analyzeAfsrcResult(tabId, rootDomain, tab, domain, tabURL, trafficResult);
        }
    }

    function analyzeAfsrcResult(tabId, rootDomain, tab, domain, url, result){
        if (!!result) {
            if (!!result["scope"]) {
                if (!!result["af"]) {
                    statistics.afsrcTraffic(domain, url, result["af"]);
                }
                if (!!result["afsrc-popup"] && "YES" == result["afsrc-popup"]) { //five restrict afsrc affiliate
                    setAfsrc(tabId, rootDomain, 1);//extension localstorage
                    if (result["scope"] == "WINDOW") {
                        chrome.windows.getCurrent({}, function(window){//extension cookie 
                            Cookies.set("WINDOW-AFSRC-" + window.id + ":" + rootDomain + ":window", "YES");
                        })                            
                    }
                    if (!!result["override-popup"] && "YES" == result["override-popup"]) {//override popup 
                        if ("YES" === overrideCookie(rootDomain, "YES")) {// check used coupert service?
                            tab["override"] = true;
                        } else {
                            tab["afsrc"] = true; //only other publisher traffic
                        }
                    } else {
                        tab["afsrc"] = true;
                    }
                    afsrcTabList.put(tabId, tab);
                } else if (!!result["override-popup"] && "YES" == result["override-popup"]) { //other afsrc affiliate
                    setAfsrc(tabId, rootDomain, 1);
                    if (result["scope"] == "WINDOW") {
                        chrome.windows.getCurrent({}, function(window){
                            Cookies.set("WINDOW-AFSRC-" + window.id + ":" + rootDomain + ":window", "YES");
                        })                            
                    }
                    overrideCookie(rootDomain, "YES");
                    tab["override"] = true;
                    afsrcTabList.put(tabId, tab);
                }
            }
        }
    }

    function checkAfsrc(tabId, rootDomain){
        if (Object.keys(afsrcTabList.get(tabId)).length != 0) {
            var afsrcTab = afsrcTabList.get(tabId);
            if ("afsrc" in afsrcTab && afsrcTab["afsrc"]) {
                return true;
            } else if ("override" in afsrcTab && afsrcTab["override"]) {
                return false;
            }
        }
        if ("YES" == ls.get(rootDomain + ":override")) {
            return false
        }
        if (cookieExistByKey(rootDomain+":window")) {
            return true;
        }
        var key = tabId.toString() + ":afsrc";
        var afsrc = getCache(key);
        var obj = {};
        if (!!afsrc) {
            obj = JSON.parse(afsrc);
        }
        return !!obj && rootDomain in obj && obj[rootDomain] == 1;
    }
/*----------------------------- > ^_^ < -----------------------------*/


/*--------------------------- Icon & Badge --------------------------*/
    function setIconBadge(tabId, text, flash = false, index = 0){
        text = text.toString();
        if ("0" === text || !text) {
            text = "";
        }
        if (flash) {
            chrome.browserAction.setIcon({path: "icon/flash"+index+".png", tabId: tabId});
        } else {
            chrome.browserAction.setIcon({path: "../../icon/active-38.png", tabId: tabId});
        }
        chrome.browserAction.setBadgeText({text: text,tabId: tabId});
        chrome.browserAction.setBadgeBackgroundColor({color: "#6E8B3D",tabId: tabId});
    }

    function setFlashIcon(tabId, text, badge){
        var flush_count = 0;
        var flashIndexArr = [2,3,4,5,4,3,2,3,2,3,4,5,4,3,4,3,2,3,4,5,4,5,4,3,2];
        var icon_interval = setInterval(function(){
            setIconBadge(tabId, text, true, flashIndexArr.shift());
            if (flush_count > 10) {
                clearInterval(icon_interval);
                setIconBadge(tabId, badge);
            }
            flush_count ++;
        },150);
    }
/*----------------------------- > ^_^ < -----------------------------*/


/*--------------------------- pageLoading ---------------------------*/
    function pageLoading(tabId, tab){
        var url = tab.url;
        // check validate url
        if(!validateURL(url))
            return;
        var domain = getDomainFromURL(url);
        var rootDomain = getRootDomain(domain);
        batchSetCache({"domain": domain}, tabId);
        if (/(^|\.)(facebook|youtube|bing)\./gi.test(rootDomain)) {
            return ;
        }
        if (/(^|\.)coupert\./.test(rootDomain)) {
            setIconBadge(tabId, "");
        }
        // check black domain
        if (home.isBlackDomain(rootDomain)) {
            return;
        }

        // anlyze afsrc source
        analyzeAfsrc(tabId, rootDomain, tab, url, domain);
        var afsrcFlag = checkAfsrc(tabId, rootDomain);
        var userEmail = getCache("user_email");
        store.info(domain, url, userEmail, function(infoData){
            console.log(infoData);
            // when merchant switch is yes, get coupon and merchant info
            if ("yes" == infoData.mer_switch) {
                store.codes(domain, url, function(codeData){
                    var data = {
                        "session-cache": {
                            "domain": domain,
                            "root-domain": rootDomain,
                            "store-info": infoData,
                            "coupons": codeData.coupons.codes,
                            "similars": codeData.coupons.similar,
                            "deals": codeData.coupons.deals,
                            "merchant-info": codeData.merinfo,
                            "merchant-rules": codeData.merrules,
                            "tab-id": tabId,
                            "cookie-overrided": afsrcFlag ? "YES" : "NO",
                        },
                    };
                    tab["flash"] = getBadgeText(data["session-cache"]);
                    tab["domain"] = domain;
                    tab["rootDomain"] = rootDomain;
                    flashIconTabList.put(tabId, tab);
                    processData(tabId, domain, rootDomain, url, data);
                    operateIcon(tabId, domain, rootDomain, data);
                });
            }
        });
    }

    function processAfsrc(tabId, rootDomain, data){
        if (Object.keys(afsrcTabList.get(tabId)).length != 0) {
            var afsrcTab = afsrcTabList.get(tabId);
            chrome.tabs.query({active:true}, function (tab) {
                for (var index = 0; index < tab.length; index ++) {
                    var tabItem = tab[index];
                    var domain = getDomainFromURL(tabItem.url);
                    var tabRootDomain = getRootDomain(domain);
                    if (rootDomain == tabRootDomain) {
                        if ("YES" == data["merchant-info"].HasAffiliate) {
                            chrome.tabs.sendMessage(tabItem.id, {"action": "set-affiliate-cookie", "relation": "competitor", "domain": rootDomain});
                            chrome.tabs.sendMessage(tabItem.id, {"action": "remove-cache-or-cookie", "cookie": {"name": "cb_activate", "domain": rootDomain}});
                            chrome.tabs.sendMessage(tabItem.id, {"action": "reset-inject-cb-button"});
                            if ("afsrc" in afsrcTab && afsrcTab["afsrc"]) {
                                afsrc(rootDomain);
                            } else if ("override" in afsrcTab && afsrcTab["override"]) {
                                if ("YES" === overrideCookie(rootDomain, "YES") && "YES" == data["store-info"].is_cashback) {
                                    ls.set(rootDomain + ":override", "YES");
                                    chrome.tabs.sendMessage(tabItem.id, {action: "show-dialog", type: "override-cookie"});
                                }
                                chrome.tabs.sendMessage(tabItem.id, {"action": "reloading-store-popup-page", "hide": "YES", "close-coupert":"YES", "tab-id": tabItem.id, "override-popup":"YES", "session-cache":{"cookie-overrided": "YES"}});
                            }
                        }
                    }
                }
                RedirectPath.tabRemoved(tabId, {});
            });
            chrome.tabs.query({}, function (tab) {
                for (var index = 0; index < tab.length; index ++) {
                    var tabItem = tab[index];
                    var domain = getDomainFromURL(tabItem.url);
                    var tabRootDomain = getRootDomain(domain);
                    if (rootDomain == tabRootDomain) {
                        if ("override" in afsrcTab && afsrcTab["override"]) {
                            if ("YES" === overrideCookie(rootDomain, "YES") && "YES" == data["store-info"].is_cashback) {
                                Cookies.set(rootDomain + ":cb-override-notify", "YES");
                                Cookies.set(rootDomain + ":cb-override-working", "YES");
                            }
                        }
                    }
                }
            });
            afsrcTabList.remove(tabId);
        }
    }

    function afsrc(rootDomain) {
        chrome.tabs.query({}, function (tab) {
            for (var index = 0; index < tab.length; index ++) {
                var tabItem = tab[index];
                var domain = getDomainFromURL(tabItem.url);
                var tabRootDomain = getRootDomain(domain);
                if (rootDomain == tabRootDomain) {
                    chrome.tabs.sendMessage(tabItem.id, {"action": "reloading-store-popup-page", "hide": "YES", "close-coupert":"YES", "tab-id": tabItem.id, "session-cache":{"cookie-overrided": "YES"}});
                }
            }
        });
    }

    function processData(tabId, domain, rootDomain, url, data){
        saveMerchantInfo(tabId, domain, data);
        var sTime = new Date().getTime();
        var contentLoadedHandlerId = setInterval(function(){
            chrome.tabs.sendMessage(tabId, {"action": "check-if-content-loaded", "url": url}, function(response){
                if (!!chrome.runtime.lastError) {
                    return ;
                }
                if (!response) {
                    return ;
                }
                try {
                    if (new Date().getTime() - sTime < (30 * 60 * 1000)) {
                        if (response && "completed" == response.action && url === response.url) {
                            sendDataToContentAndSaveInLocalstorage(tabId, domain, rootDomain, url, data);
                            throw new Error('Content script loading completed!!!');
                        }
                    } else {
                        throw new Error('Timeout');
                    }
                }  catch(e){
                    console.log(e);
                    clearInterval(contentLoadedHandlerId);
                }
            });
        }, 200);
    }

    function saveMerchantInfo(tabId, domain, data){
        batchSetCache({"domain":domain, "merchantId": data["session-cache"]["store-info"]["merchant_id"]}, tabId);
    }

    function operateIcon(tabId, domain, rootDomain, data){
        if ("YES" == data["session-cache"]["cookie-overrided"]) {
            setFlashIcon(tabId, "", "$");
        } else {
            setIconBadge(tabId, getBadgeText(data["session-cache"]));
        }
    }

    function sendDataToContentAndSaveInLocalstorage(tabId, domain, rootDomain, url, data){
        processAfsrc(tabId, rootDomain, data["session-cache"]);
        chrome.tabs.sendMessage(tabId, {"action": "set-cache-or-cookie", "session-cache": data["session-cache"], "local-cache": data["local-cache"]}, function(response){
            preloadPage(tabId);
            checkAmbassadorProgramPopup(tabId, domain, url, data["session-cache"]);
            // checkIfGoldIncrease(tabId, domain, url, data["session-cache"]["store-info"]);
            if ("success" == response.status) {
                if ("YES" == data["session-cache"]["cookie-overrided"]) {
                    return ;
                }
                extensionRun(tabId, domain, rootDomain, url, data["session-cache"]);
            }         
        });
    }

    function preloadPage(tabId){
        chrome.tabs.sendMessage(tabId, {"action": "preloading-store-popup-page"});
        return ;
    }

    function checkAmbassadorProgramPopup(tabId, domain, url, data){
        if (0 == data["store-info"]["ambassador-popup"] || 0 != data["store-info"].is_checkout || "yes" == getCache("ambassador_pop")) {
            return ;
        }
        setCache("ambassador_pop", "yes");
        chrome.tabs.sendMessage(tabId, {"action": "show-ambassador-program-popup-page"});
    }

    // add gold increase notify;
    function checkIfGoldIncrease(tabId, domain, url, data){
        var userGold = getCache("user_gold");
        var userEmail = getCache("user_email");

        // when user first login, init user-gold
        if (isNaN(parseInt(userGold)) && !isNaN(parseInt(data.gold))) {
            setCache("user_gold", data.gold);
            return ;
        }

        if (!isNaN(parseInt(userGold)) && !isNaN(parseInt(data.gold))) {
            var increaseGold = parseInt(data.gold) - parseInt(userGold);
            // when user is unlogin or current is checkout page
            if (!userEmail || 0 != data.is_checkout) {
                return ;
            }
            var increased = "NO";
            var withdraw = "NO";
            var withdrawMoney = 0;
            // when user gold unincrease
            if (increaseGold <= 0) {
                setCache("user_gold", data.gold);
                return ;
            }
            // when user gold increase 
            var increased = "YES";
            if (1 == data.withdraw) {
                withdraw = "YES";
                withdrawMoney = parseFloat(data.withdraw_money).toFixed(2).toString();
            }

            chrome.tabs.sendMessage(tabId, {"action": "show-gold-increase-page", "session-cache":{"gold-increase-number": increaseGold, "gold-increased": increased, "withdraw": withdraw, "withdraw-money": withdrawMoney}});
            setCache("user_gold", data.gold);
        }
    }

    function extensionRun(tabId, domain, rootDomain, url, data){
        checkoutPageElement(tabId, data, domain, url);
        
        CBRelatedFunction(tabId, data, domain);

        checkInjectCbButton(tabId, data);

        checkIsFirstVisitPopupStore(tabId, data, url);

        CBOverrideNotify(tabId, rootDomain, data);

        referFriend(tabId, domain, rootDomain, url, data);
    }

    function referFriend(tabId, domain, rootDomain, url, data){
        if (isShoppingSuccessRefOn(data)) {
            console.log("shopping-success-ref-on");
            if (isReferFriendClicked() || isReferFriendTurnOff()) {
                return ;
            }
            var flag = data["merchant-info"].ShoppingSuccessUrlFlag;
            console.log("shopping-success-ref-on-flag", flag);
            if (isServiceUsed() && flag && isValidURL(url, flag)) {
                console.log("shopping-success-ref-valid");
                chrome.tabs.sendMessage(tabId, {action: "refer-friend", data: data});
            }
        }
    }

    function isShoppingSuccessRefOn(data){
        return "YES" === data["merchant-info"].ShoppingSuccessRefOn;
    }

    function isReferFriendClicked(){
        return "YES" === Cookies.get("refer_friend_clicked");
    }

    function isReferFriendTurnOff(){
        return "YES" === Cookies.get("refer_friend_turn_off");
    }

    function isServiceUsed(){
        return "YES" === Cookies.get("service_used");
    }

    function CBOverrideNotify(tabId, rootDomain, data){
        if ("YES" === Cookies.get(rootDomain + ":cb-override-working")) {
            Cookies.remove(rootDomain + ":cb-override-working");
            return ;
        }
        if ("YES" === Cookies.get(rootDomain + "cb-override-notify-already-popup")) {
            Cookies.remove(rootDomain + "cb-override-notify-already-popup");
            Cookies.remove(rootDomain + ":cb-override-notify");
            return ;
        }
        if ("YES" === Cookies.get(rootDomain + ":cb-override-notify")) {
            chrome.tabs.sendMessage(tabId, {action: "show-dialog", type: "override-cookie"});
            Cookies.remove(rootDomain + ":cb-override-notify");
        }
    }

    function checkIsFirstVisitPopupStore(tabId, data, url){
        if (0 == data["store-info"].is_checkout && "YES" == data['merchant-info'].FirstVisitPopCB && "YES" == data["store-info"].is_cashback && "YES" == data["merchant-info"].HasAffiliate) {
            let cof = data['merchant-info'].FirstVisitPopCBCof;
            if (!!cof) {
                if ((new RegExp(cof)).test(url)) {
                    chrome.tabs.sendMessage(tabId, {"action": "first-visit-popup-cb", "root-domain":data["root-domain"]});
                }
            } else {
                chrome.tabs.sendMessage(tabId, {"action": "first-visit-popup-cb", "root-domain":data["root-domain"]});
            }
        }
    }

    function checkInjectCbButton(tabId, data){
        if (1 == data["store-info"].is_checkout && "YES" == data["store-info"].is_cashback) {
            chrome.tabs.sendMessage(tabId, {"action": "inject-cb-button", "data": data});
        }
    }

    function checkoutPageElement(tabId, data, domain, url){
        // current url is checkout page
        if ((1 == data["store-info"].is_checkout && "YES" == data["store-info"].at && "NO" == data["store-info"].cb && data["coupons"].length > 0)) {
            chrome.tabs.sendMessage(tabId, {"action": "checkout","domain": domain,"tabId": tabId,"info": data["store-info"],"url": url});
        }
    }

    function CBRelatedFunction(tabId, data, domain){
        if ((1 == data["store-info"].is_checkout && "YES" == data["store-info"].is_cashback && "YES" == data["store-info"].cb)) {
            CBPagePupup(tabId);
        }
    }

    function CBPagePupup(tabId){
        chrome.tabs.sendMessage(tabId, {"action": "show-cb-popup-page"});
    }
/*----------------------------- > ^_^ < -----------------------------*/


/*-------------------------- pageCompleted --------------------------*/
    function pageCompleted(){
        
    }
/*----------------------------- > ^_^ < -----------------------------*/


/*------------------------ tab updata listener ----------------------*/
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
        var tabInfo = tabListCreatedBySelf.get(tabId);
        // if the tab create by self, delete it when update completed
        if (tabInfo && Object.keys(tabInfo).length != 0) {
            if ("complete" === changeInfo.status) {
                if (!chrome.runtime.lastError) {
                    var createRootDomain = getRootDomain(getDomainFromURL(tab.url));
                    if (createRootDomain === tabInfo["rootDomain"]) {
                        chrome.tabs.remove(tabId);
                    }
                }
            }
        } else {
            if (isLoadingStatus(changeInfo, tab)) {
                pageLoading(tabId, tab);
            }
        }
    });

    function isLoadingStatus(changeInfo, tab){
        return "loading" === tab.status && "loading" === changeInfo.status;
    }

    function iconFlash(activeInfo) {
        let tabId = activeInfo.tabId,
            tab = flashIconTabList.get(activeInfo.tabId);
        if (Object.keys(tab).length !== 0) {
            chrome.tabs.query({active: true, windowId:activeInfo.windowId}, (tabs) => {
                let activeTab = tabs[0],
                    activeTabURL = activeTab.url || '',
                    domain = getDomainFromURL(activeTabURL),
                    rootDomain = getRootDomain(domain);
                if (domain !== tab["domain"] || rootDomain !== tab["rootDomain"]) return;
                chrome.tabs.sendMessage(tabId, {"action": "get-cache-or-cookie", "session-cache": ["cookie-overrided"]}, function(response){
                    if (response && "cookie-overrided" in response && "YES" === response["cookie-overrided"] && "YES" != ls.get(rootDomain + ":override")) {
                        setFlashIcon(tabId, "", "$");
                    } else {
                        setFlashIcon(tabId, "", tab["flash"]);
                    }
                });
            });
        }
    }

    chrome.tabs.onActivated.addListener(function(activeInfo){
        iconFlash(activeInfo);
        chrome.tabs.query({active:true}, function(tabs){
            tabs.forEach(function(tab, index){
                let rootDomain = getRootDomain(getDomainFromURL(tab.url));
                if ("YES" === Cookies.get(rootDomain + "cb-override-notify-already-popup")) {
                    Cookies.remove(rootDomain + "cb-override-notify-already-popup");
                    Cookies.remove(rootDomain + ":cb-override-notify");
                    return ;
                }
                if ("YES" === Cookies.get(rootDomain + ":cb-override-notify")) {
                    chrome.tabs.sendMessage(tab.id, {action: "show-dialog", type: "override-cookie"});
                    Cookies.remove(rootDomain + ":cb-override-notify");
                }
            });
        });
    });
/*----------------------------- > ^_^ < -----------------------------*/


/*--------------------- chrome run message listener -----------------*/
    // receive message from content script
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse){
        var event = message.action;
        if (/^service\:/.test(event)) {
            var action = event.replace("service:", "");
            switch(action){
                case "cbInjectImpr":
                    service.cbInjectImpr(message.domain, message.url);
                    break;
                case "cbInjectError":
                    service.cbInjectError(message.storeId, message.errorMsg);
                    break;
                case "cbClick":
                    service.cbClick(message.domain, message.storeId, message.clickType, message.trackingId, message.leastOrderAmount, message.cashbackPercentage, "0", getCache("user_email"));
                    break;
                case "serviceError":
                    service.serviceError(message.domain, message.url, message.errorType, message.errorPosition, message.errorMessage);
                    break;
            }
            return ;
        }
        if (/^statistics\:/.test(event)) {
            var action = event.replace("statistics:", "");
            switch(action){
                case "log":
                    statistics.log(message.data);
                    break;
                case "popup-auto-move-log":
                    statistics.popupAutoMoveLog(message.data);
                    break;
            }
            return ;
        }
        if (/^local/.test(event)) {
            var action = event.replace('local', '').replace(/^\s+|\s+$/gm,'').replace(/^\:|\:$/gm,'');
            switch (action) {
                case 'get':
                    sendResponse({ name: message.name, value: Storages.localStorage.get(message.name) });
                    break;
                case 'set':
                    Storages.localStorage.set(message.name, message.value);
                    break;
                case 'remove':
                    Storages.localStorage.remove(message.name);
                    break;
            }
            return ;
        }
        switch(message.action){
            case "need-it":
                statistics.toSupportMerchant({url: message.url, email: localStorage.getItem('user_email')});
                break;
            case "save-valid-code":
                statistics.userValidCode(message.domain, message.validCode);
                break;
            case "check-if-user-logged":
                user.token(function(){sendResponse({"is-login":"YES"});}, function(){sendResponse({"is-login":"NO"});});
                return true;
            case "open-window":
                openWindow(message.url, message.active, message.rootDomain);
                break;
            case "override-cookie":
                overrideCookie(message.domain, message.value, message.init);
                break;
            case "set-icon-badge":
                setIconBadge(message["tab-id"], "$");
                break;
            case "set-service-used-cookie":
                setServiceUsedCookie();
                break;
            default:
                break;
        }
    });
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
        if(message.action=="get_stores"){
             get_stores();
        }
    });
    function activateAndReloadStorePopup(data){
        var rootDomain = data["root-domain"];
        var tabId = data["tab-id"];
        afsrcTabList.remove(tabId);
        chrome.tabs.query({}, function (tab) {
            for (var index = 0; index < tab.length; index ++) {
                var tabItem = tab[index];

                var domain = getDomainFromURL(tabItem.url);
                var tabRootDomain = getRootDomain(domain);
                if (rootDomain == tabRootDomain) {
                    // adjust remove afsrc flag, time:2019-3-8; author: jerry
                    removeCache(tabItem.id.toString() + ":afsrc");
                    removeCookieByKey(rootDomain + ":window", "indexOf");
                    chrome.tabs.sendMessage(tabId, {"action": "set-cache-or-cookie", "session-cache": {"cookie-overrided": "NO"}});
                    if (tabId != tabItem.id) {
                        afsrcTabList.remove(tabItem.id);
                        chrome.tabs.sendMessage(tabItem.id, {"action": "reloading-store-popup-page", "hide":"YES", "close-coupert":"YES", "session-cache":{"cookie-overrided": "NO"}});
                        chrome.tabs.sendMessage(tabItem.id, {"action": 'close-iframe', "iframe": ["__COUPERT_US_CB_OVERRIDE_NOTIFY__"]});
                    }
                }
            }
        });
    }
/*----------------------------- > ^_^ < -----------------------------*/


/*------------------------ window created listener ------------------*/
    chrome.windows.onCreated.addListener(function(window){
        console.log(window);
    });

    chrome.windows.onRemoved.addListener(function(windowId){
        removeCookieByKey("WINDOW-AFSRC-" + windowId);
    });
/*----------------------------- > ^_^ < -----------------------------*/


/*------------------------ webRequest listener ----------------------*/
    chrome.webRequest.onBeforeRedirect.addListener(function(details){
        RedirectPath.requestRedirect(details);
    }, { types: ["main_frame"], urls: ["<all_urls>"] }, ["responseHeaders"]);

    chrome.webRequest.onBeforeSendHeaders.addListener(function(details){
        return {
            requestHeaders: details.requestHeaders
        };
    }, { types: ["main_frame"], urls: ["<all_urls>"] }, ["blocking", "requestHeaders"]);

    chrome.webRequest.onHeadersReceived.addListener(function(details){
    }, { types: ["main_frame"], urls: ["<all_urls>"] });
/*----------------------------- > ^_^ < -----------------------------*/


/*----------------------- browserAction listener --------------------*/
    // icon click
    chrome.browserAction.onClicked.addListener(function(){
        chrome.tabs.getSelected(null, function (tab) {
            var tabId = tab.id;
            var cache = batchGetCache(["domain", "merchantId"], tabId);
            service.iconClick(cache["domain"], cache["merchantId"]);
            chrome.tabs.sendMessage(tabId, {"action": "show-store-popup-page", "display": "YES", "attr":{"source":"icon-click"}});
        });
    });
/*----------------------------- > ^_^ < -----------------------------*/


/*--------------------- uninstall redirection url -------------------*/
    chrome.runtime.setUninstallURL(feedbackURL + "&client_id=" + guid() + "&_v=" + chrome.runtime.getManifest().version.toString());
/*----------------------------- > ^_^ < -----------------------------*/


/*----------------------- tab remove listener -----------------------*/
    chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
        tabListCreatedBySelf.remove(tabId);
        afsrcTabList.remove(tabId);
        flashIconTabList.remove(tabId);
        clearCacheWhenTabClose(tabId, removeInfo);
        RedirectPath.tabRemoved(tabId, removeInfo);
    });

    function clearCacheWhenTabClose(tabId, removeInfo){
        batchRemoveCache(["domain", "merchantId", "afsrc", "testedCodeIdList"], tabId);
    }
/*----------------------------- > ^_^ < -----------------------------*/

(() => {
    chrome.storage.local.set({ exd: guid() });
    chrome.storage.sync.set({ exd: guid() });
    chrome.cookies.set({
        url: 'https://www.coupert.com',
        domain: 'coupert.com',
        name: 'exd',
        value: guid(),
        expirationDate: 1000 * 60 * 60 * 24 * 365
    });
})();

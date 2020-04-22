
var CBOverrideNotify = function(){
    var self = this;
    self.tabId = 0;
    self.domain = "";
    self.merchantInfo = {};
    self.url = "";

    self.init = function(tabId, url, data){
        self.tabId = tabId;
        self.domain = data["domain"];
        self.url = url;
        self.merchantInfo = data["merchant-info"];

        self.show();
        Cookies.set(data["root-domain"] + "cb-override-notify-already-popup", "YES");
        ga('send', 'event', 'impression', 'cb_affiliate_override_impr', '/cb/affiliate/override/impr/' + self.domain, 1, {'nonInteraction': 1});
    }

    self.show = function(){
        self.showCashbackRate();
    }

    self.showCashbackRate = function(){
        $(".re-activate-num").html(cashbackMaxMinRate(self.merchantInfo.CBMinRate, self.merchantInfo.CBMaxRate));
    }
}

/*------------------------------ entrance ---------------------------*/
    chrome.tabs.getCurrent(function(tab) {
        execute(tab.id, tab.url);
    });

    function execute(tabId, url){
        chrome.tabs.sendMessage(tabId, {"action": "get-cache-or-cookie", "session-cache": [
            "domain",
            "root-domain",
            "merchant-info",
            "store-info",
            "coupons",
            "deals"
        ]}, function (data){
            var cborn = new CBOverrideNotify();
            cborn.init(tabId, url, data);
            Cookies.set("cb_override_showed", 'YES');
            chrome.extension.getBackgroundPage().statistics.log({action: 'impr', param: 'cb_override_notify', domain: data['domain'], root_domain: data['root-domain']});
            eventListener(tabId, data);
        });
    }
/*------------------------------ > ^_^ < -----------------------------*/

/*-------------------------- event listener --------------------------*/
    function eventListener(tabId, data){
        $(".close-btn").click(function (){
            ga('send', 'event', 'close', 'cb_affiliate_override_close', '/cb/close/affiliate/override/' + data["domain"], 1, {'nonInteraction': 1});
            chrome.extension.getBackgroundPage().service.closeClick(data["domain"], data["merchant-info"].ID, "CB_OVERRIDE");
            chrome.tabs.sendMessage(tabId, {"action": 'close-iframe', "iframe": ["__COUPERT_US_CB_OVERRIDE_NOTIFY__"]});
        });

        $(".re-activate").click(function(){
            chrome.extension.getBackgroundPage().statistics.log({action: 'click', param: 'cb_override_notify', domain: data['domain'], root_domain: data['root-domain']});
            chrome.extension.getBackgroundPage().setServiceUsedCookie();
            var self = this;
            ga('send', 'event', 'click', 'cb_affiliate_override_click', '/cb/click/affiliate/override/' + data["domain"], 1, {'nonInteraction': 1});
            chrome.tabs.sendMessage(tabId, {"action": "set-affiliate-cookie", "domain": data["root-domain"], "relation": "self"});
            chrome.tabs.sendMessage(tabId, {"action": "set-cashback-cookie", "domain":data["root-domain"]});

            chrome.extension.getBackgroundPage().setIconBadge(tabId, getBadgeText(data));

            let trackingId = generateTrackingId('cb_affiliate_override_click');
            chrome.extension.getBackgroundPage().openWindow(data["merchant-info"].url+"&tracking_id="+trackingId, false, data["root-domain"]);
            chrome.extension.getBackgroundPage().service.cbClick(data["domain"], data["merchant-info"].ID, "CB_OVERRIDE", trackingId, data["merchant-info"].LeastOrderAmount, data["merchant-info"].CashBackPercentage, "0", getCache("user_email")); // cb-click log

            chrome.extension.getBackgroundPage().user.info({}, function(response){
                chrome.extension.getBackgroundPage().activateAndReloadStorePopup({"root-domain":data["root-domain"], "tab-id": tabId});
                chrome.tabs.sendMessage(tabId, {"action": "reloading-store-popup-page"});
                chrome.tabs.sendMessage(tabId, {"action": 'close-iframe', "iframe": ["__COUPERT_US__", "__COUPERT_US_CB_OVERRIDE_NOTIFY__"]});
            }, function(){
                chrome.tabs.sendMessage(tabId, {"action": "set-cache-or-cookie", "cookie": {"name": "cb_click_at_popup_page", "value": "YES", "seconds": 60}}, function(response){
                    if (response.status === "success") {
                        chrome.tabs.sendMessage(tabId, {"action": "reloading-store-popup-page"}, function(response){
                            chrome.extension.getBackgroundPage().activateAndReloadStorePopup({"root-domain":data["root-domain"], "tab-id": tabId});
                            chrome.tabs.sendMessage(tabId, {"action": 'close-iframe', "iframe": ["__COUPERT_US_CB_OVERRIDE_NOTIFY__"]});
                        });
                    }
                });
            });
        });

        $(".override-tips").click(function(){
            ga('send', 'event', 'turnoff', 'cb_affiliate_override_turnoff', '/cb/affiliate/override/turnoff/' + data["domain"], 1, {'nonInteraction': 1});
            chrome.tabs.sendMessage(tabId, {"action": "set-cache-or-cookie", "cookie": {"name": "cb_override_turnoff", "value": "YES", "seconds": 60 * 60 * 24}});
            chrome.tabs.sendMessage(tabId, {"action": 'close-iframe', "iframe": ["__COUPERT_US_CB_OVERRIDE_NOTIFY__"]});
        });
    }
/*------------------------------ > ^_^ < -----------------------------*/

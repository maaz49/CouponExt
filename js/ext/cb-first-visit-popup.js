
var CBFirstVisitPopup = function(){
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
        self.storeInfo = data["store-info"];
        self.rules = data["merchant-rules"];
        self.coupons = data["coupons"];

        self.show();

        chrome.extension.getBackgroundPage().service.cbImpr(self.domain, self.url, "p0", "CB_FIRSTVISIT_POP"); // cb-popup log
        ga('send', 'event', 'impression', 'cb_firstvisit_impr', '/cb/impr/firstvisit/' + self.domain, 1, {'nonInteraction': 1});
    }

    self.show = function(){
        self.showCashbackRate();
        self.showCoupons();
    }

    self.showCashbackRate = function(){
        $(".cashback-rate").html(cashbackMaxMinRate(self.merchantInfo.CBMinRate, self.merchantInfo.CBMaxRate));
        $(".active-up-box").show();
    }

    self.showCoupons = function() {
        if (self.coupons.length > 0 && self.rules.length > 0) {
            let hasATRule = false;
            self.rules.forEach((rule) => {
                if (rule.MerchantType == 'AT') {
                    hasATRule = true;
                }
            });
            if (hasATRule) {
                $('#codes-num').text(self.coupons.length);
                $('.have-coupons').show();
            }
        }
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
            "merchant-rules",
            "coupons",
        ]}, function (data){
            chrome.extension.getBackgroundPage().statistics.log({action: 'impr', param: 'chrismas_cb_first_visit', domain: data['domain'], root_domain: data['root-domain']});
            var cfvp = new CBFirstVisitPopup();
            cfvp.init(tabId, url, data);
            eventListener(tabId, data);
        });
    }
/*------------------------------ > ^_^ < -----------------------------*/

/*-------------------------- event listener --------------------------*/
    function eventListener(tabId, data){
        $(".close-btn").click(function (){
            ga('send', 'event', 'close', 'cb_firstvisit_close', '/cb/close/firstvisit/' + data["domain"], 1, {'nonInteraction': 1});

            chrome.extension.getBackgroundPage().service.closeClick(data["domain"], data["merchant-info"].ID, "CB_FIRST_VISIT");
            chrome.tabs.sendMessage(tabId, {"action": 'close-iframe', "iframe": ["__COUPERT_FIRST_VISIT_POPUP_US__"]});
        });

        $("#cb-trun-off").click(function(){
            ga('send', 'event', 'turnoff', 'cb_firstvisit_turnoff', '/cb/firstvisit/turnoff/' + data["domain"], 1, {'nonInteraction': 1});
            chrome.tabs.sendMessage(tabId, {"action": "set-cache-or-cookie", "cookie": {"name": "cb_first_visit_turnoff","value": "YES","seconds": 24*60*60, "domain":data["root-domain"]}});
            chrome.tabs.sendMessage(tabId, {"action": 'close-iframe', "iframe": ["__COUPERT_FIRST_VISIT_POPUP_US__"]});
        });

        $(".active-up-box").click(function(){
            chrome.extension.getBackgroundPage().setServiceUsedCookie();
            var self = this;
            $(self).hide();
            $(".active-after-box").addClass("btn-activated");
            $(".active-after-box").show();
            ga('send', 'event', 'click', 'cb_firstvisit_click', '/cb/click/firstvisit/' + data["domain"], 1, {'nonInteraction': 1});
            chrome.tabs.sendMessage(tabId, {"action": "set-affiliate-cookie", "domain": data["root-domain"], "relation": "self"});
            if ("YES" == data["store-info"].is_cashback) {
                chrome.tabs.sendMessage(tabId, {"action": "set-cashback-cookie", "domain":data["root-domain"]});
            }
            let trackingId = generateTrackingId('cb_first_visit_click');
            chrome.extension.getBackgroundPage().openWindow(data["merchant-info"].url+"&tracking_id="+trackingId, false, data["root-domain"]);
            chrome.extension.getBackgroundPage().service.cbClick(data["domain"], data["merchant-info"].ID, "FIRSTVISIT_POP_CB", trackingId, data["merchant-info"].LeastOrderAmount, data["merchant-info"].CashBackPercentage, "0", getCache("user_email")); // cb-click log
            delay(3000).then(function(){
                    chrome.tabs.sendMessage(tabId, {"action": 'close-iframe', "iframe": ["__COUPERT_FIRST_VISIT_POPUP_US__"]});
            });
            chrome.extension.getBackgroundPage().user.info({}, function(response){
                chrome.tabs.sendMessage(tabId, {"action": "reloading-store-popup-page", "auto":"YES", "replace": "YES"});
            }, function(){
                chrome.tabs.sendMessage(tabId, {"action": "set-cache-or-cookie", "cookie": {"name": "cb_click_at_popup_page", "value": "YES", "seconds": 20}}, function(response){
                    chrome.tabs.sendMessage(tabId, {"action": "reloading-store-popup-page"}, function(response){
                        chrome.tabs.sendMessage(tabId, {"action": 'close-iframe', "iframe": ["__COUPERT_FIRST_VISIT_POPUP_US__"]});
                    });
                });
            });
        });

        $('.cb-first-chrismas-wraper').click(function() {
            chrome.extension.getBackgroundPage().statistics.log({action: 'click', param: 'chrismas_cb_first_visit', domain: data['domain'], root_domain: data['root-domain']});
            window.open(CHRISTMAS + "cb_first_visit_banner" + "&guid=" + guid(), '_blank');
        });
    }
/*------------------------------ > ^_^ < -----------------------------*/

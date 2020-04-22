var AtPopup = function(){
    var self = this;
    self.tabId = 0;
    self.domain = "";
    self.codeTotal = 0;
    self.showCodeList = [];
    self.merchantInfo = {};
    self.storeInfo = {};
    self.cashBackPercentage = 0;
    self.lang = "en_us";

    self.init = function(tabId, url, data){
        self.tabId = tabId;
        self.domain = data["domain"];
        self.codeTotal = data["coupons"].length > 10 ? 10 : data["coupons"].length;
        self.merchantInfo = data["merchant-info"];
        self.storeInfo = data["store-info"];
        self.lang = getUILanguage();

        self.processData();
        self.show();

        chrome.extension.getBackgroundPage().service.atImpr(self.domain, url); // at-popup log
        ga('send', 'event', 'impression', 'at_impr', '/at/impr/' + self.domain, 1, {'nonInteraction': 1});
    }

    self.processData = function(){
        self.extractUsefulDataFromStoreInfo();
    }

    self.extractUsefulDataFromStoreInfo = function(){
        self.cashBackPercentage = Math.ceil(parseFloat(self.merchantInfo.CashBackPercentage) * 100);
    }

    self.show = function(){
        self.showData();
        self.popupPage();
    }

    self.showData = function(){
        // show code nubmer
        $(".coupon-count > span, .coupon-count > b").html(self.codeTotal);
        // if current merchant is cb, show cashback rate
        if ("YES" == self.storeInfo.is_cashback) {
            $(".cashback-rate").html(cashbackMaxMinRate(self.merchantInfo.CBMinRate, self.merchantInfo.CBMaxRate));
            $("#cashback-show").show();
        }
        if ("YES" == self.storeInfo.is_login) {
            var leaveGold = 0;
            var currentGold = 0;
            if (!!self.storeInfo.withdraw && self.storeInfo.withdraw == 1) {
                leaveGold = 0;
                var withdrawMoney = self.storeInfo.withdraw_money;
                currentGold = parseInt(self.storeInfo.gold || 0);
                $('.gold-redeem').show();
                $('.gold-redeem-num').text(dollarFormat(withdrawMoney, 'withdraw-money'));
                $('.gold-redeem-gold').text(parseInt(withdrawMoney*100));
            } else {
                leaveGold = parseInt(self.storeInfo.gold_to_withdraw || 0);
                currentGold = 1000 - leaveGold;
                $(".gold-balance").text(leaveGold);
                $('.gold-explanation').show();
            }
            $(".gold-num").text(currentGold);           
            $('.progress').css('width', (currentGold / 1000)*100+'%');
        } else {
            var leaveGold = 700;
            var currentGold = 1000 - leaveGold;
            $(".gold-num").text(currentGold);
            $(".gold-balance").text(leaveGold);
            $('.progress').css('width', (currentGold / 1000)*100+'%');
            $('.gold-explanation').show();
        }
        $(".gold-progress").show();
    }

    self.popupPage = function(){
        $(".auto-testing-pop").show();
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
            "store-info",
            "merchant-info",
            "coupons"
        ]}, function (data){
            var ap = new AtPopup();
            ap.init(tabId, url, data);
            eventListener(tabId, data);
        });
    }
/*------------------------------ > ^_^ < -----------------------------*/

/*-------------------------- event listener --------------------------*/
    function eventListener(tabId, data){
        $(".close-btn").click(function (){
            ga('send', 'event', 'close', 'at_close', '/at/close/' + data["domain"], 1, {'nonInteraction': 1});
            chrome.tabs.sendMessage(tabId, {action: 'Cookies-set', name: 'at_closed', value: 'YES', options: {domain: data["root-domain"], expires: 60 * 15}});
            if ('YES' != ls.get('at_close_tip_popped')) {
                chrome.tabs.sendMessage(tabId, {action: 'show-close-tips', panel: 'at'});
            }
            ls.set('at_close_tip_popped', 'YES');
            chrome.extension.getBackgroundPage().service.closeClick(data["domain"], data["merchant-info"].ID, "AT");
            chrome.tabs.sendMessage(tabId, {"action": "close-iframe", "iframe":["__COUPERT_US_AT__"]});
        });

        $(".button").click(function(){
            ga('send', 'event', 'click', 'at_click', '/at/click/' + data["domain"], 1, {'nonInteraction': 1});
            chrome.tabs.sendMessage(tabId, {"action": "set-affiliate-cookie", "domain": data["root-domain"], "relation": "self"});
            if ("YES" == data["store-info"].is_cashback) {
                chrome.tabs.sendMessage(tabId, {"action": "set-cashback-cookie", "domain":data["root-domain"]});
            }
            ls.set("batch-number", batchNumber());
            Storages.localStorage.set('welcome_disabled', 'YES');
            let trackingId = generateTrackingId('impr_at_click');
            chrome.extension.getBackgroundPage().openWindow(data["merchant-info"].url+"&tracking_id="+trackingId, false, data["root-domain"]);
            chrome.extension.getBackgroundPage().service.atClick(data["merchant-info"].ID, "AT_POPUP", trackingId, getCache("user_email")); // at-click log
            chrome.tabs.sendMessage(tabId, {"action": "reloading-store-popup-page", "hide":"YES"});
            chrome.tabs.sendMessage(tabId, {"action": "show-at-testing-page"});
            chrome.tabs.sendMessage(tabId, {"action": "close-iframe", "iframe":["__COUPERT_US_AT__"]});
        });

        $(".at-trun-off").click(function(){
            $(this).hide();
            $(".at-popup-disabled").show();
            chrome.tabs.sendMessage(tabId, {"action": "reloading-store-popup-page", "auto":"YES", "replace": "YES"});
            ga('send', 'event', 'turnoff', 'at_turnoff', '/at/turnoff/' + data["domain"], 1, {'nonInteraction': 1});
            chrome.tabs.sendMessage(tabId, {"action": "set-cache-or-cookie","cookie": {"name": "at_turnoff","value": "YES", "seconds": 24*60*60, "domain":data["root-domain"]}});
        });

        $(".join-tips-words").click(function(){
            ga('send', 'event', 'statistics', 'ambassador', '/statistics/ambassador/at/' + data["domain"], 1, {'nonInteraction': 1});
            window.open(ambassadorProgramURL + "at-popup", "_blank");
        });

        $(".gold-detail span b").hover(function () {
            $(this).find(".gold-tips").show();
        },function () {
            $(this).find(".gold-tips").hide();
        });

        $('.mini-btn').click(function () {
            chrome.extension.getBackgroundPage().statistics.log({action: 'click', param: 'at-pop-up-minimize', domain: data['domain'], root_domain: data['root-domain']});
            chrome.tabs.sendMessage(tabId, {action: 'Cookies-set', name: 'popup_size', value: 'small', options: {domain: data["root-domain"]}});
            chrome.tabs.sendMessage(tabId, {action: "at-popup-minimize"});
            chrome.tabs.sendMessage(tabId, {"action": "close-iframe", "iframe":["__COUPERT_US_AT__"]});
        });
    }
/*------------------------------ > ^_^ < -----------------------------*/

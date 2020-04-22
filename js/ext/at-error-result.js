
var ErrorResult = function(){
    var self = this;
    self.tabId = 0;
    self.domain = "";
    self.storeInfo = {};
    self.merchantInfo = {};
    self.at = "";
    self.cb = "";
    self.cashBackPercentage = 0;
    self.lang = "en_us";
    self.codeTotal = 0;
    self.isLogin = 0;
    self.tryOtherCodes = "visible";

    self.init = function(tabId, data){
        self.tabId = tabId;
        self.domain = data["domain"];
        self.rootDomain = data["root-domain"];
        self.lang = getUILanguage();
        self.isLogin = data["is-login"];
        self.codeTotal = data["coupons"].length;
        self.storeInfo = data["store-info"];
        self.merchantInfo = data["merchant-info"];
        self.tryOtherCodes = !!data["try_other_codes"] ? data["try_other_codes"] : "visible";
        self.cashBackPercentage = Math.ceil(parseFloat(self.merchantInfo.CashBackPercentage) * 100);

        self.show();
        self.clearCache();
        self.replaceLinkHref();
    }

    self.show = function(){
        self.showErrorTestResultInfo();
    }

    self.replaceLinkHref = function(){
        $(".how-it-works-link").attr("href", howItWorksURL + "at-test-result-link" + "&guid=" + guid());
    }

    self.showErrorTestResultInfo = function(){
        if ("YES" == self.storeInfo.is_cashback) {
            self.showCashbackModule();
        } else {
            self.showNoCashbackModule();
            self.showCheckoutButton();
        }
    }

    self.showCashbackModule = function(){
        $(".cashback").show();
        $(".cashback-rate").html(cashbackMaxMinRate(self.merchantInfo.CBMinRate, self.merchantInfo.CBMaxRate));
        self.showLoginModule();
    }

    self.showLoginModule = function(){
        if (!!self.isLogin) {
            $("#logged-cashback-module").show();
            self.showCheckoutButton();
            chrome.tabs.sendMessage(self.tabId, {action: "Cookies-get", name: "test_result_cb_activated", domain: self.rootDomain}, function (response) {
                var value = response.value;
                if ("YES" == value) {
                    $(".cashback-activated").show();
                } else {
                    chrome.extension.getBackgroundPage().statistics.log({action: 'impr', param: 'activate-cb-after-at-no-savings', domain: self.domain, root_domain: self.rootDomain});
                    ga('send', 'event', 'impression', 'cb_at_no_saving_impr', '/cb/impr/at_no_saving/' + self.domain, 1, {'nonInteraction': 1});
                    $(".cashback-active").show();
                }
            });
        } else {
            chrome.extension.getBackgroundPage().statistics.log({action: 'impr', param: 'activate-cb-after-at-no-savings', domain: self.domain, root_domain: self.rootDomain});
            $("#not-logged-cashback-module").show();
            $(".failed-cashback-desc").show();
            $(".cashback-active").show();
        }
    }

    self.showNoCashbackModule = function(){
        $(".no-cashback").show();
        return ;
        if (Cookies.get('no_cashback_no_saving_reward') == 'YES') {
            return ;
        }
        chrome.extension.getBackgroundPage().statistics.log({action: 'impr', param: 'at_testing_no_savings_reward', domain: self.domain, root_domain: self.rootDomain});
        $(".no-cashback .cashback-tips").show();
        $(".no-cashback .unlock-rewards").show();
    }

    self.showCheckoutButton = function(){
        $("#failed-checkout").show();
    }

    self.clearCache = function(){
        ls.remove("batch-number");
        chrome.tabs.sendMessage(self.tabId, {"action": "remove-cache-or-cookie", "session-cache":["refresh-testing-code-index", "refresh-valid-code-list", "org-price", "now-price", "remove-valid-code", "results-each-round-testing", "refresh-first-test"]});
    }
}

chrome.tabs.getCurrent(function(tab) {
    execute(tab.id);
});

function execute(tabId){
    chrome.tabs.sendMessage(tabId, {"action": "get-cache-or-cookie", 
        "session-cache": [
            "domain",
            "root-domain",
            "store-info",
            "merchant-info",
            "coupons",
            "is-login",
            "balance",
        ], 
        "cookie": [
            "try_other_codes",
        ]
    }, function (data){
        var er = new ErrorResult();
        er.init(tabId, data);
        eventListener(tabId, data);
    });
}

/*-------------------------- event listener --------------------------*/
    function eventListener(tabId, data){
        $("#at-test-failed-close, #failed-checkout").click(function(){
            if ("page-close" == $(this).attr("data-flag")) {
                ga('send', 'event', 'close', 'at_result_close', '/at/result/close/' + data["domain"], 1, {'nonInteraction': 1});
            } else if ("checkout" == $(this).attr("data-flag")) {
                ga('send', 'event', 'click', 'at_test_result_continue', '/at/test/result/continue/' + data["domain"], 1, {'nonInteraction': 1});
            }

            chrome.extension.getBackgroundPage().service.closeClick(data["domain"], data["merchant-info"].ID, "TESTRESULT");
            chrome.tabs.sendMessage(tabId, {action: 'close-iframe'});
        });

        $("#failed-checkout").click(function(){
            if ("page-close" == $(this).attr("data-flag")) {
                ga('send', 'event', 'close', 'at_result_close', '/at/result/close/' + data["domain"], 1, {'nonInteraction': 1});
            } else if ("checkout" == $(this).attr("data-flag")) {
                ga('send', 'event', 'click', 'at_test_result_continue', '/at/test/result/continue/' + data["domain"], 1, {'nonInteraction': 1});
            }
            chrome.extension.getBackgroundPage().statistics.log({action: 'click', param: "at_testing_no_savings_continue_to_checkout", domain: data['domain'], root_domain: data['root-domain']});
            chrome.extension.getBackgroundPage().service.closeClick(data["domain"], data["merchant-info"].ID, "TESTRESULT");
            chrome.tabs.sendMessage(tabId, {action: 'close-iframe'});
        });

        $(".feedback-entrance").click(function(){
            ga('send', 'event', 'statistics', 'feedback', '/statistics/feedback/impr/test-result/' + data["domain"], 1, {'nonInteraction': 1});
            chrome.tabs.sendMessage(tabId, {"action": "show-feedback-page"});
        });

        $(".hover-tips").hover(function () {
            $(".hover-tips a").show();
        }, function () {
            $(".hover-tips a").hide();
        });

        $(".how-it-works-link").click(function(){
            window.open(howItWorksURL + "at-test-result-link" + "&guid=" + guid(), '_blank');
            return false;
        });

        $(".ambassador-link").click(function (){
            ga('send', 'event', 'statistics', 'ambassador', '/statistics/ambassador/test-result/' + data["domain"], 1, {'nonInteraction': 1});
            window.open(ambassadorProgramURL + "at-test-result-link", '_blank');
        });

        $("#login-in-element").click(function(){
            chrome.tabs.sendMessage(tabId, {"action": "set-cache-or-cookie", "cookie": {"name": "login_click_at_test_result_page", "value": "YES", "seconds": 20}}, function(){
                chrome.tabs.sendMessage(tabId, {"action": "reloading-store-popup-page"});
            });
        });

        $(".unlock-rewards").click(function() {
            chrome.extension.getBackgroundPage().statistics.log({action: 'click', param: "at_testing_no_savings_unlock_rewards_now", domain: data['domain'], root_domain: data['root-domain']});
            var self = this;
            chrome.tabs.sendMessage(tabId, {"action": "get:url"}, function (response) {
                var url = response.url;
                chrome.extension.getBackgroundPage().statistics.atService({url: url})
                .then(function (res) {
                    var msg = res.msg;
                    if ("Unauthorized" == msg) {
                        chrome.tabs.sendMessage(tabId, {"action": "set-cache-or-cookie", "cookie": {"name": "click_position", "value": "no_cashback_no_saving_result", "seconds": 20}}, function(){
                            chrome.tabs.sendMessage(tabId, {"action": "reloading-store-popup-page"});
                        });
                    } else {
                        Cookies.set('no_cashback_no_saving_reward', 'YES', {expire: 60*60*24});
                        $(".unlock-rewards").hide();
                        $(".rewards-unlocked").show();
                    }
                });
            });      
        });

        $(".cashback-active").click(function () {
            chrome.extension.getBackgroundPage().statistics.log({action: 'click', param: 'activate-cb-after-at-no-savings', domain: data["domain"], root_domain: data["root-domain"]});
            ga('send', 'event', 'click', 'cb_at_no_saving_click', '/cb/click/at_no_saving/' + data["domain"], 1, {'nonInteraction': 1});
            chrome.extension.getBackgroundPage().user.info({}, function(response){
                let trackingId = generateTrackingId('store_cb_click');
                chrome.extension.getBackgroundPage().openWindow(data["merchant-info"].url+"&tracking_id="+trackingId, false, data["root-domain"]);
                chrome.extension.getBackgroundPage().service.cbClick(data["domain"], data["merchant-info"].ID, "CB_AFTER_AT_RESULT_NO_SAVINGS", trackingId, data["merchant-info"].LeastOrderAmount, data["merchant-info"].CashBackPercentage, "0", getCache("user_email")); // cb-click log
                $(".cashback-activated").show();
                $(".cashback-active").hide();
                chrome.tabs.sendMessage(tabId, {action: "Cookies-set", name: "test_result_cb_activated", value: "YES", options: {domain: data["root-domain"]}});
            }, function(){
                chrome.tabs.sendMessage(tabId, {"action": "set-cache-or-cookie", "cookie": {"name": "click_position", "value": "no_cashback_no_saving_result", "seconds": 20}}, function(){
                    chrome.tabs.sendMessage(tabId, {"action": "reloading-store-popup-page"});
                });
            });
        });
        
        $('.check-in-entrance').click(function () {
            chrome.tabs.sendMessage(tabId, {"action": "reloading-store-popup-page"});
        });
    }

    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse){
        switch(message.action) {
            case "render-test-result-page-after-logged":
                renderTestResultPageAfterLogged(message);
                break;
            case "render-test-result-page-after-logout":
                renderTestResultPageAfterLogout(message);
                break;
        }
    });

    function renderTestResultPageAfterLogged(message){
        $("#not-logged-cashback-module").hide();
        $("#logged-cashback-module, #failed-checkout").show();
    }

    function renderTestResultPageAfterLogout(message){
        $("#not-logged-cashback-module").show();
        $("#logged-cashback-module, #failed-checkout").hide();
    }

    $("span.cashback-num.red-num").hover(function () {
       $(".how-it-works-link").show();
    },function () {
        $(".how-it-works-link").hide();
    });

    $("span.red-num.gold-num").hover(function () {
       $(".gold-num-hover").show();
    },function () {
        $(".gold-num-hover").hide();
    })
/*------------------------------ > ^_^ < -----------------------------*/

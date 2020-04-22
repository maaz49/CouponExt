
var SuccessResult = function(){
    var self = this;
    self.tabId = 0;
    self.domain = null;
    self.bestCode = null;
    self.merchantInfo = {};
    self.storeInfo = {};
    self.cashBackPercentage = 0;
    self.isLogin = 0;
    self.userRef = "";
    self.bottomModuleBeShown = "";

    self.init = function(tabId, data){
        self.tabId = tabId;
        self.domain = data["domain"];
        self.rootDomain = data["root-domain"];
        self.bestCode = data["best-code"];
        self.merchantInfo = data["merchant-info"];
        self.storeInfo = data["store-info"];
        self.isLogin = data["is-login"];
        self.userRef = data["user-ref"];
        self.bottomModuleBeShown = data["bottom-module-be-shown-in-at-success-page"];
        self.cashBackPercentage = Math.ceil(parseFloat(self.merchantInfo.CashBackPercentage) * 100);
        self.url = data["url"];
        self.show();
        self.clearCache();
        self.replaceLinkHref();


        chrome.tabs.sendMessage(tabId, {"action": "best-code-applied-check", "rule":data["store-info"].best_code_applied_check, "best_price": self.bestCode["now_price"], "domain": data["domain"]});
        chrome.extension.getBackgroundPage().setServiceUsedCookie();
    }

    self.show = function(){
        self.showSuccessTestResultInfo();
    }

    self.replaceLinkHref = function(){
        $("#share-module > li.messages > a").attr("href", messagesShareURL.replace(/\{REF\}/g, self.userRef));
        $("#share-module > li.facebook > a").attr("href", facebookShareURL.replace(/\{REF\}/g, self.userRef));
        $("#share-module > li.twitter > a").attr("href", twitterShareURL.replace(/\{REF\}/g, self.userRef));
        $("#share-module > li.email > a").attr("href", emailShareURL
            .replace('[[subject]]', M('share_email_title'))
            .replace('[[body]]', M('share_email_desc')
                .replace('[[ref]]', self.userRef)
            )
        );
        $(".how-it-works-link").attr("href", howItWorksURL + "at-test-result-link" + "&guid=" + guid());
    }

    self.showSuccessTestResultInfo = function(){
        self.showBestCodeInfo();
        self.showCashBackTips();
        self.showShareOrReviewModule();
    }

    self.showBestCodeInfo = function(){
        try {
            $(".code").html(self.bestCode.Code).attr("data-clipboard-text", self.bestCode.Code).attr("data-code-id", self.bestCode.ID);
            $("#best-code").html(currencyFormat(self.bestCode.original_price, self.bestCode.saving).other);
            $("#without-coupert").html(currencyFormat(self.bestCode.original_price).currency);
            $("#with-coupert").html(currencyFormat(self.bestCode.original_price, self.bestCode.now_price).other);
                let saved=currencyFormat(self.bestCode.original_price, self.bestCode.saving).other;
                chrome.tabs.sendMessage(self.tabId, {"action":"set_saved","saved":saved})
        } catch (e) {
            console.log(e);
        }
        chrome.tabs.sendMessage(self.tabId, {
            "action": "get-cache-or-cookie",
            "cookie": ["ajax_at_success_first_popup", "refresh_at_success_first_popup", "ajax_at_success_flag", "refresh_at_success_flag"],
        }, function(data){
            chrome.tabs.sendMessage(self.tabId, {
                "action": "remove-cache-or-cookie",
                "cookie": ["ajax_at_success_first_popup", "refresh_at_success_first_popup"],
            });
            // if test type is ajax, clear ajax flag
            if (!!data["ajax_at_success_flag"]) {
                if (!data["ajax_at_success_first_popup"]) {
                    chrome.tabs.sendMessage(self.tabId, {"action": "remove-cache-or-cookie",
                        "cookie": ["ajax_at_success_flag"],
                        "session-cache": ["best-code"],
                    });
                }
            }
            // if test type is refresh, clear refresh flag
            if (!!data["refresh_at_success_flag"]) {
                if (!data["refresh_at_success_first_popup"]) {
                    chrome.tabs.sendMessage(self.tabId, {"action": "remove-cache-or-cookie",
                        "cookie": "refresh_at_success_flag",
                        "session-cache": ["best-code"],
                    });
                }
            }
            if (!!data["ajax_at_success_flag"] || !!data["refresh_at_success_flag"]) {
                return ;
            }
            // if test type is not refresh or ajax, delete cache
            chrome.tabs.sendMessage(self.tabId, {"action": "remove-cache-or-cookie",
                "session-cache": ["best-code"],
            });
        });
    }

    self.showCashBackTips = function(){
        if ("YES" == self.storeInfo.is_cashback) {
            $(".cashback-rate").html(cashbackMaxMinRate(self.merchantInfo.CBMinRate, self.merchantInfo.CBMaxRate));
            $(".cashback-tips").show();
            self.showLoginModule();
        }
    }

    self.showLoginModule = function(){
        if (!!self.isLogin) {
            $("#logged-cashback-module").show();
        } else {
            $("#not-logged-cashback-module").show();
        }
    }

    self.showShareOrReviewModule = function(){
        let action = parseInt(self.storeInfo.action);
        switch(action) {
            case 1:
                self.showShareModule();
                break;
            case 2:
                self.showReviewModule();
                break;
            case 0:
                self.randomShow();
                break;
            default :
                self.randomShow();
                break;
        }
    }

    self.randomShow = function () {
        var subdomain = getDomainFromURL(self.url);
        var domain = getRootDomain(subdomain);
        let number = Math.ceil(Math.random()*100);
        if (self.isLogin) {
            if (number > 0 && number <= 40) {
                self.showShareModule();
            } else if (number > 40 && number <= 70) {
                self.showReviewModule();
            } else if (number > 70 && number <= 100) {
                self.showCheckInModule();
            }
        } else {
            if (number > 0 && number <= 60) {
                self.showReviewModule();
            } else if (number > 60 && number <= 100) {
                self.showCheckInModule();
            }
        }
    }

    self.showChristmas = function () {
        chrome.extension.getBackgroundPage().statistics.log({action: 'impr', param: 'christmas_at_test_result_tips', domain: self.domain, root_domain: self.rootDomain});
        $('.christmas-wrapper').show();
    }

    self.showCreditCard = function () {
        chrome.extension.getBackgroundPage().statistics.log({action: 'impr', param: 'credit_card_at_test_result_tips', domain: self.domain, root_domain: self.rootDomain});
        $('.credit-card-wrapper').show();
    }

    self.randomShowRefReview = function(){
        if (!self.bottomModuleBeShown) {
            var random = Math.ceil(Math.random()*2);
            self.bottomModuleBeShown = (1 === random) ? "share" : "review";
            chrome.tabs.sendMessage(self.tabId, {"action": "set-cache-or-cookie", "cookie": {"name": "bottom-module-be-shown-in-at-success-page", "value": self.bottomModuleBeShown, "seconds": 30*60, "domain": self.rootDomain}});
        }
        switch(self.bottomModuleBeShown) {
            case "share":
                self.showShareModule();
                break;
            case "review":
                self.showReviewModule();
                break;
        }
    }

    self.showReviewModule = function(){
        $(".review-coupert").show();
    }

    self.showShareModule = function(){
        $(".share-coupert").show();
    }

    self.showCheckInModule = function(){
        $(".check-in-banner").show();
    }

    self.clearCache = function(){
        ls.remove("batch-number");
        chrome.tabs.sendMessage(self.tabId, {"action": "remove-cache-or-cookie", "session-cache":["refresh-testing-code-index", "refresh-valid-code-list", "org-price", "now-price", "remove-valid-code", "results-each-round-testing", "refresh-first-test"]});
    }
}

chrome.tabs.getCurrent(function(tab) {
    execute(tab.id, tab.url);
});

function execute(tabId, url){
    chrome.tabs.sendMessage(tabId, {"action": "get-cache-or-cookie",
        "session-cache": [
            "domain",
            "root-domain",
            "store-info",
            "merchant-info",
            "best-code",
            "is-login",
            "balance",
            "user-ref"
        ],
        "cookie": [
            "bottom-module-be-shown-in-at-success-page",
        ]
    }, function (data){
        data['url'] = url;
        try {
            chrome.extension.getBackgroundPage().service.atApplyBestCode(data["best-code"].Code,data["best-code"].saving,data["best-code"].ID);
            chrome.extension.getBackgroundPage().coupon.isBest(data["best-code"].ID);
        } catch (e) {
            console.log(e);
        } finally {
            var sr = new SuccessResult();
            sr.init(tabId, data);
            eventListener(tabId, data);
        }
    });
}

(function () {
    $('[ga-category][ga-action][ga-label]').click(function() {
        var category = $(this).attr('ga-category');
        var action = $(this).attr('ga-action');
        var label = $(this).attr('ga-label');
        if (category && action && label) {
            ga('send', 'event', category, action, label, 1, {'nonInteraction': 1});
        }
    });
})();

/*-------------------------- event listener --------------------------*/
    function eventListener(tabId, data){
        $("#at-test-success-close, .checkout, .checkout-not-now").click(function(){
            if ("page-close" == $(this).attr("data-flag")) {
                ga('send', 'event', 'close', 'at_result_close', '/at/result/close/' + data["domain"], 1, {'nonInteraction': 1});
            } else if ("checkout" == $(this).attr("data-flag")) {
                ga('send', 'event', 'click', 'at_test_result_continue', '/at/test/result/continue/' + data["domain"], 1, {'nonInteraction': 1});
            }

            chrome.extension.getBackgroundPage().service.closeClick(data["domain"], data["merchant-info"].ID, "TESTRESULT");
            chrome.tabs.sendMessage(tabId, {action: 'close-iframe'});
        });

        $(".code").click(function(){
            var element = this;
            var clipboard = new Clipboard('.code');
            $(this).hide();
            $(".copied").show();
            setTimeout(function () {
                $(".code").show();
                $(".copied").hide();
            }, 1600);
            let trackingId = generateTrackingId("saving_cc_click");
            chrome.extension.getBackgroundPage().service.ccClick(data["merchant-info"].ID, $(element).attr("data-code-id"), trackingId, getCache("user_email")); // cc-click log
            chrome.tabs.sendMessage(tabId, {"action": "set-affiliate-cookie", "domain": data["root-domain"], "relation": "self"}, function(response){
                if ("competitor" == response.status) {
                    chrome.extension.getBackgroundPage().openWindow(data["merchant-info"].url + "&tracking_id=" + trackingId, false, data["root-domain"]);
                }
            });
            ga('send', 'event', 'statistics', 'saving_code_copy', '/statistics/saving/code/copy/' + data["domain"], 1, {'nonInteraction': 1});
        });

        $("#at-test-review-coupert").click(function () {
            ga('send', 'event', 'click', 'at_test_result_review', '/at/test/result/review/' + data["domain"], 1, {'nonInteraction': 1});
            window.open(googleReviewURL);
        });

        $(".feedback-entrance").click(function(){
            ga('send', 'event', 'statistics', 'feedback', '/statistics/feedback/impr/test-result/' + data["domain"], 1, {'nonInteraction': 1});
            chrome.tabs.sendMessage(tabId, {"action": "show-feedback-page"});
        });

        $("#login-in-element").click(function(){
            chrome.tabs.sendMessage(tabId, {"action": "set-cache-or-cookie", "cookie": {"name": "login_click_at_test_result_page", "value": "YES", "seconds": 20}}, function(){
                chrome.tabs.sendMessage(tabId, {"action": "reloading-store-popup-page"});
            });
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
            ga('send', 'event', 'statistics', 'ambassador', '/statistics/ambassador/test-result/link/' + data["domain"], 1, {'nonInteraction': 1});
            window.open(ambassadorProgramURL + "at-test-result-link", '_blank');
        });

        $(".become-ambassador-btn").click(function(){
            ga('send', 'event', 'statistics', 'ambassador', '/statistics/ambassador/test-result/banner/' + data["domain"], 1, {'nonInteraction': 1});
            window.open(ambassadorProgramURL + "at-test-result-banner", '_blank');
        });

        $("#share-module li > a").click(function(){
            chrome.extension.getBackgroundPage().setReferFriendClickedCookie();
        });

        $('.credit-card').click(function () {
            ga('send', 'event', 'statistics', 'credit-card', '/statistics/credit-card/click/at-test-result', 1, {'nonInteraction': 1});
            chrome.extension.getBackgroundPage().statistics.log({action: 'click', param: 'credit_card_at_test_result_tips', domain: data['domain'], root_domain: data['root-domain']});
            window.open(CREDIT_CARD + guid(), "_blank");
            Storages.localStorage.set('credit_card_clicked', 'YES');
            return false;
        });

        $('.check-in-go').click(function () {
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
        $("#logged-cashback-module").show();
    }

    function renderTestResultPageAfterLogout(message){
        $("#not-logged-cashback-module").show();
        $("#logged-cashback-module").hide();
    }
/*------------------------------ > ^_^ < -----------------------------*/

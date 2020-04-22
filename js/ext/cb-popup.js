
var CbPopup = function(){
    var self = this;
    self.tabId = 0;
    self.domain = "";
    self.merchantInfo = {};
    self.isLogin = true;
    self.balance = "";
    self.lang = "en_us";

//     self.init = function(tabId, url, data){
//         self.tabId = tabId;
//         self.domain = data["domain"];
//         self.url = url;
//         self.merchantInfo = data["merchant-info"];
//         self.storeInfo = data["store-info"];
//         self.lang = getUILanguage();

//         self.show();
//         self.replaceLinkHref();

//         chrome.extension.getBackgroundPage().service.cbImpr(self.domain, self.url, "p0"); // cb-popup log
//         ga('send', 'event', 'impression', 'cb_impr', '/cb/impr/' + self.domain, 1, {'nonInteraction': 1});
//     }

//     self.show = function(){
//         self.showCashbackRate();
//         self.showUserBalance();
//         self.showData();
//     }

//     self.showData = function () {
//         if ("YES" == self.storeInfo.is_login) {
//             var leaveGold = 0;
//             var currentGold = 0;
//             if (!!self.storeInfo.withdraw && self.storeInfo.withdraw == 1) {
//                 leaveGold = 0;
//                 var withdrawMoney = self.storeInfo.withdraw_money;
//                 currentGold = parseInt(self.storeInfo.gold || 0);
//                 $('.gold-redeem').show();
//                 $('.gold-redeem-num').text(dollarFormat(withdrawMoney, 'withdraw-money'));
//                 $('.gold-redeem-gold').text(parseInt(withdrawMoney*100));
//             } else {
//                 leaveGold = parseInt(self.storeInfo.gold_to_withdraw || 0);
//                 currentGold = 1000 - leaveGold;
//                 $(".gold-balance").text(leaveGold);
//                 $('.gold-explanation').show();
//             }
//             $(".gold-num").text(currentGold);           
//             $('.progress').css('width', (currentGold / 1000)*100+'%');
//         } else {
//             var leaveGold = 700;
//             var currentGold = 1000 - leaveGold;
//             $(".gold-num").text(currentGold);
//             $(".gold-balance").text(leaveGold);
//             $('.progress').css('width', (currentGold / 1000)*100+'%');
//             $('.gold-explanation').show();
//         }
//         $(".gold-progress").show();
//     }

//     self.replaceLinkHref = function(){
//         $(".how-it-works-link").each(function(){
//             $(this).attr("href", howItWorksURL + $(this).attr("data-utm_content") + "&guid=" + guid());
//         });
//     }

//     self.showCashbackRate = function(){
//         $(".cashback-rate").html(cashbackMaxMinRate(self.merchantInfo.CBMinRate, self.merchantInfo.CBMaxRate));
//     }

//     self.showUserBalance = function(){    
//         chrome.extension.getBackgroundPage().user.info({}, function(response){
//             if ("balance" in response && parseInt(response.balance) > 0) {
//                 $(".user-balance").html(dollarFormat(response.balance));
//                 $(".current-gold").show();
//             }
//             self.showCashbackActivateButton();
//         }, function(){});
//     }

//     self.showCashbackActivateButton = function(){
//         chrome.tabs.sendMessage(self.tabId, {"action": "get-cache-or-cookie", "cookie": "cb_activate"}, function(response){
//             if ("YES" == response["cb_activate"]) {
//                 $(".cashback-active").css({"background":"#fdbb30","border":"1px solid yellow"}).addClass("buttonYellow").removeClass("cashback-active").html(L("CASHBACK_ACTIVE"));
//             }
//         });
//     }
// }

function countdowner() {
    chrome.extension.getBackgroundPage().activity.info()
    .then((response) => {
        $(".black-friday").show();
        let counter = response.blackFriday.countdown;
        if (counter <= 0) {
            $(".black-friday").hide();
            return ;
        }
        let handler = setInterval(function () {
            let time = countdownDevice(counter);
            let days = time.days;
            let hours = time.hours;
            let minutes = time.minutes;
            let seconds = time.seconds;
            if (parseInt(days) > 1) {
                $('.count-down .days').text(parseInt(days));
                $('.count-down .day-title').text(M('days'));
            } else {
                $('.count-down .days').text(parseInt(days));
                $('.count-down .day-title').text(M('day'));
            }
            $('.count-down .hours').text(hours);
            $('.count-down .min').text(minutes);
            $('.count-down .sec').text(seconds);
            counter --;
            if (counter <= 0) {
                $(".black-friday").hide();
                clearInterval(handler);
            }
        }, 1000);
    });
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
            "store-info"
        ]}, function (data){
            var cp = new CbPopup();
            cp.init(tabId, url, data);
            chrome.extension.getBackgroundPage().statistics.log({action: 'impr', param: 'chrismas_cb_popup', domain: data['domain'], root_domain: data['root-domain']});
            eventListener(tabId, data);
        });
    }
/*------------------------------ > ^_^ < -----------------------------*/

/*-------------------------- event listener --------------------------*/
    function eventListener(tabId, data){
        $(".close-btn").click(function (){
            ga('send', 'event', 'close', 'cb_close', '/cb/close/' + data["domain"], 1, {'nonInteraction': 1});
            chrome.extension.getBackgroundPage().service.closeClick(data["domain"], data["merchant-info"].ID, "CB");
            chrome.tabs.sendMessage(tabId, {action: 'Cookies-set', name: 'cb_closed', value: 'YES', options: {domain: data["root-domain"], expires: 60 * 15}});
            if ('YES' != ls.get('cb_close_tip_popped')) {
                chrome.tabs.sendMessage(tabId, {action: 'show-close-tips', panel: 'cb'});
            }
            ls.set('cb_close_tip_popped', 'YES');
            chrome.tabs.sendMessage(tabId, {"action": 'close-iframe', "iframe": ["__COUPERT_US_CB__", "__COUPERT_FIRST_VISIT_POPUP_US__"]});
        });

        $(".how-it-works-link").click(function(){
            if (!!$(this).attr("data-utm_content")) {
                window.open(howItWorksURL + $(this).attr("data-utm_content") + "&guid=" + guid(), '_blank');
            }
            return false;
        });

        $(".how-it-works-cashback").unbind('hover').hover(function(){
            var utm_content = $(this).find('.how-it-works-link').attr("data-utm_content");
            $(this).find('.how-it-works-hover, .how-it-works-hover-reward').show();
            chrome.extension.getBackgroundPage().statistics.log({action: 'impr', param: utm_content, domain: data['domain'], root_domain: data['root-domain']});
        }, function(){
            $(this).find('.how-it-works-hover, .how-it-works-hover-reward').hide();
        });

        $(".how-it-works-cashback .canclick").click(function () {
            $(this).parent().parent().find('.how-it-works-link').click();
        });

        $("#cb-trun-off").click(function(){
            $(this).hide();
            $("#cb-popup-disabled").show();
            ga('send', 'event', 'turnoff', 'cb_turnoff', '/cb/turnoff/' + data["domain"], 1, {'nonInteraction': 1});
            chrome.tabs.sendMessage(tabId, {"action": "set-cache-or-cookie", "cookie": {"name": "cb_turnoff","value": "YES","seconds": 24*60*60, "domain":data["root-domain"]}});
        });

        $(".cashback-active").click(function(){
            chrome.extension.getBackgroundPage().setServiceUsedCookie();
            var self = this;
            ga('send', 'event', 'click', 'cb_click', '/cb/click/' + data["domain"], 1, {'nonInteraction': 1});
            chrome.tabs.sendMessage(tabId, {"action": "set-affiliate-cookie", "domain": data["root-domain"], "relation": "self"});
            if ("YES" == data["store-info"].is_cashback) {
                chrome.tabs.sendMessage(tabId, {"action": "set-cashback-cookie", "domain":data["root-domain"]});
            }
            let trackingId = generateTrackingId('cb_click');
            chrome.extension.getBackgroundPage().openWindow(data["merchant-info"].url+"&tracking_id="+trackingId, false, data["root-domain"]);
            chrome.extension.getBackgroundPage().service.cbClick(data["domain"], data["merchant-info"].ID, "CB_POPUP", trackingId, data["merchant-info"].LeastOrderAmount, data["merchant-info"].CashBackPercentage, "0", getCache("user_email")); // cb-click log
            chrome.extension.getBackgroundPage().user.info({}, function(response){
                $(self).css({"background":"#fdbb30","border":"1px solid yellow"}).addClass("buttonYellow").removeClass("cashback-active").html(L("CASHBACK_ACTIVE"));
                
                if ("balance" in response && parseInt(response.balance) > 0) {
                    $(".user-balance").html(dollarFormat(response.balance));
                    $(".current-gold").show();
                }
                chrome.tabs.sendMessage(tabId, {"action":"set-inject-cb-button-actived"});
                chrome.tabs.sendMessage(tabId, {"action": "reloading-store-popup-page", "auto":"YES", "replace": "YES"});
                setTimeout(() => {
                    chrome.tabs.sendMessage(tabId, {"action": 'close-iframe', "iframe": ["__COUPERT_US_CB__", "__COUPERT_FIRST_POPUP_US__"]});
                }, 3000);
            }, function(){
                chrome.tabs.sendMessage(tabId, {"action": 'close-iframe', "iframe": ["__COUPERT_US__", "__COUPERT_FIRST_POPUP_US__"]});
                chrome.tabs.sendMessage(tabId, {"action": "set-cache-or-cookie", "cookie": {"name": "cb_click_at_popup_page", "value": "YES", "seconds": 20}});
                chrome.tabs.sendMessage(tabId, {"action": "reloading-store-popup-page"});
            });
        });

        $(".join-tips-words").click(function(){
            ga('send', 'event', 'statistics', 'ambassador', '/statistics/ambassador/cb/' + data["domain"], 1, {'nonInteraction': 1});
            window.open(ambassadorProgramURL + "cb-popup", "_blank");
        });

        $('.cbchrismas-wraper').click(function() {
            chrome.extension.getBackgroundPage().statistics.log({action: 'click', param: 'chrismas_cb_popup', domain: data['domain'], root_domain: data['root-domain']});
            window.open(CHRISTMAS + "cb_popup_banner" + "&guid=" + guid(), '_blank');
        });
    }
/*------------------------------ > ^_^ < -----------------------------*/

    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse){
        switch(message.action) {
            case "render-cb-activated":
                renderCbActivated(message);
                break;
        }
    });

    function renderCbActivated(){
        $(".cashback-active").css({"background":"#fdbb30","border":"1px solid yellow"}).addClass("buttonYellow").removeClass("cashback-active").html(L("CASHBACK_ACTIVE"));
    }

    $(".gold-progress .gold-detail span b").hover(function () {
        $(".gold-tips").show();
    },function () {
        $(".gold-tips").hide();
    });

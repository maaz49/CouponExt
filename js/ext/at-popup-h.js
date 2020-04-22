
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
        chrome.extension.getBackgroundPage().service.atImpr(self.domain, url); // at-popup log
        let storeInfo = data['store-info'] || {};
        let subdomain = getDomainFromURL(url);
        let domain = getRootDomain(subdomain);
        let cr = parseFloat(data["merchant-info"].CashBackPercentage);
        ga('send', 'event', 'impression', 'at_imitate_impr', '/at/imitate/impr/' + data["domain"], 1, {'nonInteraction': 1});
        chrome.tabs.sendMessage(tabId, {action: "get-cart-total", cart_total_price_selector:data['store-info']["cart_total_price_selector"]}, function (response) {
            var price = response.price;
            $('#cart-total').html(price);

            let key = (domain+':best:price').replace(/\./g, '_');
            var bestPrice = Cookies.get(key);
            if (!!bestPrice) {
                $('#with-coupert').html(bestPrice);
            }

            var couponCount = (data["coupons"] || []).length;
            couponCount = couponCount > 10 ? 10 : couponCount;
            $('#codes-num').html(couponCount);

            if ("YES" != storeInfo.is_login) return ;
            var priceNum = parseFloat(price.replace(/[^0-9\.]/g, ''));
            var canEarnMaxGold = parseInt(priceNum * cr * 100);
            $('#max-earn-gold > b').html(canEarnMaxGold);
            var leaveGold = 0;
            var currentGold = 0;
            if (!!storeInfo.withdraw && storeInfo.withdraw == 1) {
                leaveGold = 0;
                var withdrawMoney = storeInfo.withdraw_money;
                currentGold = parseInt(storeInfo.gold || 0);
                $('.gold-redeem').show();
                // $('.gold-redeem-num').text(dollarFormat(withdrawMoney, 'withdraw-money'));
                // $('.gold-redeem-gold').text(parseInt(withdrawMoney*100));
            } else {
                leaveGold = parseInt(storeInfo.gold_to_withdraw || 0);
                currentGold = 1000 - leaveGold;
            }
            $(".gold-num").text(currentGold);
            $('.progress').css('width', (currentGold / 1000)*100+'%');
            $('.max-progress').css('width', ((currentGold + canEarnMaxGold) / 1000)*100+'%');
            $('.glod-cashback-progress').show();
        });
        eventListener(tabId, data);
    });
}

function eventListener(tabId, data){
    $(".close-btn").click(function (){
        ga('send', 'event', 'close', 'at_imitate_close', '/at/imitate/close/' + data["domain"], 1, {'nonInteraction': 1});
        chrome.extension.getBackgroundPage().service.closeClick(data["domain"], data["merchant-info"].ID, "AT");
        chrome.tabs.sendMessage(tabId, {"action": "close-iframe", "iframe":["__COUPERT_US_WITH_H__"]});
    });

    $(".button").click(function(){
        ga('send', 'event', 'click', 'at_imitate_click', '/at/imitate/click/' + data["domain"], 1, {'nonInteraction': 1});
        chrome.tabs.sendMessage(tabId, {"action": "set-affiliate-cookie", "domain": data["root-domain"], "relation": "self"});
        if ("YES" == data["store-info"].is_cashback) {
            chrome.tabs.sendMessage(tabId, {"action": "set-cashback-cookie", "domain":data["root-domain"]});
        }
        ls.set("batch-number", batchNumber());
        Storages.localStorage.set('welcome_disabled', 'YES');
        let trackingId = generateTrackingId('impr_at_click');
        chrome.extension.getBackgroundPage().openWindow(data["merchant-info"].url+"&tracking_id="+trackingId, false, data["root-domain"]);
        chrome.extension.getBackgroundPage().service.atClick(data["merchant-info"].ID, "AT_IMITATE_POPUP", trackingId, getCache("user_email")); // at-click log
        chrome.tabs.sendMessage(tabId, {"action": "reloading-store-popup-page", "hide":"YES"});
        chrome.tabs.sendMessage(tabId, {"action": "show-at-testing-page"});
        chrome.tabs.sendMessage(tabId, {"action": "close-iframe", "iframe":["__COUPERT_US_WITH_H__"]});
    });

    $('.mini-btn').click(function () {
        chrome.extension.getBackgroundPage().statistics.log({action: 'click', param: 'at-pop-up-minimize', domain: data['domain'], root_domain: data['root-domain']});
        chrome.tabs.sendMessage(tabId, {action: 'Cookies-set', name: 'popup_size', value: 'small', options: {domain: data["root-domain"]}});
        chrome.tabs.sendMessage(tabId, {action: "at-popup-minimize"});
        chrome.tabs.sendMessage(tabId, {"action": "close-iframe", "iframe":["__COUPERT_US_WITH_H__"]});
    });

    $(".gold-detail span b").hover(function () {
        $(this).find(".gold-tips").show();
    },function () {
        $(this).find(".gold-tips").hide();
    });
}
/*------------------------------ > ^_^ < -----------------------------*/

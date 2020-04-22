
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
            chrome.extension.getBackgroundPage().service.atImpr(data["domain"], url); // at-popup log
            chrome.extension.getBackgroundPage().statistics.log({action: 'impr', param: 'at_popup_bind_element', domain: data["domain"], root_domain: data["root-domain"]});
            ga('send', 'event', 'impression', 'at_inject_impr', '/at/inject/impr/' + data["domain"], 1, {'nonInteraction': 1});
            renderPage(tabId, data);
            eventListener(tabId, data);
        });
    }

    function renderPage(tabId, data) {
        let coupons = data["coupons"];
        $('#codes-num').text(coupons.length);
    }

    function eventListener(tabId, data){
        $("#close").click(function (){
            ga('send', 'event', 'close', 'at_inject_close', '/at/inject/close/' + data["domain"], 1, {'nonInteraction': 1});
            chrome.extension.getBackgroundPage().service.closeClick(data["domain"], data["merchant-info"].ID, "AT");
            chrome.tabs.sendMessage(tabId, {"action": "close-iframe", "iframe":["__COUPERT_US_AT_OTHER__"]});
        });

        $("#apply-coupons").click(function(){
            chrome.extension.getBackgroundPage().statistics.log({action: 'click', param: 'at_popup_bind_element', domain: data["domain"], root_domain: data["root-domain"]});
            ga('send', 'event', 'click', 'at_inject_click', '/at/inject/click/' + data["domain"], 1, {'nonInteraction': 1});
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
            chrome.tabs.sendMessage(tabId, {"action": "close-iframe", "iframe":["__COUPERT_US_AT_OTHER__"]});
        });
    }
/*------------------------------ > ^_^ < -----------------------------*/

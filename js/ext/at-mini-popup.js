
chrome.tabs.getCurrent(function(tab) {
    execute(tab.id, tab.url);
});

function execute(tabId, url){
    chrome.tabs.sendMessage(tabId, {"action": "get-cache-or-cookie", "session-cache": [
        "domain",
        "root-domain",
        "store-info",
        "merchant-info"
    ]}, function (data){
        ga('send', 'event', 'impression', 'at_mini_impr', '/at/mini/impr/' + data['domain'], 1, {'nonInteraction': 1});
        chrome.extension.getBackgroundPage().statistics.log({action: 'impr', param: 'at_minimize_impr', domain: data['domain'], root_domain: data['root-domain']});
        eventListener(tabId, data);
    });
}

function eventListener(tabId, data, panel){
    $(".close-btn").click(function (){
        ga('send', 'event', 'close', 'at_mini_close', '/at/mini/close/' + data['domain'], 1, {'nonInteraction': 1});
        chrome.extension.getBackgroundPage().statistics.log({action: 'close', param: 'at_minimize_close', domain: data['domain'], root_domain: data['root-domain']});
        chrome.tabs.sendMessage(tabId, {"action": "close-iframe", "iframe":["__COUPERT_US_AT_MINI__"]});
    });

    $(".apply-code").click(function(){
        ga('send', 'event', 'click', 'at_mini_click', '/at/mini/click/' + data['domain'], 1, {'nonInteraction': 1});
        chrome.extension.getBackgroundPage().statistics.log({action: 'click', param: 'at_minimize_apply_coupons', domain: data['domain'], root_domain: data['root-domain']});
        chrome.tabs.sendMessage(tabId, {action: 'set-affiliate-cookie', domain: data['root-domain'], relation: 'self'});
        if ('YES' == data['store-info'].is_cashback) {
            chrome.tabs.sendMessage(tabId, {action: 'set-cashback-cookie', domain: data['root-domain']});
        }
        ls.set('batch-number', batchNumber());
        Storages.localStorage.set('welcome_disabled', 'YES');
        let trackingId = generateTrackingId('at_mini_click');
        chrome.extension.getBackgroundPage().openWindow(data["merchant-info"].url+'&tracking_id='+trackingId, false, data["root-domain"]);
        chrome.extension.getBackgroundPage().service.atClick(data["merchant-info"].ID, 'AT_MINIMIZE_APPLY_CODES', trackingId, Storages.localStorage.get('user_email')); // at-click log
        chrome.tabs.sendMessage(tabId, {"action": "reloading-store-popup-page", "hide":"YES"});
        chrome.tabs.sendMessage(tabId, {"action": "show-at-testing-page"});
        chrome.tabs.sendMessage(tabId, {"action": "close-iframe", "iframe":["__COUPERT_US_AT_MINI__"]});
    });
}


chrome.tabs.getCurrent(function(tab) {
    execute(tab.id);
});

function execute(tabId){
    chrome.tabs.sendMessage(tabId, {"action": "get-cache-or-cookie", "session-cache": [
        "domain",
        "root-domain",
        "merchant-info",
        "store-info"
    ]}, function (data){
        ga('send', 'event', 'impression', 'guide', '/guide/impr/' + data["domain"], 1, {'nonInteraction': 1});
        eventListener(tabId, data);
        ls.set("guidance_popped", "YES");
    });
}

function eventListener(tabId, data){
    $(".close-btn").click(function (){
        ga('send', 'event', 'close', 'guide', '/guide/close/' + data["domain"], 1, {'nonInteraction': 1});
        chrome.tabs.sendMessage(tabId, {"action": "close-iframe", "iframe":["__COUPERT_US_GUIDANCE_POPUP__"]});
    });

    $(".guidance-got-it").click(function (){
        ga('send', 'event', 'click', 'guide', '/guide/click/got-it/' + data["domain"], 1, {'nonInteraction': 1});
        ga('send', 'event', 'click', 'guidance_got_it_click', '/guidance/got_it/click/' + data["domain"], 1, {'nonInteraction': 1});
        chrome.tabs.sendMessage(tabId, {"action": "close-iframe", "iframe":["__COUPERT_US_GUIDANCE_POPUP__"]});
    });
}

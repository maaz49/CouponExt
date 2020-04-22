
chrome.tabs.getCurrent(function(tab) {
    execute(tab.id);
});

function execute(tabId){
    chrome.tabs.sendMessage(tabId, {"action": "get-cache-or-cookie", "session-cache": [
        "domain",
        "root-domain",
    ]}, function (data){
        var panel = getQueryString('panel');
        switch (panel) {
            case 'at':
                $('.at_close_tips').show();
                chrome.extension.getBackgroundPage().statistics.log({action: 'impr', param: 'at-close-tip', domain: data['domain'], root_domain: data['root-domain']});
                break;
            case 'cb':
                chrome.extension.getBackgroundPage().statistics.log({action: 'impr', param: 'cb-close-tip', domain: data['domain'], root_domain: data['root-domain']});
                $('.cb_close_tips').show();
                break;
            default :
                break;
        }
        eventListener(tabId, data, panel);
    });
}

function eventListener(tabId, data, panel){
    $(".close-btn").click(function (){
        switch (panel) {
            case 'at':
                chrome.extension.getBackgroundPage().statistics.log({action: 'close', param: 'at-close-tip', domain: data['domain'], root_domain: data['root-domain']});
                break;
            case 'cb':
                chrome.extension.getBackgroundPage().statistics.log({action: 'close', param: 'cb-close-tip', domain: data['domain'], root_domain: data['root-domain']});
                break;
            default :
                break;
        }
        chrome.tabs.sendMessage(tabId, {"action": "close-iframe", "iframe":["__COUPERT_US_CLOSE_TIPS__"]});
    });
}

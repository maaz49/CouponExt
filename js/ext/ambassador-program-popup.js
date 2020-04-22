/**
 * data: 2019-3-12
 * author: jerry
 * content: class <AmbassadorProgramPopup>
 */

var AmbassadorProgramPopup = function(){
    var self = this;
    self.tabId = null;

    self.init = function(tabId, data){
        self.tabId = tabId;

        self.show();
        self.replaceLinkHref();
        ga('send', 'event', 'impression', 'ambassador', '/ambassador/impr/' + data["domain"], 1, {'nonInteraction': 1});
    }

    self.show = function(){
        self.showPopupAnimate();
    }

    self.replaceLinkHref = function(){
        $(".more-detail").attr("href", ambassadorProgramURL + "ambassador-program-popup");
    }

    self.showPopupAnimate = function(){
        $(".ambassador-wrapper").addClass("showanimate");
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
        ]
    }, function (data){
        var app = new AmbassadorProgramPopup();
        app.init(tabId, data);
        eventListener(tabId, data);
    });
}

function eventListener(tabId, data){
    $(".close").click(function(){
        ga('send', 'event', 'close', 'ambassador', '/ambassador/close/' + data["domain"], 1, {'nonInteraction': 1});
        chrome.tabs.sendMessage(tabId, {"action": "close-iframe", "iframe":["__COUPERT_US_AMBASSADOR_PROGRAM__"]});
    });

    $(".ambassador-wrapper").click(function(){
        ga('send', 'event', 'click', 'ambassador', '/ambassador/click/' + data["domain"], 1, {'nonInteraction': 1});
        window.open(ambassadorProgramURL + "ambassador-program-popup", '_blank');
        return false;
    });
}

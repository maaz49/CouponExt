
var ReferFriend = function(){
    var self = this;

    self.init = function(tabId, data){
        self.show();
        ga('send', 'event', 'impression', 'referral', '/referral/impr/' + data["domain"], 1, {'nonInteraction': 1});
    }

    self.show = function(){
        self.showReferInfo();
    }

    self.showReferInfo = () => {
        chrome.extension.getBackgroundPage().user.info({}, function(response){
            var ref = response.Ref;
            var referral = REFER_FRIEND_URL + ref;
            $("#refer-friend-link").attr("data-clipboard-text", referral);
            $("#refer-friend-link").find("input").attr("placeholder", referral);
            $("#refer-friend-link").find("input").val(referral);
            $("#refer-friend-link").show();
            self.replaceLinkHref(ref);
            $(".refer-friend-box").show();
        }, function(){
            self.replaceLinkHref();
            $(".refer-friend-box").show();
        });
    }

    self.replaceLinkHref = function(ref = ""){
        $("#share-module > li.messages > a").attr("href", messagesShareURL.replace(/\{REF\}/g, ref));
        $("#share-module > li.facebook > a").attr("href", facebookShareURL.replace(/\{REF\}/g, ref));
        $("#share-module > li.twitter > a").attr("href", twitterShareURL.replace(/\{REF\}/g, ref));
    }
}

chrome.tabs.getCurrent(function(tab) {
    execute(tab.id);
});

function execute(tabId){
    chrome.tabs.sendMessage(tabId, {"action": "get-cache-or-cookie", 
        "session-cache": [
            "domain",
            "root-domain"
        ]
    }, function (data){
        var referFriend = new ReferFriend();
        referFriend.init(tabId, data);
        eventListener(tabId, data); 
    });
}

function eventListener(tabId, data){
    $(".close-btn").click(function(){
        ga('send', 'event', 'close', 'referral', '/referral/close/' + data["domain"], 1, {'nonInteraction': 1});
        chrome.extension.getBackgroundPage().setReferFriendClickedCookie();
        chrome.tabs.sendMessage(tabId, {"action": 'close-iframe', "iframe": ["__COUPERT_US_REFER_FRIEND__"]});
    });

    $("#turn-off").click(function(){
        ga('send', 'event', 'turnoff', 'referral', '/referral/turnoff/' + data["domain"], 1, {'nonInteraction': 1});
        chrome.extension.getBackgroundPage().setReferFriendTurnOffCookie();
        $(this).hide();
        $("#disabled").show();
    });

    $("#refer-friend-link").click(function(){
        chrome.extension.getBackgroundPage().setReferFriendClickedCookie();
        var self = this;
        ga('send', 'event', 'click', 'referral', '/referral/click/unique-link/' + data["domain"], 1, {'nonInteraction': 1});
        var clipboard = new Clipboard("#refer-friend-link");
        clipboard.on('success', function(e) {
        });
        clipboard.on('error', function(e) {
        });
        $(self).find(".copied").show();
        delay(2000).then(function(){
            $(self).find(".copied").hide();
        });
    });

    $("#share-module li > a").click(function(){
        chrome.extension.getBackgroundPage().setReferFriendClickedCookie();
        if (!!$(this).attr("ga-track")) {
            ga('send', 'event', 'click', 'referral', $(this).attr("ga-track") + data["domain"], 1, {'nonInteraction': 1});
        }
    });

    $("#how-it-works").click(function(){
        ga('send', 'event', 'click', 'referral', '/referral/click/how-it-works/' + data["domain"], 1, {'nonInteraction': 1});
        window.open(ambassadorProgramURL + "refer-friend-popup", "_blank");
        return false;
    });
}

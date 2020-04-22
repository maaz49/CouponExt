function openWindow(url, active=true, rootDomain) {
    var options = {
        url:url,
        active:active,
    }
    if (!active) {
        options["pinned"] = true;
    }
    chrome.tabs.create(options, function(tab){
        if (active) {
            return ;
        }
        tab["rootDomain"] = rootDomain;
        tabListCreatedBySelf.put(tab.id, tab);
        delay(30000).then(function(){           
            var tabInfo =tabListCreatedBySelf.get(tab.id);
            if (tabInfo && Object.keys(tabInfo).length != 0) {
                if (!chrome.runtime.lastError) {
                    chrome.tabs.remove(tab.id);
                }
            }
        });
    });
}

function overrideCookie(rootDomain, value, init = false){
    if (!init) {
        if ("NO" === value) {
            Cookies.set("OVERRIDE-COOKIE:" + rootDomain + ":override", "NO", {expires:60*60*2});
        } else if ("YES" === value) {
            if ("NO" === Cookies.get("OVERRIDE-COOKIE:" + rootDomain + ":override")) {
                Cookies.set("OVERRIDE-COOKIE:" + rootDomain + ":override", "YES", {expires:60*60*2});
            }     
        }
    } else {
        Cookies.set("OVERRIDE-COOKIE:" + rootDomain + ":override", value, {expires:60*60*2});
    }
    return Cookies.get("OVERRIDE-COOKIE:" + rootDomain + ":override");
}

function setServiceUsedCookie(){
    Cookies.set("service_used", "YES");
}

function setReferFriendClickedCookie(){
    Cookies.set("refer_friend_clicked", "YES");
}

function setReferFriendTurnOffCookie(){
    Cookies.set("refer_friend_turn_off", "YES", {expires:24*60*60*2});
}
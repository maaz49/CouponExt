
chrome.tabs.getCurrent(function(tab) {
    execute(tab.id);
});

function execute(tabId){
    chrome.tabs.sendMessage(tabId, {"action": "get-cache-or-cookie", "session-cache": [
        "domain",
        "root-domain",
    ]}, function (data){
        autoFillUserEmial();
        replacePlaceholderTextByLanguage();
        eventListener(tabId, data);
    });
}

function autoFillUserEmial(){
    $("#user-email").val(getCache("user_email"));
}

function replacePlaceholderTextByLanguage(){
    $("#review").attr("placeholder", L("FEEDBACK"));
    $("#user-email").attr("placeholder", L("FEEDBACK_EMAIL"));
}

function eventListener(tabId, data){
    $("#at-test-review-submit").click(function(){
        var review = $.trim($("#review").val());
        var email = $.trim($("#user-email").val());
        if (!review || !email || $("#at-test-review-submit.active").length <= 0) {
            return ;
        }
        var info = {
            "review": review,
            "user_email": email,
            "user_name": "coupert",
            "domain": data["domain"]
        };
        chrome.extension.getBackgroundPage().home.feedback(info, function(){
            $(".submit-success").show();
        });
    });

    $(".close-btn").click(function(){
        chrome.tabs.sendMessage(tabId, {"action": 'close-iframe', "iframe": ["__COUPERT_US_FEEDBACK__"]});
    });

    $('#user-email, #review').bind('input propertychange', function(){
        var email = $("#user-email").val();
        var reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
        if(!reg.test(email) || 0 == $.trim($("#review").val()).length){
            $("#at-test-review-submit").removeClass("active");
        } else {
            $("#at-test-review-submit").addClass("active");
        }
    });
}

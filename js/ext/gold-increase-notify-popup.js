

var GoldIncrease = function(){
    var self = this;
    self.tabId = null;
    self.storeInfo = null;
    self.merchantInfo = null;
    self.goldIncreaseNumber = 0;
    self.goldIncreased = "NO";
    self.withdraw = "NO";

    self.init = function(tabId, data){
        self.tabId = tabId;
        self.storeInfo = data["store-info"];
        self.merchantInfo = data["merchant-info"];
        self.goldIncreaseNumber = data["gold-increase-number"];
        self.goldIncreased = data["gold-increased"];
        self.withdraw = data["withdraw"];
        self.withdrawMoney = data["withdraw-money"];

        self.show();
        self.replaceLinkHref();
        ga('send', 'event', 'impression', 'cb_gold_increase_impr', '/cb/gold/increase/impr/' + data["domain"], 1, {'nonInteraction': 1});
    }

    self.replaceLinkHref = function(){
        
    }

    self.show = function(){
        self.analyzeWhetherGoldIncrease();
    }

    self.analyzeWhetherGoldIncrease = function(){
        if ("YES" == self.goldIncreased && self.goldIncreaseNumber > 0) {
            self.renderGoldInfo();
            self.analyzeWhetherWithdraw();
            self.showUserBalance();
        }
    }

    self.renderGoldInfo = function(){
        $(".gold-increase-number").html(self.goldIncreaseNumber);
        $(".gold-increase-number-dollar").html(dollarFormat(self.goldIncreaseNumber, "increase-gold"));
    }

    self.showUserBalance = function(){
        chrome.extension.getBackgroundPage().user.info({}, function(response){
            setCache("user_email", response.email);
            if ("balance" in response && parseInt(response.balance) > 0) {
                ls.set("user_balances", response.balance);
                $(".user-balance").html(dollarFormat(response.balance, "increase-gold"));
            }
        });
    }

    self.analyzeWhetherWithdraw = function(){
        if ("YES" == self.withdraw) {
            self.showIncreaseTipsMoudleWhenWithdrawEnable();
        } else {
            self.showIncreaseTipsMoudleWhenWithdrawDisabled();
        }
    }

    self.showIncreaseTipsMoudleWhenWithdrawDisabled = function(){
        $(".only-increase").show();
        $(".increase-and-withdraw").hide();
    }

    self.showIncreaseTipsMoudleWhenWithdrawEnable = function(){
        $(".withdraw-num").html(dollarFormat(self.withdrawMoney, "withdraw-money"));
        // var numberSplit = self.withdrawMoney.split(".");
        // $(".withdraw-money-int").html(numberSplit[0]);
        // $(".withdraw-money-decimal").html(numberSplit[1]);
        // $(".only-increase").hide();
        $(".increase-and-withdraw").show();
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
            "gold-increase-number",
            "gold-increased",
            "withdraw",
            "withdraw-money",
        ]
    }, function (data){
        var gi = new GoldIncrease();
        gi.init(tabId, data);
        eventListener(tabId, data);
    });
}

function eventListener(tabId, data){
    $(".close-btn").click(function (){
        ga('send', 'event', 'close', 'cb_gold_increase_close', '/cb/gold/increase/close/' + data["domain"], 1, {'nonInteraction': 1});
        chrome.tabs.sendMessage(tabId, {"action": "close-iframe", "iframe":["__COUPERT_US_INCREASE_NOTIFY__"]});
    });

    $(".increase-and-withdraw").click(function(){
        setCache("user_gold", data["store-info"].gold);
        ga('send', 'event', 'click', 'cb_gold_increase_click', '/cb/gold/increase/click/withdraw/' + data["domain"], 1, {'nonInteraction': 1});
        window.open(baseURL + "/secure/gold", "_blank");
    });

    $(".get-more").click(function () {
        ga('send', 'event', 'click', 'cb_gold_increase_click', '/cb/gold/increase/click/ambassador-program/' + data["domain"], 1, {'nonInteraction': 1});
        window.open(ambassadorProgramURL + "gold-increase-notify-popup", "_blank");
        return false;
    });

    $(".what-coupert").click(function(){
        setCache("user_gold", data["store-info"].gold);
        ga('send', 'event', 'click', 'cb_gold_increase_click', '/cb/gold/increase/click/what-is-coupert-gold/' + data["domain"], 1, {'nonInteraction': 1});
        window.open(howItWorksURL + "gold-increase-notify-popup" + "&guid=" + guid(), '_blank');
    });

    $(".got-it").click(function(){
        setCache("user_gold", data["store-info"].gold);
        ga('send', 'event', 'click', 'cb_gold_increase_click', '/cb/gold/increase/click/got-it/' + data["domain"], 1, {'nonInteraction': 1});
        chrome.tabs.sendMessage(tabId, {"action": "close-iframe", "iframe":["__COUPERT_US__"]});
    });

    $("#redeem-it").click(function(){
        setCache("user_gold", data["store-info"].gold);
        ga('send', 'event', 'click', 'cb_gold_increase_click', '/cb/gold/increase/click/redeem-it/' + data["domain"], 1, {'nonInteraction': 1});
        window.open(baseURL + "/secure/gold", "_blank");
    });
}


var AtTesting = function(){
    var self = this;
    self.domain = null;                 
    self.allCodeList = null;
    self.codes = null;                  
    self.index = 1;                     
    self.total = 0;                     
    self.testedCode = [];               
    self.validCodeList = [];
    self.merchantRules = null;          // all rules from api
    self.matchedRule = null;            
    self.testingType = "";              
    self.runtimes = 0;                 
    self.sendCodeLoopHandler = null;    
    self.code = "COUPERTCOUPON";        
    self.tabId = 0;
    self.bestCode = "";                 
    self.preferential = 0;
    self.url = "";                      // url of current web page
    self.refreshTestingCodeIndex = 0;
    self.refreshValidCodeList = [];
    self.validCodes = [];
    self.maxTimeout = 100;

    // initialization
    self.init = function(tabId, url, data){
        self.tabId = tabId;
        self.url = url;
        self.domain = data["domain"];
        self.allCodeList = data["coupons"];
        self.merchantInfo = data["merchant-info"];
        self.codes = data["next-test-code-list"];
        self.merchantRules = data["merchant-rules"];
        self.refreshValidCodeList = data["refresh-valid-code-list"];
        self.validCodes = data["valid-codes"];
        self.matchedRule = data["store-info"]["matched_rule"];
        self.processDataBeforeTesting(data);
        self.goToTesting();
        ga('send', 'event', 'impression', 'test_impr', '/at/test/impr/' + self.domain, 1, {'nonInteraction': 1});
    }

    self.processDataBeforeTesting = function(data){
        self.analyzeTestingType();
        self.analyzeCodeListNeedToTest(data);
    }

    self.analyzeCodeListNeedToTest = function(data){
        if (!self.codes || 0 == self.codes.length) {
            self.codes = self.allCodeList.slice(0, 10);
        }
        self.total = self.codes.length;
        var index = parseInt(data["refresh-testing-code-index"]);
        self.refreshTestingCodeIndex = (!!index && index <= 11 && index <= self.total + 1) ? index : 1;
    }

    self.processDataAfterTesting = function(){
        var nextTestCodeList = [];
        var validCodeIdList = [];
        var validCodeList = self.validCodeList;
        if (validCodeList.length <= 0) {
            validCodeList = self.validCodes;
        }
        if ("REFRESH" == self.testingType && !!self.refreshValidCodeList) {
            validCodeList = self.refreshValidCodeList;
        }
        if (validCodeList.length > 0) {
            validCodeList.sort(function(a, b){
                return b.saving - a.saving;
            });
            chrome.tabs.sendMessage(self.tabId, {"action": "set-cache-or-cookie", "session-cache": {"valid-codes": validCodeList}});
            nextTestCodeList = nextTestCodeList.concat(validCodeList.splice(0, 1));
            validCodeIdList = nextTestCodeList.map(function(item){return item.ID;});
        }
        var testedCodeIdList = getCache(self.tabId + ":testedCodeIdList");
        if (!!testedCodeIdList) {
            testedCodeIdList = JSON.parse(testedCodeIdList);                                        
        }
        if (nextTestCodeList.length < 10) {
            for (var index = 0; index < self.allCodeList.length; index ++){
                var item = self.allCodeList[index];
                if (-1 == testedCodeIdList.indexOf(item.ID) && -1 == validCodeIdList.indexOf(item.ID)) {
                    nextTestCodeList.push(item);
                    if (nextTestCodeList.length >= 10) {
                        break;
                    }
                }
            };
        } else {
            nextTestCodeList = nextTestCodeList.splice(0, 10);
        }
        chrome.tabs.sendMessage(self.tabId, {"action": "set-cache-or-cookie", "session-cache": {"next-test-code-list": nextTestCodeList}});
    }

    // analyze rule test type
    self.analyzeTestingType = function(){
        if (!!self.matchedRule) {
            if ("YES" == self.matchedRule.is_refresh || "YES" == self.matchedRule.is_mix) {
                self.testingType = "REFRESH";
            } else {
                self.testingType = "UNREFRESH";
            }
        }
    }

    self.goToTesting = function(){
        chrome.tabs.sendMessage(self.tabId, {"action": "set-cache-or-cookie", "cookie": {"name": "at_testing", "value": "YES", "seconds": 200}});
        self.index = 1;
        if ("REFRESH" == self.testingType) {
            self.index = self.refreshTestingCodeIndex;
            chrome.tabs.sendMessage(self.tabId, {"action": "set-cache-or-cookie", "cookie": {"name": "refresh_at_flag", "value": "YES", "seconds": 200}});
            self.refreshTesting();
        } else {
            self.startTesting();
        }
    }

    self.refreshTesting = function(){
        self.startTesting();
    }

    // keep sending testing-code to content script -- main loop
    self.startTesting = function(){
        self.sendCodeLoopHandler = setInterval(function(){
            self.runtimes ++;
            if (self.runtimes >= self.maxTimeout) {
                clearInterval(self.sendCodeLoopHandler); // when time out, stop main loop
                self.autoTestWhenTimeout();
            } else {
                self.autoTest();
            }
        }, 200);
    }

    // animation of progress bar
    self.animationProgressBar = function(){
        var rate = (parseInt(self.index) / parseInt(self.total)) * 100;
        $(".testing-in-process").css("width",rate.toString() + "%");
    }

    // when testing time out
    self.autoTestWhenTimeout = function(){
        if ("YES" === self.matchedRule.is_ajax) {
            chrome.extension.getBackgroundPage().service.serviceError(self.domain, self.url, "RULE-EXCUTE-ERROR", "ajax-request-timeout", "Timeout");
        }
        $("#current-code").html('COUPERTCOUPON');
        chrome.tabs.sendMessage(self.tabId, {"action": "remove-cookie", "name": ["at_testing", "refresh_at_flag"]});  // clear at flag
        var simulationIntervalId = setInterval(function(){
            self.animationProgressBar();
            if(parseInt(self.index) > parseInt(self.total)){
                clearInterval(simulationIntervalId);
                self.codeTestFinished();    // time out also is a flag of success, still send message to content script
            }
            self.index ++;
        }, 1000);
    }

    // normal testing
    self.autoTest = function(){
        if (parseInt(self.index) <= parseInt(self.total)) {
            self.codeTesting();
        } else {
            clearInterval(self.sendCodeLoopHandler);
            self.codeTestFinished();
        }
    }

    // tesing...
    self.codeTesting = function(){
        self.animationProgressBar();
        var code = self.codes[self.index - 1];
        self.showCodeToPage();
        // per testing, only one code can send to content script
        if (!!code.Code && !!code.ID && !self.testedCode.contains(code.ID)) {
            self.code = code;
            self.testedCode.push(code.ID);
            var testedCodeIdList = getCache(self.tabId + ":testedCodeIdList");
            if (!!testedCodeIdList) {
                testedCodeIdList = JSON.parse(testedCodeIdList);
                if (-1 == testedCodeIdList.indexOf(code.ID)) {
                    testedCodeIdList.push(code.ID);
                    setCache(self.tabId + ":testedCodeIdList", JSON.stringify(testedCodeIdList));
                }
                if (testedCodeIdList.length >= self.allCodeList.length) {
                    chrome.tabs.sendMessage(self.tabId, {"action": "set-cache-or-cookie", "cookie": {"name": "try_other_codes", "value": "disabled", "seconds": 3500}});
                    removeCache(self.tabId + ":testedCodeIdList");
                }
            } else {
                var testedCodeIdList = [];
                testedCodeIdList.push(code.ID);
                setCache(self.tabId + ":testedCodeIdList", JSON.stringify(testedCodeIdList));
            }
            self.sendTestingCode();
        }
    }

    // testing finished
    self.codeTestFinished = function(){
        self.processDataAfterTesting();
        chrome.tabs.sendMessage(self.tabId, {"action": "remove-cookie", "name": ["at_testing", "refresh_at_flag"]}); // clear at flag
        if ("REFRESH" == self.testingType) {
            chrome.tabs.sendMessage(self.tabId, {"action": "get-last-result", "rule": self.matchedRule, "domain": self.domain}, function(){
                chrome.tabs.sendMessage(self.tabId, {"action": "get-cache-or-cookie", "session-cache": "best-code"}, function(data){
                    if (!!data["best-code"] && Object.keys(data["best-code"]).length != 0) {
                        chrome.tabs.sendMessage(self.tabId, {"action": "set-cache-or-cookie", "cookie": {"name": "refresh_at_success_first_popup", "value": "YES", "seconds": 20}});
                        chrome.tabs.sendMessage(self.tabId, {"action": "set-cache-or-cookie", "cookie": {"name": "refresh_at_success_flag", "value": "YES", "seconds": 20}});
                        chrome.tabs.sendMessage(self.tabId, {"action": "apply-best-code", "best_code": data["best-code"], "rule": self.matchedRule, "domain": self.domain});
                        chrome.tabs.sendMessage(self.tabId, {"action": "show-at-success-result-page"});
                    } else {
                        chrome.tabs.sendMessage(self.tabId, {"action": "show-at-error-result-page"});
                    }
                });
            });
        } else {
            if (!self.bestCode) {
                chrome.tabs.sendMessage(self.tabId, {"action": "show-at-error-result-page"});
            } else {
                chrome.tabs.sendMessage(self.tabId, {"action": "set-cache-or-cookie", "session-cache": {"best-code": self.bestCode}}, function(response){
                    if ("success" == response.status) {
                        var domain = self.domain;
                        let key = (domain+':best:price').replace(/\./g, '_');
                        Cookies.set(key, $.trim(self.bestCode.now_price));
                        chrome.tabs.sendMessage(self.tabId, {"action": "apply-best-code", "best_code": self.bestCode, "rule": self.matchedRule, "domain": self.domain});
                        chrome.tabs.sendMessage(self.tabId, {"action": "show-at-success-result-page"});
                    }
                });
            }
        }
    }

    // show testing code on page
    self.showCodeToPage = function(){
        if (self.code.IsShow == 'YES') {
            $("#current-code").html(self.code.Code);
        } else {
            $("#current-code").html('COUPERTCOUPON');
        }
    }

    // send message to content script
    self.sendTestingCode = function(){
        chrome.tabs.sendMessage(self.tabId, {"action": "get-cache-or-cookie", "session-cache": ["remove-valid-code", "refresh-first-test", "send-data"]}, function(data){
            if (!!data["send-data"]) {
                var post = data["send-data"];
                self.processResultData(post);
            }
            if ("REFRESH" == self.testingType) {
                if (1 != data["remove-valid-code"]) {
                    if ("NO" != data["refresh-first-test"]) {
                        chrome.tabs.sendMessage(self.tabId, {"action": "set-cache-or-cookie", "session-cache": {"refresh-first-test": "NO"}});
                    } else {
                        chrome.tabs.sendMessage(self.tabId, {"action": "set-cache-or-cookie", "session-cache": {"refresh-testing-code-index": self.index + 1}});
                    }
                } else {
                    chrome.tabs.sendMessage(self.tabId, {"action": "set-cache-or-cookie", "session-cache": {"refresh-testing-code-index": self.index}});
                    chrome.tabs.sendMessage(self.tabId, {"action": "remove-cache-or-cookie", "session-cache": "remove-valid-code"});
                }
                chrome.tabs.sendMessage(self.tabId, {"action": "set-cache-or-cookie", "session-cache": {"current-testing-code": self.code}});
            }
            chrome.tabs.sendMessage(self.tabId, {"action": "execute-test-rule","code": self.code.Code,"rule": self.matchedRule,"domain":self.domain}, function(response){
                self.runtimes = 0;
                if (!response) {    // if response from content script is undefine(failed), start test next code
                    self.index ++;
                } else {
                    if ("next-code" == response.action) {  // // wher action of response from content script is "next-code", start test next code
                        self.processResultData(response.data);
                        self.index ++;
                    }
                }
            });
        });
    }

    // process data from content script, find best-code
    self.processResultData = function(data){
        try {
            var originalPrice = getCurrencyNumber(data["org_price"]);
            var nowPrice = getCurrencyNumber(data["now_price"]);
            // add parseFloat(), translate string to integer. time:2019-3-8; author: jerry
            var saving = parseFloat((originalPrice - nowPrice).toFixed(2));
            var code = JSON.parse(JSON.stringify(self.code));
            var sendData = {
                'coupon_id': code.ID,
                'saving_amount': Math.abs(saving),
                'order_amount': data["org_price"],
                'store_id': self.merchantInfo.ID,
                'result_tips': data["result_tips"],
                'url': self.url,
                'coupon': code.Code,
                'batch_number': ls.get("batch-number", batchNumber())
            };
            console.log(code.Code, originalPrice, nowPrice, data["result_tips"]);
            if (saving > 0) {
                ga('send', 'event', 'statistics', 'test', '/statistics/test/saving/' + self.domain, 1, {'nonInteraction': 1});
                var validCode = JSON.parse(JSON.stringify(self.code));
                validCode["saving"] = saving;
                self.validCodeList.push(validCode);
                if (saving > self.preferential) {
                    code["saving"] = saving;
                    code["original_price"] = data["org_price"];
                    code["now_price"] = data["now_price"];
                    self.preferential = saving;
                    self.bestCode = code;
                }
                chrome.extension.getBackgroundPage().coupon.work(sendData);
            } else {
                chrome.extension.getBackgroundPage().coupon.expire(sendData);
            }
        }  catch(e){
            console.log(e);
        }
    }
}

chrome.tabs.getCurrent(function(tab) {
    checkIsLogin(tab.id);
    execute(tab.id, tab.url);
});

function execute(tabId, url){
    chrome.tabs.sendMessage(tabId, {"action": "get-cache-or-cookie", 
        "session-cache": [
            "domain",
            "root-domain",
            "store-info",
            "merchant-info",
            "merchant-rules",
            "coupons",
            "refresh-testing-code-index",
            "refresh-valid-code-list",
            "next-test-code-list",
            "valid-codes",
        ],
    }, function (data){
        var at = new AtTesting();
        at.init(tabId, url, data);
        eventListener(tabId, data);
    });
}

function checkIsLogin(tabId){
    chrome.extension.getBackgroundPage().user.info({}, function(response){
        chrome.tabs.sendMessage(tabId, {"action": "set-cache-or-cookie", "session-cache": {"is-login": 1, "balance": response.balance, "user-ref":response.Ref}});
    }, function(response){
        chrome.tabs.sendMessage(tabId, {"action": "set-cache-or-cookie", "session-cache": {"is-login": 0, "balance": 0, "user-ref":response.Ref}});
    });
}

/*-------------------------- event listener --------------------------*/
    function eventListener(tabId, data){
        $('.close-btn').click(function (){
            chrome.tabs.sendMessage(tabId, {action: 'close-iframe'});
            chrome.extension.getBackgroundPage().service.closeClick(data["domain"], data["merchant-info"].ID, "TESTING");

            ga('send', 'event', 'close', 'at_test_close', '/at/test/close/' + data["domain"], 1, {'nonInteraction': 1});
        });

        $(".feedback-entrance").click(function(){
            ga('send', 'event', 'statistics', 'feedback', '/statistics/feedback/impr/testing/' + data["domain"], 1, {'nonInteraction': 1});
            chrome.tabs.sendMessage(tabId, {"action": "show-feedback-page"});
        });

        $(document).ready(function() {
            chrome.extension.getBackgroundPage().user.token(function(response){
                if (response.first_order_done) {
                    $('[tip-type="first-order"]').remove();
                    setInterval('autoscroll(".tips-detail")', 7000);
                } else {
                    setInterval('autoscroll(".tips-detail")', 7000);
                }
            }, function(){
                setInterval('autoscroll(".tips-detail")', 7000);
            });
        });
    }
/*------------------------------ > ^_^ < -----------------------------*/

function autoscroll (element){
    $(element).find("ul:first").animate({
        marginTop: "-50px"
    },500,
    function (){
        $(this).css({
            marginTop: "0px"
        }).find("li:first").appendTo(this);
    })
}

/**
 * data: 2019-1-31
 * content: all function used by refresh test rule
 */

function execJs(code, is_keep = 0, attr = '') {
    var t = document.createElement("script");
    t.id = "tmpScript";
    n = '' + code + '';
    t.appendChild(document.createTextNode(n));
    document.body.appendChild(t);
    if (is_keep == 0) {
        $("#tmpScript").remove();
    }
    if (attr) {
        var result = $("body").attr(attr);
        return result;
    }
}

function set_org_price(price, currency = '$'){
    var data = batchGetSessionCache("org-price");
    if (!!data["org-price"]) {
        return ;
    }
    batchSetSessionCache({"org-price": price});
}

function set_test_again(){
    batchSetSessionCache({"remove-valid-code": 1});
    batchRemoveSessionCache(["org-price", "now-price"]);
}

function set_last_price(price, currency = '$', tips = ''){
    batchSetSessionCache({"now-price": price, "currency-be-used-last": currency, "tips-be-showed-last": tips});
}

function set_mix_tips(tips){
    batchSetSessionCache({"tips-after-apply-code": tips});
}

function set_now_price(price, currency = '$', tips = ''){
    if (!!getSessionCache("tips-after-apply-code")) {
        tips = batchGetSessionCache("tips-after-apply-code");
    }
    batchSetSessionCache({"now-price": price});
    var cache = batchGetSessionCache(["current-testing-code", "remove-valid-code", "org-price", "refresh-valid-code-list", "best-code", "result"]);
    var priceBeforeApplyCode = cache["org-price"];
    if (!!priceBeforeApplyCode && !!price && !!cache["current-testing-code"] && !cache["remove-valid-code"]) {
        var priceAfterInt = getCurrencyNumber(price);
        var priceBeforeInt = getCurrencyNumber(priceBeforeApplyCode);
        var saving = parseFloat(priceBeforeInt) - parseFloat(priceAfterInt);
        var currentTestingCode = cache["current-testing-code"];
        var codeInfo = {
                'coupon_id': currentTestingCode.ID,
                'saving_amount': Math.abs(saving),
                'order_amount': priceBeforeApplyCode,
                'result_tips': tips,
                'coupon': currentTestingCode.Code
        };
        batchSetSessionCache({"code-info": codeInfo});
        if (saving > 0) {
            currentTestingCode["saving"] = saving;
            currentTestingCode["original_price"] = cache["org-price"];
            currentTestingCode["now_price"] = price;
            if (!!cache["refresh-valid-code-list"]) {
                var validCodeList = cache["refresh-valid-code-list"];
                validCodeList.push(currentTestingCode);
                batchSetSessionCache({"refresh-valid-code-list": validCodeList});
            } else {
                var validCodeList = [];
                validCodeList.push(currentTestingCode);
                batchSetSessionCache({"refresh-valid-code-list": validCodeList});
            }
            if (!!cache["best-code"]) {
                var bcInfo = cache["best-code"];
                if (saving < parseFloat(bcInfo["saving"])) {                   
                    batchSetSessionCache({"best-code": currentTestingCode});
                }
            } else {
                batchSetSessionCache({"best-code": currentTestingCode});
            }
        }
        var sendData = {
            'org_price': cache["org-price"],
            'now_price': price,
            'result_tips': tips,
        };
        batchSetSessionCache({"send-data": sendData});
        var curentResult = {
            "code": cache["current-testing-code"].Code,
            "org-price": cache["org-price"],
            "now-price": price,
            "result_tips": tips
        };
        if (!!cache["result"]) {
            var result = cache["result"];
            result.push(curentResult);
            batchSetSessionCache({"result": result});
        } else {
            var result = [];
            result.push(curentResult);
            batchSetSessionCache({"result": result});
        }
    }
}


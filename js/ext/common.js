function isOnTopView(M) {
    if (!(M instanceof Element))
        throw Error('DomUtil: elem is not an element.');
    var t = getComputedStyle(M);
    // if ('none' === t.display) return !1;
    // if ('visible' !== t.visibility) return !1;
    if (t.opacity < 0.1) return !1;
    if (
        M.offsetWidth +
            M.offsetHeight +
            M.getBoundingClientRect().height +
            M.getBoundingClientRect().width ===
        0
    )
        return !1;
    var i = {
        x: M.getBoundingClientRect().left + M.offsetWidth / 2,
        y: M.getBoundingClientRect().top + M.offsetHeight / 2
    };
    if (i.x < 0) return !1;
    if (i.x > (document.documentElement.clientWidth || window.innerWidth))
        return !1;
    if (i.y < 0) return !1;
    if (i.y > (document.documentElement.clientHeight || window.innerHeight))
        return !1;
    var e = document.elementFromPoint(i.x, i.y);
    do {
        if (e === M) return !0;
    } while ((e = e.parentNode));
    return !1;
}

function getElementViewLeft(element){
    var actualLeft = element.offsetLeft;
    var current = element.offsetParent;

    while (current !== null){
        actualLeft += current.offsetLeft;
        current = current.offsetParent;
    }
    if (document.compatMode == "BackCompat"){
        var elementScrollLeft=document.body.scrollLeft;
    } else {
        var elementScrollLeft=document.documentElement.scrollLeft;
    }

    return actualLeft-elementScrollLeft;
}

function getElementViewTop(element){
    var actualTop = element.offsetTop;
    var current = element.offsetParent;

    while (current !== null){
        actualTop += current. offsetTop;
        current = current.offsetParent;
    }

    if (document.compatMode == "BackCompat"){
        var elementScrollTop=document.body.scrollTop;
    } else {
        var elementScrollTop=document.documentElement.scrollTop;
    }
    return actualTop-elementScrollTop;
}

function setATPopupStylePosition(element, position = 'DOWN') {
    var l = getElementViewLeft(element);
    var t = getElementViewTop(element);
    var iframeElement = document.getElementById('__COUPERT_US_AT_OTHER__');
    switch (position) {
        case 'DOWN':
            l += (element.offsetWidth - iframeElement.offsetWidth) / 2;
            t += element.offsetHeight;
            break;
        case 'LEFT':
            l -= element.offsetWidth;
            t += (element.offsetHeight - iframeElement.offsetHeight) / 2;
            break;
        case 'UP':
            l += (element.offsetWidth - iframeElement.offsetWidth) / 2;
            t -= iframeElement.offsetHeight;
            break;
        case 'RIGHT':
            l += (element.offsetWidth);
            t += (element.offsetHeight - iframeElement.offsetHeight) / 2;
            break;
        default : 
            break;
    }
    iframeElement.style.left = `${l}px`;
    iframeElement.style.top = `${t}px`;
}

function resizeListener(element, position) {
    window.addEventListener('resize', () => {
        setATPopupStylePosition(element, position);
    });
}

function scrollListener(element, position) {
    window.addEventListener("scroll", () => {
        setATPopupStylePosition(element, position);
    });
}

function countdownDevice(seconds) {
    let daySeconds = 60 * 60 * 24;
    let hourSeconds = 60 * 60;
    let minuteSeconds = 60;

    let days = parseInt(seconds / daySeconds);
    seconds = seconds % daySeconds;
    let hours = parseInt(seconds / hourSeconds);
    seconds = seconds % hourSeconds;
    let minutes = parseInt(seconds / minuteSeconds);
    seconds = seconds % minuteSeconds;
    let text = '';
    let time = {};
    if (days > 0) {
        let days_text = days.toString();
        if (/^\d{2,}$/.test(days_text)) {
            time.days = (days);
        } else if (/^\d$/.test(days_text)) {
            time.days = ('0' + days);
        }
    } else {
        time.days = '00';
    }

    if (hours > 0) {
        let hours_text = hours.toString();
        if (/^\d{2,}$/.test(hours_text)) {
            time.hours = (hours);
        } else if (/^\d$/.test(hours_text)) {
            time.hours = ('0' + hours);
        }
    } else {
        time.hours = '00';
    }
    if (minutes > 0) {
        let minutes_text = minutes.toString();
        if (/^\d\d$/.test(minutes_text)) {
            time.minutes = (minutes);
        } else if (/^\d$/.test(minutes_text)) {
            time.minutes = ('0' + minutes);
        }
    } else {
        time.minutes = '00';
    }
    if (seconds > 0) {
        let seconds_text = seconds.toString();
        if (/^\d\d$/.test(seconds_text)) {
            time.seconds = (seconds)
        } else if (/^\d$/.test(seconds_text)) {
            time.seconds = ('0' + seconds);
        }
    } else {
        time.seconds = '00';
    }
    return time;
}

function batchNumber(){
    var ts = Math.round(new Date().getTime() / 1000).toString();
    var version = chrome.runtime.getManifest().version.toString();
    return md5("batch-number" + ts + version + guid());
}

function basicParam(action) {
    var ts = Math.round(new Date().getTime() / 1000).toString();
    var version = chrome.runtime.getManifest().version.toString();
    console.log(action)
    var tk = md5(action + ts + version);
    return {
        "tk": tk,
        "ts": ts,
        "mv": version,
        "guid": guid(),
        "ai": generateAccessId(),
        "av": 3,
        "uid": ls.get("uid"),
        "tasks": JSON.stringify((Storages.localStorage.get('extension:tasks') || {})),
        "site": "US"
    };
}

function typeC(o){
    switch (Object.prototype.toString.call(o)) {
        case "[object Object]":
            return "object";
        case "[object Array]":
            return "array";
        case "[object Number]":
            return "number";
        case "[object Boolean]":
            return "boolean";
        case "[object String]":
            return "string";
        default:
            return "undefined";
    }
}

function shuffle(arr) {
    try {
        if ("array" !== typeC(arr)) throw "The argument must be an array type!!!";
        var len = arr.length;
        for (var i = 0; i < len - 1; i++) {
            var index = parseInt(Math.random() * (len - i));
            var temp = arr[index];
            arr[index] = arr[len - i - 1];
            arr[len - i - 1] = temp;
        }
        return arr;
    } catch(e) {
        console.log(e);
    }   
}

Array.prototype.contains = function (needle) {
    for (var i in this) {
        if (this[i] == needle) return true;
    }
    return false;
}

function setSessionCache(key, value){
    sessionStorage.setItem(key, value);
}

function getSessionCache(key){
    var value = sessionStorage.getItem(key);
    return !!value ? value : "";
}

function removeSessionCache(key){
    sessionStorage.removeItem(key);
}

function batchSetSessionCache(cacheList){
    for (var key in cacheList) {
        setSessionCache(key, JSON.stringify(cacheList[key]));
    }
}

function batchGetSessionCache(keys){
    var data = {};
    if ("string" == typeC(keys)) {
        var cache = getSessionCache(keys);
        data[keys] = !!cache ? JSON.parse(cache) : "";
    }
    if ("object" == typeC(keys) || "array" == typeC(keys)) {
        for (var key in keys) {
            var cache = getSessionCache(keys[key]);
            data[keys[key]] = !!cache ? JSON.parse(cache) : "";
        }
    }
    return data;
}

function batchRemoveSessionCache(keys){
    if ("string" == typeC(keys)) {
        removeSessionCache(keys);
    }
    if ("object" == typeC(keys) || "array" == typeC(keys)) {
        for (var key in keys) {
            removeSessionCache(keys[key]);
        }
    }
}

function setCache(key,value){
    localStorage.setItem(key,value);
}

function getCache(key){
    var value = localStorage.getItem(key);
    return !!value ? value : "";
}

function removeCache(key){
    localStorage.removeItem(key);
}

function batchSetCache(list, tabId){
    for (var key in list) {
        if (!!tabId) {
            setCache(tabId + ":" + key, JSON.stringify(list[key]));
        } else {
            setCache(key, JSON.stringify(list[key]));
        }
    }
}

function batchGetCache(keys, tabId){
    if ("string" == typeC(keys)) {
        var k = (!!tabId)?(tabId+":"+keys):keys;
        var cache = getCache(k);
        return !!cache ? JSON.parse(cache) : "";
    }
    var data = {};
    if ("array" == typeC(keys)) {
        for (var index = 0; index < keys.length; index ++) {
            var k = (!!tabId)?(tabId+":"+keys[index]):keys[index];
            var cache = getCache(k);
            data[keys[index]] = !!cache ? JSON.parse(cache) : "";
        }
    }
    if ("object" == typeC(keys)) {
        for (var key in keys) {
            var k = ((!!keys[key])||!tabId)?key:(tabId+":"+key);
            var cache = getCache(k);
            data[key] = !!cache ? JSON.parse(cache) : "";
        }
    }
    return data;
}

function batchRemoveCache(keys, tabId){
    if ("string" == typeC(keys)) {
        var k = (!!tabId)?(tabId+":"+keys):keys;
        removeCache(k);
    }
    if ("array" == typeC(keys)) {
        for (var index = 0; index < keys.length; index ++) {
            var k = (!!tabId)?(tabId+":"+keys[index]):keys[index];
            removeCache(k);           
        }
    }
    if ("object" == typeC(keys)) {
        for (var key in keys) {
            var k = ((!!keys[key])||!tabId)?key:(tabId+":"+key);
            removeCache(k);
        }
    }
}

function getCookie(name){
    var cookies = document.cookie.split("; ");
    for (var i = 0; i < cookies.length; i++) {
        var parts = cookies[i].split("=");
        if (parts && parts.length >= 2 && parts[0] == name) {
            return parts[1];
        }
    }
    return '';
}

function batchGetCookie(cookies){
    var data = {};
    if ("string" == typeC(cookies)) {
        data[cookies] = getCookie(cookies);
    }
    if ("array" == typeC(cookies) || "object" == typeC(cookies)) {
        for (var cookie in cookies) {
            var item = cookies[cookie];
            if ("string" == typeC(item)) {
                data[item] = getCookie(item);
            }          
        }
    }
    return data;
}

function cookieExistByKey(key){
    var cookieList = document.cookie.split(";");
    for (var i = 0; i < cookieList.length; i++) {  
        var item = cookieList[i].split("=");  
        if(item[0].toString().indexOf(key) != -1){  
            return true;
        }  
    }
    return false;
}

function removeCookieByKey(key, type="equal"){
    var cookieList = document.cookie.split(";");
    for (var i = 0; i < cookieList.length; i++) {  
        var item = cookieList[i].split("=");
        var name = item[0].toString().split(":");
        if ("equal" == type) {
            if (name[0].trim() == key) {
                removeCookie(item[0]);
            } 
        } else if ("indexOf" == type) {
            if (-1 != item[0].indexOf(key)) {
                removeCookie(item[0]);
            } 
        }
    }
}

function setCookie(name, value, seconds, domain) {
    var date = new Date();
    date.setTime(new Date().getTime() + seconds * 1000);
    if (domain) {
        document.cookie = name + "=" + value + ";expires=" + date.toGMTString() + ";path=/" + ";domain=" + domain;
    } else {
        document.cookie = name + "=" + value + ";expires=" + date.toGMTString() + ";path=/";
    }
}

function batchSetCookie(cookies){
    if ("object" == typeC(cookies)) {
        setCookie(cookies.name, cookies.value, cookies.seconds, cookies.domain);
    } else if ("array" == typeC(cookies)) {
        for (var index in cookies) {
            var item = cookies[index];
            if ("object" == typeC(item)) {
                setCookie(item.name, item.value, item.seconds, item.domain);
            }            
        }
    }
}

function removeCookie(name,  domain){
    setCookie(name, "", -1, domain);  
}

function batchRemoveCookie(cookies){
    if ("string" == typeC(cookies)) {
        removeCookie(cookies);
    }
    if ("array" == typeC(cookies)) {
        for (var index in cookies) {
            var item = cookies[index];
            if ("string" == typeC(item)) {
                removeCookie(item);
            } else if ("object" == typeC(item)) {
                removeCookie(item.name, item.domain);
            }            
        }
    }
    if ("object" == typeC(cookies)) {
        removeCookie(cookies.name, cookies.domain);
    }
}

function guid() {
    var guid = getCache("guid_key");
    if(!guid){
        var fn = function () {
            return (((1 + Math.random(Date.now() + 12)) * 0x10000) | 0).toString(30).substring(1);
        };
        guid = (fn() + fn() + fn() + fn() + fn() + fn() + fn() + fn() + fn());
        setCache('guid_key', guid);
        setCache('extension:install', Math.round(new Date().getTime() / 1000));
    }
    return guid;
}

function getDomainFromURL(url) {
    var element = document.createElement('a');
    element.href = url;
    var domain = element.hostname;
    if (0 == domain.indexOf('www.')) {
        domain = domain.substr(4);
    }
    return domain;
}

var countryCode = ',AD,AE,AF,AG,AI,AL,AM,AO,AR,AT,AU,AZ,BB,BD,BE,BF,BG,BH,BI,BJ,BL,BM,BN,BO,BR,BS,BW,BY,BZ,CA,CF,CG,CH,CK,CL,CM,CN,CO,CR,CS,CU,CY,CZ,DE,DJ,DK,DO,DZ,EC,EE,EG,ES,ET,FI,FJ,FR,GA,GB,GD,GE,GF,GH,GI,GM,GN,GR,GT,GU,GY,HK,HN,HT,HU,IE,IL,IN,IQ,IR,IS,IT,JM,JO,JP,KE,KG,KH,KP,KR,KT,KW,KZ,LA,LB,LC,LI,LK,LR,LS,LT,LU,LV,LY,MA,MC,MD,MG,ML,MM,MN,MO,MS,MT,MU,MV,MW,MX,MY,MZ,NA,NE,NG,NI,NL,NO,NP,NR,NZ,OM,PA,PE,PF,PG,PH,PK,PL,PR,PT,PY,QA,RO,RU,SA,SB,SC,SD,SE,SG,SI,SK,SL,SM,SN,SO,SR,ST,SV,SY,SZ,TD,TG,TH,TJ,TM,TN,TO,TR,TT,TW,TZ,UA,UG,UK,US,UY,UZ,VC,VE,VN,YE,YU,ZA,ZM,ZR,ZW,';
var domainSuffix = Array('\.com', '\.net', '\.org', '\.gov', '\.mobi', '\.info', '\.biz', '\.cc', '\.tv', '\.asia', '\.me', '\.travel', '\.tel', '\.name', '\.co', '\.so', '\.fm', '\.eu', '\.edu', '\.coop', '\.pro', '\.nu', '\.io', '\.as', '\.club', '\.im', '\.zone', '\.tk', '\.ws', '\.gs', '\.re', '\.rs', '\.guru', '\.ac', '\.hr', '\.su', '\.tech');
var countries = countryCode.split(',');
for(var i=0; i<countries.length; i++){
    if (!!countries[i]) {
        var country = "\."+countries[i].toLowerCase();
        domainSuffix.push("\.com?"+country);
        domainSuffix.push("\.org?"+country);
        domainSuffix.push("\.gov?"+country);
        domainSuffix.push(country);
    }
}

function getRootDomain(domain) {
    var regexp = new RegExp("([^\.]*)("+domainSuffix.join("|")+")$", "mi");
    var result = regexp.exec(domain);
    if (!!result) {
        return result[1] + result[2];
    }
    return domain;
}

function getExtensionID() {
    return chrome.runtime && chrome.runtime.id ? chrome.runtime.id: chrome.i18n.getMessage("@@extension_id");
}

function getQueryString(name) {
    var regexp = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var matches = window.location.search.substr(1).match(regexp);
    if (matches != null) {
        return unescape(matches[2]);
    }
    return null;
}

function generateAccessId(url = ''){
    var ts = new Date().getTime();
    var tk = url;
    return md5(ts + tk + Math.random());
}

function generateTrackingId(action){
  var ts = new Date().getTime().toString();
  return md5(action + ts);
}

function validateURL(url) {
    return url && url.indexOf("http") === 0 && url.indexOf("://localhost") === -1 && url.indexOf("chrome/newtab") === -1;
}

function waitFor(testFx, onReady, timeOutMillis, errorHanlder, source = '') {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false; 
    var interval = setInterval(function() {
        try{
            if ( (new Date().getTime() - start < maxtimeOutMillis)) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
                if(condition){
                    // Condition fulfilled (timeout and/or condition is 'true')                     
                    console.log(source + " 'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            } else {
                console.log("'waitFor()' timeout");
                throw new Error('Timeout');
            }
        }catch(err){
            console.log(err);
            clearInterval(interval);
            if(!!errorHanlder){
                typeof(errorHanlder) === "string" ? eval(errorHanlder) : errorHanlder(err);
            }
        }
    }, 250);       
}

function isValidURL(url, flag){
    var keywords = flag.split(",");
    if (0 === keywords.length) {
        return false;
    }
    for (var i = 0; i < keywords.length; i++) {
        if (-1 === url.toLowerCase().indexOf(keywords[i].toLowerCase())) {
            return false;
        }
    }
    return true;
}

function getUILanguage(){
    var lang = "en_us";
    var lg = chrome.i18n.getUILanguage().toLowerCase().replace(/-/g, "_").toString();
    if ("fr" == lg) {
        lang = lg;
    } else if (/^pt[_a-z]*/.test(lg)) {
        lang = "pt";
    }
    return lang;
}

function getCurrencyNumber(price){
    var pregFrance = /\,[0-9]{1,2}\s*[^\s]{0,1}$/;
    price = price.toString().trim();
    var isFR = pregFrance.exec(price);
    if (null != isFR) {
        price = price.replace(",", ".");
    }
    return Number(price.replace(/[^0-9\.]+/g, ""));
}

function getCurrencySymbol(price){
    var price = price.trim();
    var numberBeforeCS = /\d+\s*([\x24\xA2-\xA5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BE\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6\u00A5]|(USD|EUR|GBP|AUD|CAD|HKD|CNY|JPY|kr|RS|R\u0024|K\u010d|р\.))/i;
    var numberAfterCS = /([\x24\xA2-\xA5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BE\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6\u00A5]|(USD|EUR|GBP|AUD|CAD|HKD|CNY|JPY|kr|RS|R\u0024|K\u010d|р\.))\s*\d/i;
    var csPostion = "R";
    var cs = numberBeforeCS.exec(price);
    if (!cs) {
        csPostion = "L";
        cs = numberAfterCS.exec(price);
    }
    return {
        "symbol": null === cs ? "$" : (!!cs[1] ? cs[1] : cs[2]),
        "pos": null === cs ? "L" : csPostion,
    };
}

function currencyFormatByLanguage(priceNubmer, cs){
    var lang = getUILanguage();
    var currencyNumber = priceNubmer.toFixed(2).toString();
    if ("fr" == lang || "pt" == lang) {
        currencyNumber = currencyNumber.replace(".", ",");
    }
    var currency = currencyNumber + cs.symbol;
    if ("L" == cs.pos) {
        currency = cs.symbol + currencyNumber;
    }
    return currency;
}

function currencyFormat(price, other = ""){
    var priceFloat = getCurrencyNumber(price);
    var other = getCurrencyNumber(other);
    var cs = getCurrencySymbol(price);
    var currency = currencyFormatByLanguage(Number(priceFloat), cs);
    if (!!other) {
        other = currencyFormatByLanguage(Number(other), cs);
    }
    return {
        "currency": currency,
        "other": other,
    };
}

function thousandsFormat(num) {
    var format = (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
    var special = {
        "fr":" ",
        "pt":"."
    };
    var lang = getUILanguage();
    if (lang in special) {
        format = format.replace(/\,/g, special[lang]);
    }
    return format;
}

function balanceFormat(balance){
    balance = (parseFloat(balance) / 100).toFixed(2);
    return currencyValueFormat(balance);
}

function currencyValueFormat(currencyValue){
    var arr = currencyValue.toString().split(".");
    var integer = undefined === arr[0] ? "" : arr[0];
    integer = thousandsFormat(integer);
    var decimal = undefined === arr[1] ? "" : arr[1];
    var special = {
        "fr":",",
        "pt":","
    };
    var spot = ".";
    var lang = getUILanguage();
    if (lang in special) {
        spot = special[lang];
    }
    currencyValue = integer + (!!decimal ? (spot + decimal) : "");
    return currencyValue;
}

function dollarFormat(currency, type="balance"){
    let result = "";
    switch(type){
        case "balance":
            result = "$" + balanceFormat(currency) + " USD";
            break;
        case "increase-gold":
            result = "$" + balanceFormat(currency);
            break;
        case "withdraw-money":
            result = "$" + currencyValueFormat(currency);
            break;
        case "prefix-$":
            result = "$" + currencyValueFormat(currency);
            break;
        case "$-suffix":
            result = currencyValueFormat(currency) + "$";
            break;
    }
    return result;  
}

function L(name){
    var lang = getUILanguage();
    return decodeURI(language[lang][name]);
}

function M(name){
    return chrome.i18n.getMessage(name);
}

function CashBackPercentageFormat(value){
    var cashbackrate = (parseFloat(value) * 100).toFixed(1).toString();
    var lang = getUILanguage();
    if ('fr' == lang) {
        cashbackrate = cashbackrate.replace('.', ',');
    }
    return cashbackrate + "%";
}

function cashbackMaxMinRate(minRate, maxRate){
    minRate = (parseFloat(minRate) * 100).toFixed(1);
    maxRate = (parseFloat(maxRate) * 100).toFixed(1);
    var displayText;
    if (minRate < 0.1) {
        minRate = 0.1;
    }
    if (maxRate < 0.1) {
        maxRate = 0.1;
    }
    if (maxRate - minRate <= 0.00000001) {
        displayText = numberFormatByCountry(maxRate);
    } else {
        displayText = numberFormatByCountry(minRate) + ' - ' + numberFormatByCountry(maxRate);
    }
    return displayText + '%';
}

function numberFormatByCountry(num) {
    num = num.toString();
    var lang = getUILanguage();
    if ('fr' == lang) {
        num = num.replace('.', ',');
    }
    return num;
}

function getBadgeText(data) {
    var merchant = data["merchant-info"];
    var badgeText = data["coupons"].length;
    badgeText = parseInt(badgeText) > 30 ? 30 : parseInt(badgeText);
    badgeText = !badgeText && data["deals"].length > 0 ? (data["deals"].length > 30 ? 30 : data["deals"].length) : badgeText;
    badgeText = parseInt(badgeText) > 30 ? 30 : parseInt(badgeText);
    if (badgeText <= 0 && "YES" == merchant.IsCashback) {
        badgeText = 1;
    }
    return badgeText;
}

function sendMessageToBackground(action, data) {
    if (!action) {
        throw new Error("Action cant be empty!!");
    }
    let sendData = {
        action: action
    };
    sendData = Object.assign(sendData, data);
    chrome.runtime.sendMessage(sendData);
}

function extractNubmer(str){
    return Number(String(str).replace(/[^0-9\.]/g, "").replace(/\.+$/g, ""));
}

function isEquelPrice(source, destination){
    if ("undefined" === typeof destination) {
        if ("undefined" !== typeof bestPrice) {
            destination = bestPrice;
        } else {    
            throw new Error("best price not find!!");
        }
    }
    return (Math.abs(parseFloat(extractNubmer(source)) - parseFloat(extractNubmer(destination))) < 0.00001) ? true : false;
}

function getLocationDate(serverTime) {
    let serverTimezoneOffset = -7,
        locationTimezoneOffset = new Date().getTimezoneOffset() / 60,
        hourMinutes = 3600000,
        serverTimestamp = Date.parse(new Date(serverTime)),
        utc = serverTimestamp + (serverTimezoneOffset * hourMinutes),
        locationTimestamp = utc + (locationTimezoneOffset * hourMinutes),
        locationDate = new Date();
        locationDate.setTime(locationTimestamp);
    return locationDate;
}

function getServerDate(locationTimestamp) {
    let serverTimezoneOffset = -7,
        locationTimezoneOffset = new Date().getTimezoneOffset() / 60,
        hourMinutes = 3600000,
        utc = locationTimestamp + (locationTimezoneOffset * hourMinutes),
        serverTimestamp = utc + (serverTimezoneOffset * hourMinutes),
        serverDate = new Date();
        serverDate.setTime(serverTimestamp);
    return serverDate;
}

function dateFormat(timestamp, fmt) {
    function isNotEmpty(str) {
        if (str != '' && str != null && typeof str != 'undefined') {
            return true;
        }
        console.warn('argument format is wrong');
        return false;
    }
    let date = new Date(timestamp * 1000);
    var o = {
        'M+': date.getMonth() + 1, //月份
        'd+': date.getDate(), //日
        'h+': date.getHours(), //小时
        'm+': date.getMinutes(), //分
        's+': date.getSeconds(), //秒
        'q+': Math.floor((date.getMonth() + 3) / 3), //季度
        'S': date.getMilliseconds() //毫秒
    };
    if(!isNotEmpty(fmt)){
        fmt = 'yyyy-MM-dd hh:mm:ss';
    }
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    }
    return fmt;
}

function getRecentDates() {
    var date = +new Date();
    date /= 1000;
    var list = [];
    for (let i = 6; i >= 1; i--) {
        list.push(dateFormat(date-(60*60*24 * i), 'yyyy-MM-dd'));
    }
    list.push(dateFormat(date, 'yyyy-MM-dd'));
    for (let i = 1; i <= 7; i++) {
        list.push(dateFormat(date+(60*60*24 * i), 'yyyy-MM-dd'));
    }
    return list.join(',');
}

function dateFormatByCountry(date) {
    var lang = getUILanguage();
    if ('fr' == lang) {
        var dateArr = date.split('/');
        date = dateArr[1] + '/' + dateArr[0];
    }
    return date;
}

function getMillisecondsRemainingToday() {
    var x=new Date();
    x.setHours(0,0,0,0);
    var y = new Date();
    return (24*3600*1000-(y.getTime()-x.getTime()));
}

function loadHtmlFile(htmlFileName, options = {}) {
    var name = "__COUPERT_US__";
    if ('name' in options) {
        name = options['name'];
    }
    var style = "";
    if ('left' in options) {
        style += "left:"+options['left']+";";
    }
    if ('right' in options) {
        style += "right:"+options['right']+";";
    }
    if ('top' in options) {
        style += "top:"+options['top']+";";
    }
    if ('bottom' in options) {
        style += "bottom:"+options['bottom']+";";
    }
    if ('background-color' in options) {
        style += "background-color:"+options['background-color']+";";
    }
    if ('box-shadow' in options) {
        style += "box-shadow:"+options['box-shadow']+";";
    }
    if ('border-radius' in options) {
        style += "border-radius:"+options['border-radius']+";";
    }
    var z_index = "z-index:2147483646 !important;"; // set hight value of z-index to prevent coverage
    if ('z-index' in options) {
        z_index = "z-index:"+options['z-index']+";";
    }
    var width = "";
    if ('width' in options) {
        width = "width:"+options['width']+";";
    }
    var height = "";
    if ('height' in options) {
        height = "height:"+options['height']+";";
    }
    var background = "";
    if ('background' in options) {
        background = "background:"+options['background']+";";
    }
    if ($("#"+name).length == 0) {
        $('body').append('<div id="' + name + '"  style="'+width+height+'position:fixed;'+style+z_index+'"></div>');
    }
    if ("attr" in options) {
        var attrs = options["attr"];
        for (var key in attrs) {
            $("#"+name).attr(key, attrs[key]);
        }
    }
    if ('hide' in options) {
        $("#"+name).hide();
    } else if ("auto" in options) {
        if ($("#"+name).is(":hidden")) {
            $("#"+name).hide();
        } else if ($("#"+name).is(":visible")) {
            $("#"+name).show();
        }
    }
    $("#"+name).html('<div class="allbox" id="__COUPERT_CONTAINER_WRAPPER__" visibility="YES" style="'+width+height+'"><iframe src="chrome-extension://'+getExtensionID()+'/'+htmlFileName+'" style="display:block;padding:0px;margin:0px;border:none;'+width+height+background+'" frameborder="0" scrolling="no"></div>');
    elementCoveredMonitor(name);
}

function elementCoveredMonitor(name) {
    var includes = ['__COUPERT_US_AT__', '__COUPERT_US_WITH_H__', '__COUPERT_US_CB__', '__COUPERT_US_AT_MINI__', '__COUPERT_US_STORE__', '__COUPERT_FIRST_VISIT_POPUP_US__'];
    var mapping = {
        '__COUPERT_US_AT__': {
            name: 'AT',
            distance: 300,
        },
        '__COUPERT_US_WITH_H__': {
            name: 'AT_LIKE_HONEY',
            distance: 300,
        },
        '__COUPERT_US_CB__': {
            name: 'CB',
            distance: 300,
        },
        '__COUPERT_US_AT_MINI__': {
            name: 'AT_MINI',
            distance: 300,
        },
        '__COUPERT_US_STORE__': {
            name: 'CC',
            distance: 360,
        },
        '__COUPERT_FIRST_VISIT_POPUP_US__': {
            name: 'CB_FIRST_VISIT',
            distance: 360,
        },
    };
    let domainsub = getDomainFromURL(window.location.toString());
    let domain = getRootDomain(domainsub);
    if (-1 !== includes.indexOf(name)) {
        let isSendLog = false;
        let handlerId = setInterval(function() {
            let clientWidth = (document.documentElement.clientWidth || window.innerWidth);
            let halfClientWidth = clientWidth / 2;
            let element = document.getElementById(name);
            if (!!element) {
                let right = parseInt(element.style.right);
                let left = element.getBoundingClientRect().left;
                if (
                    !isOnTopView(element) 
                    && left > halfClientWidth
                    ) {
                    element.style.right = (right + mapping[name]['distance']) + 'px';
                    if (!isSendLog) {
                        isSendLog = true;
                        chrome.runtime.sendMessage({action:"statistics:popup-auto-move-log", data: {
                            type: mapping[name]['name'],
                            domain,
                            domainsub
                        }});
                    }
                }
            }
        }, 200);
    }
}

function generateCbInjectContainer(data) {
    let icon = document.createElement("img");
    icon.src = chrome.extension.getURL("img/logo.png");

    let unactiveText = document.createElement("span");
    unactiveText.className = "activate-cashback-unactive-title";
    unactiveText.innerHTML = L("CB_UNACTIVE_TEXT").replace("[CB_RATE]", cashbackMaxMinRate(data["merchant-info"].CBMinRate, data["merchant-info"].CBMaxRate));

    let activeText = document.createElement("span");
    activeText.className = "activate-cashback-actived-title";
    activeText.innerHTML = L("CB_ACTIVE_TEXT").replace("[CB_RATE]", cashbackMaxMinRate(data["merchant-info"].CBMinRate, data["merchant-info"].CBMaxRate));
    activeText.setAttribute("style", "display: none;");

    let hoverIcon = document.createElement("b");
    hoverIcon.setAttribute("style", `
        display: block;
        width: 20px;
        height: 20px;
        background: url(${chrome.extension.getURL("img/cashback-bg.png")}) -44px -86px no-repeat;
        margin-left: .375rem;
        cursor: pointer;
        position: relative;
        margin-top: 10px;
    `);
    let hoverText = document.createElement("span");
    hoverText.className = "__coupert-how-it-works-link";
    hoverText.innerHTML = L("HOW_IT_WORKS");

    let hoverContainer = document.createElement("span");
    hoverContainer.className = "__coupert-hover-tips";
    hoverContainer.appendChild(hoverIcon);
    hoverContainer.appendChild(hoverText);

    let container = document.createElement("div");
    container.className = "__coupert-cashback-container";
    container.appendChild(icon);
    container.appendChild(unactiveText);
    container.appendChild(activeText);
    container.appendChild(hoverContainer);

    let main = document.createElement("div");
    main.className = "__coupert-container";
    main.appendChild(container);

    return main;
}

function injectCbButtonHtml(element, method = "append", data){
    chrome.runtime.sendMessage({"action":"check-if-user-logged"}, function(response){
        if ('YES' === response['is-login'] && 'YES' == Cookies.get('cb_activate')) {
            return ;
        }
        injectCBHTML(element, method, data);
    });
}

function injectCBHTML(element, method = "append", data) {
    chrome.runtime.sendMessage({"action":"service:cbInjectImpr", "domain": data["domain"], "url": window.location.href});
    let html = generateCbInjectContainer(data);
    switch(method){
        case "prepend":
            $(element).find(".__coupert-container").remove();
            $(element).prepend(html);
            break;
        case "append":
            $(element).find(".__coupert-container").remove();
            $(element).append(html);
            break;
        case "before":
            $(element).parent().find(".__coupert-container").remove();
            $(element).before(html);
            break;
        case "after":
            $(element).parent().find(".__coupert-container").remove();
            $(element).after(html);
            break;
        default:
            $(element).find(".__coupert-container").remove();
            $(element).append(html);
            break;
    }
    chrome.runtime.sendMessage({"action":"check-if-user-logged"}, function(response){
        if ("YES" === response["is-login"] && "YES" === getCookie("cb_activate")) {
            setInjectCbButtonActived();
        }
    });

    $(".__coupert-hover-tips").unbind('hover').hover(function(){
        $(this).find(".__coupert-how-it-works-link").show();
        chrome.runtime.sendMessage({action:"statistics:log", data:{
            action: 'impr',
            param: 'cb-inject-button',
            domain: data['domain'],
            root_domain: data['root-domain']
        }});
    }, function(){
        $(this).find(".__coupert-how-it-works-link").hide();
    });

    $(".__coupert-how-it-works-link .canclick").unbind('click').click(function(){
        window.open(howItWorksURL + "cb-inject-button" + "&guid=" + guid(), '_blank');
        return false;
    });

    $(".__coupert-cashback-container").unbind('click').click(function(){
        chrome.runtime.sendMessage({"action":"set-service-used-cookie"});
        let trackingId = generateTrackingId('inject_cb_click');
        chrome.runtime.sendMessage({"action":"service:cbClick", "domain": data["domain"], "storeId": data["merchant-info"].ID, "clickType": "INJECT_CB", "trackingId":trackingId, "leastOrderAmount": data["merchant-info"].LeastOrderAmount, "cashbackPercentage": data["merchant-info"].CashBackPercentage});
        chrome.runtime.sendMessage({"action":"open-window", "url": data["merchant-info"]["url"]+"&tracking_id="+trackingId, "active":false, "rootDomain":data["root-domain"]});
        setAffiliateCookie({"domain": data["root-domain"]}, function(){});
        setCashbackCookie({"domain": data["root-domain"]}, function(){});
        var param = {};
        if ($("#__COUPERT_US_STORE__").is(":hidden")) {
            param["hide"] = "YES";
        }
        chrome.runtime.sendMessage({"action":"check-if-user-logged"}, function(response){
            if ("YES" == response["is-login"]) {
                setInjectCbButtonActived();
                chrome.runtime.sendMessage({"action":"render-cb-activated"});
                reloadingStorePopupPage(param);
            } else {
                setCookie("cb_click_at_inject_element", "YES", 20);
                reloadingStorePopupPage({});
            }
        });
        return false;
    });
}

function setInjectCbButtonActived(){
    $(".__coupert-cashback-container .activate-cashback-unactive-title").hide();
    $(".__coupert-cashback-container .activate-cashback-actived-title").show();
    delay(2000).then(function () {
        $('.__coupert-container').remove();
    });
}

function resetInjectCbButton(){
    $(".__coupert-cashback-container .activate-cashback-actived-title").hide();
    $(".__coupert-cashback-container .activate-cashback-unactive-title").show();
}

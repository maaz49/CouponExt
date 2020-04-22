const path = {
   'daily-check-in': 0,
};

var is_login = false;

var siteUrl = "";

var handlers = [];
var count_num = 0;
var no_code = false;
var StorePop = function(){
    var self = this;
    self.tabId = 0;
    self.domain = "";
    self.codeTotal = 0;
    self.showCodeTotal = 0;
    self.showCodeList = [];
    self.codeList = [];
    self.similarList = [];
    self.dealList = [];
    self.merchantInfo = {};
    self.storeInfo = {};
    self.cashBackPercentage = 0;
    self.at = "NO";
    self.cb = "NO";
    self.hasCashback = "NO";
    self.lang = "en_us";
    self.CookieOverride = "";
    self.rootDomain = "";
    self.fromCbPopupPage = "NO";
    self.fromAtTestResultPage = "NO";
    self.fromInjectElement = "NO";
    self.atTurnOff = "NO";

    self.init = function(tabId, data){
        self.tabId = tabId;
        self.data = data;
        self.domain = data["domain"];
        self.rootDomain = data["root-domain"];
        self.codeList = data["coupons"] || [];
        self.codeTotal = data["coupons"].length;
        self.similarList = data["similars"] || [];
        self.dealList = data["deals"] || [];
        self.merchantInfo = data["merchant-info"];
        self.storeInfo = data["store-info"];
        self.CookieOverride = data["cookie-overrided"];
        self.fromCbPopupPage = data["cb_click_at_popup_page"];
        self.fromAtTestResultPage = data["login_click_at_test_result_page"];
        self.fromInjectElement = data["cb_click_at_inject_element"];
        self.atTurnOff = data["at_turnoff"];
        self.lang = getUILanguage();
        self.rules = data["merchant-rules"] || [];
        self.cptURL = data['cpt_url'];
        self.lscptURL = data['ls_cpt_url'];
        self.clickPosition = data['click_position'] || '';
        self.url = data["url"];

        self.processData();
        self.show();
        self.replaceLinkHref();
        self.initShow();
    }

    self.initShow = function () {
        self.showChristmasModal();
        $('.nav-list-wrapper .share').hide();
    }

    self.showChristmasModal = function () {
        if ("YES" == Storages.localStorage.get('christmas-modal:done')) {
            return ;
        }
        $('.christmas-modal').show();
    }

    self.processData = function(){
        self.extractUsefulDataFromStoreInfo();
        self.processCodeList();
    }

    self.replaceLinkHref = function(){
        $(".how-it-works-link").each(function(){
            $(this).attr("href", howItWorksURL + $(this).attr("data-utm_content") + "&guid=" + guid());
        });
        $("a.privacy-policy").each(function(){
            $(this).attr("href", PRIVACY_POLICY_URL);
        });
        $("a.terms-of-use").each(function(){
            $(this).attr("href", TERMS_OF_USE_URL);
        });
    }

    self.extractUsefulDataFromStoreInfo = function(){
        self.cashBackPercentage = Math.ceil(parseFloat(self.merchantInfo.CashBackPercentage) * 100);
        if (1 == self.storeInfo.is_checkout && "YES" == self.storeInfo.at) {
            self.at = "YES";
        }
        if (1 == self.storeInfo.is_checkout && "YES" == self.storeInfo.is_cashback && "YES" == self.storeInfo.cb) {
            self.cb = "YES";
        }
        if ("YES" == self.storeInfo.is_cashback) {
            self.hasCashback = "YES";
        }
    }

    self.processCodeList = function(){
        self.showCodeList = self.getShowCodeList(self.codeList);
        self.showCodeTotal = self.showCodeList.length;
    }

    self.show = function(){
        self.showHomeModule();
        self.showSearchModule();
        self.showAcountModule();
        self.showCoupertNotAvailableModule();
        self.replacePlaceholderTextByLanguage();
        self.showBottomBalance();
        self.showSignInPanelWhenFromOtherPage();
        self.showPanelByClickPosition();
        self.showActivityModule();
    }

    self.showActivityModule = function () {
        var sudomain = getDomainFromURL(self.url);
        var domain = getRootDomain(sudomain);
        showDailyCheckInDetail(sudomain, domain);
    }

    self.showPanelByClickPosition = function () {
        switch (self.clickPosition) {
            case 'DailyCheckInOnWeb':
                self.showCheckInPanel();
                break;
            case 'no_cashback_no_saving_result':
                self.showLoginPanel();
                break;
            default:
                break;
        }
    }

    self.showLoginPanel = function () {
        $("#store_home_page,#store_search_page,#store_checkin_page").removeClass('nav-active');
        $("#account_user_page").addClass('nav-active');
        $(".store-account-box").show();
        $(".store-search-box").hide();
        $(".store-home-box, .check-in-box").hide();
        $(".store-deals-box").hide();
        $(".coupert-not-available-box").hide();
        $(".sign-in-before").show();
        $(".sign-in-after").hide();
    }

    self.showCheckInPanel = function () {
        var handler = setInterval(function() {
            if ($('#store_checkin_page').hasClass('nav-active')) {
                clearInterval(handler);
            }
            $('#store_checkin_page').click();
        }, 500);
    }

    self.showBottomBalance = function() {
        chrome.extension.getBackgroundPage().user.info({}, function(response){
            setCache("user_email", response.email);
            let balance = response.balance || 0;
            is_login = true;
            renderNewUserTasks(balance);

            if (response.exception_withdraw) {
                $(".withdraw-warning").show();
                $(".user-currrent-coupons").css("box-shadow","none");
            }
        }, function(response){
            is_login = false;
            renderNewUserTasks();
        });
    }

    self.replacePlaceholderTextByLanguage = function(){
        $("#review").attr("");
        $("input[type='email']").attr("placeholder", L("EMAIL"));
        $("input[type='password']").attr("placeholder", L("PASSWORD_PLACEHODLER"));
        $("#search-store-input").attr("placeholder", L("SEARCH_STORE"));
    }

    self.showSignInPanelWhenFromOtherPage = function(){
        if ("YES" == self.fromCbPopupPage || "YES" == self.fromAtTestResultPage || "YES" == self.fromInjectElement) {
            $("#store_home_page,#store_search_page,#store_checkin_page").removeClass('nav-active');
            $("#account_user_page").addClass('nav-active');
            $(".store-account-box").show();
            $(".store-search-box").hide();
            $(".store-home-box, .check-in-box").hide();
            $(".store-deals-box").hide();
            $(".coupert-not-available-box").hide();
            $(".sign-in-before").show();
            $(".sign-in-after").hide();
            chrome.tabs.sendMessage(self.tabId, {"action": "remove-cache-or-cookie", "cookie": ["cb_click_at_popup_page", "login_click_at_test_result_page", "cb_click_at_inject_element"]});
        }
    }

    self.showCoupertNotAvailableModule = function(){
        if ("YES" == self.CookieOverride) {
            $(".store-home-box, .check-in-box").hide();
            $(".store-search-box").hide();
            $(".store-account-box").hide();
            $(".store-deals-box").hide();
            if ("YES" == self.hasCashback) {
                ga('send', 'event', 'impression', 'cb_disabled_impr', '/cb/disabled/impr/' + self.domain, 1, {'nonInteraction': 1});
                $(".cashback-rate").html(cashbackMaxMinRate(self.merchantInfo.CBMinRate, self.merchantInfo.CBMaxRate) + " ");
                $("#sorry-reward-active").show();
                $(".activate-now").show();
            } else {
                ga('send', 'event', 'statistics', 'afsrc_impr', '/statistics/afsrc/impr/' + self.domain, 1, {'nonInteraction': 1});
                $(".re-activate").show();
            }
            $(".coupert-not-available-box, .desc-1").show();
        }
    }

    // show home module page
    self.showHomeModule = function(){
        self.showMerchantInfo();
        self.renderCodeList(self.showCodeList, ".store-coupon-list", self.merchantInfo.ID, self.domain, self.data);
        self.showCheckoutCodeTips();
        self.showCbModule();
        self.showAtModule();
        self.showNoCodeModule();
        self.showATEnableButton();
        self.showNewUserWelcomePanel();
        self.showModuleInCPSite();
    }

    self.showModuleInCPSite = function () {
        $('#welcome_task-lists').hide();
        $('.newcomer-benefits').hide();
        if (/(^|\.)coupert\./.test(getRootDomain(getDomainFromURL(self.url)))) {
            $(".store-home-box .container > div").hide();
            $(".store-home-box .container .coupert-box").show();
            let newInstaller = Storages.localStorage.get('extension:install');
            if (!!newInstaller) {
                renderNewUserTasks();
                $('.newcomer-benefits').show();
                ga('send', 'event', 'impression', 'welcome', '/welcome/impr/', 1, {'nonInteraction': 1});
            } else {
                $('#welcome_task-lists').show();
            }
        }
        showTrendingStores();
    }

    self.showNewUserWelcomePanel = function () {
        if (self.storeInfo.is_new_guid) {
            if ("YES" == Storages.localStorage.get('welcome_disabled')) {
                return ;
            }
            $('.new-user-wraper').show();
        }
    }

    self.showATEnableButton = function(){
        if ("YES" == self.atTurnOff && "YES" == self.at) {
            $(".store-codes-enable").show();
        }
    }

    // show some info about current store
    self.showMerchantInfo = function(){
        $(".store-home-domain").html(self.domain).attr("data-web-uri", self.merchantInfo.url).attr("href", self.merchantInfo.url);
    }

    self.showNoCodeModule = function(){
        if (self.codeTotal <= 0) {
            if (self.dealList.length > 0) {
                self.renderDealsList();
            }
            if (self.similarList.length > 0) {
                self.renderSimilarList();
            }
            if (0 == self.dealList.length && 0 == self.similarList.length) {
                $(".store-no-code").show();
                //$(".share-code-wraper").hide();
                if (!!self.storeInfo && "yes" == self.storeInfo.mer_switch) {
                    $("#no_code_site > b").html(self.storeInfo.merchant_name);
                    $(".no-code-tips").show();
                    $('.no-code-how-it-works-tips').show();
                    $('.no-code-activity-tips').show();
                } else {
                    $(".no-support-tips").show();
                        chrome.tabs.query({active:true,currentWindow:true},function(tabs){
                            chrome.tabs.sendMessage(tabs[0].id,{"action":"get_stores"},function(response){
                                
                            });
                        });
                    $.each(trending, function(_, index) {
                        var trendHtml =
                        `<div class="col-xs-4">
                            <div class="brands-logos">
                                <a href="#" class="trendUrl" data-url="` +
                                index.store_url +`"><img src="` +index.image_url +`" /></a>
                            </div>
                        </div>`;
                        $(".no-support-tips").append(trendHtml);
                    });
                    $('.how-it-works-tips').show();
                    $('.not-support-activity-tips').show();
                    $(".store-home-domain").text(getDomainFromURL((self.url)));
                    $("#logo-left").show();
                }
                $('#top-check-in').hide();
                no_code = true;
                showTaskList();
            }
        }
    }

    self.renderDealsList = function(){
        var html = "";
        $(self.dealList).each(function(index,item){
            html += '<li class="storedealDetail">';
            html += '<p>' + item.Title + '</p>';
            html += '<button class="go-to-shop" deal_id="' + item.ID + '">' + L("SEE_DEALS") + '</button>';
            html += '</li>';
        });
        $(".deals-list").html(html);
        $(".deals-list").show();
        $(".storedealDetail").click(function(){
            if ("YES" == self.data["store-info"].is_cashback) {
                chrome.tabs.sendMessage(self.tabId, {"action": "set-cashback-cookie", "domain": self.data["root-domain"]});
                chrome.extension.getBackgroundPage().user.info({}, function(response){
                    $(".reward-activated-box").show();
                    $(".earn-up-cashback").hide();
                    chrome.tabs.sendMessage(self.tabId, {"action":"render-cb-activated"});
                    chrome.tabs.sendMessage(self.tabId, {"action":"set-inject-cb-button-actived"});
                });
            }
            chrome.tabs.sendMessage(self.tabId, {"action": "set-affiliate-cookie", "domain": self.rootDomain, "relation": "self"});
            var dealId = $(this).find("button").attr('deal_id');
            var trackingId = generateTrackingId('deal_click');
            chrome.extension.getBackgroundPage().service.dealClick(self.merchantInfo.ID, dealId, trackingId, getCache("user_email"));
            var deal_url=(self.merchantInfo.url+'&bz=CPDEALS&tracking_id='+trackingId).replace(/store-\d+\.html/,'store-'+dealId+'.html');
            window.open(deal_url);
            return false;
        });
    }

    // if similar not null, show similar list
    self.renderSimilarList = function(){
        var html = "";
        $(".store-name").html(self.domain);
        $("#similar_store").html(L("SIMILAR_SHOPS") + ` <span class='store-name'>${self.domain}</span>`);
        $("#similar_title2").html(("fr" == getUILanguage() || "pt" == getUILanguage()) ? L("COUPONS") + self.domain : self.domain + L("COUPONS"));
        $(self.similarList).each(function(index,item){
            html += '<li class="similar_site_button"><div class="similar-logo"><img src="' + img_host + '/mimg/merimg/s_' + item.Logo + '?w=170"></div>';
            html += '<div class="similar-box-r"><p>${title}</p><button class="go-to-shop similar_href" date_id=' + item.DealID + '>${go_to_deal}</button></div> </li>';
        });
        $(".similar-store-list").html(html);
        $(".similar-box").show();
        $(".similar_site_button").click(function(){
            var deal_id=$(this).find('button').attr('date_id');
            var deal_url=(self.merchantInfo.url+'&bz=CPDEALS').replace(/store-\d+\.html/,'store-'+deal_id+'.html');
            window.open(deal_url);
        });
    }

    // if no all code is show, show leave code number on page bottom
    self.showCheckoutCodeTips = function(){
        var rules = self.rules.filter(function (item) {
            return item.MerchantType == 'AT';
        });
        if (rules.length > 0 && self.codeTotal > 0) {
            $(".store-coupon-count-haveat").show();
        } else if (self.codeTotal > 0) {
            $(".store-coupon-count").show();
        }
    }

    // if curent store is at, show test button
    self.showAtModule = function(){
        if ("YES" == self.at && self.codeTotal > 0) {
            chrome.tabs.sendMessage(self.tabId, {"action": "check-web-flag","web-flag": self.storeInfo.web_flags}, function(response){
                if (!!response) {
                    var cashbackCodeTotal = self.codeTotal > 10 ? 10 : self.codeTotal;
                    $(".cashback-codes").html(cashbackCodeTotal);
                    if ("YES" == self.hasCashback) {
                        $(".cashback-rate").html(cashbackMaxMinRate(self.merchantInfo.CBMinRate, self.merchantInfo.CBMaxRate) + " ");
                        $("#coupon-cashback").show();
                    }
                    $(".coupons-found-with-cashback").show();
                }
            });
        }
    }

    self.showCbModule = function(){
        if ("YES" == self.hasCashback) {
            $(".cashback-rate").html(cashbackMaxMinRate(self.merchantInfo.CBMinRate, self.merchantInfo.CBMaxRate) + " ");
            chrome.extension.getBackgroundPage().user.info({}, function(response){
                setCache("user_email", response.email);
                chrome.tabs.sendMessage(self.tabId, {"action": "get-cache-or-cookie", "cookie": "cb_activate"}, function(cookie){
                    if ("YES" == cookie["cb_activate"]) {
                        $(".reward-activated-box").show();
                        $(".earn-up-cashback").hide();
                    } else {
                        $(".reward-activated-box").hide();
                        if ("YES" != self.at) {
                            $(".earn-up-cashback").show();
                        }
                    }
                });
            }, function(response){
                $(".reward-activated-box").hide();
                if ("YES" != self.at) {
                    $(".earn-up-cashback").show();
                }
            });
        }
    }

    // search page module operation
    self.showSearchModule = function(){
        self.renderHotDeals();
    }

    self.renderHotDeals = function () {
        chrome.extension.getBackgroundPage().home.hotDeals()
        .then(function(deals){
            var html = "";
            try {
                $(deals).each(function(index, item){
                    var merchantLogo = !!item.Logo ? item.Logo : "default.png";
                    html += `<li class="store-item" deal-id="${item.id}" subdomain="${item.subdomain}">`;
                    html += '<div class="store-info">'
                    html += `<a href="javascript:void(0);" class="store-logo"><img src="${(imgURL + '/mimg/merimg/s_' + merchantLogo)}" alt="${item.description}"></a>`;
                    if (!!item.clicked) {
                        html += '  <div class="shop-btn-viewed">' + '+3 '+ M("shop_btn_gold") + '<b></b></div>';
                    } else {
                        html += '  <div class="shop-btn-viewed" style="display: none;">'+ '+3 '+ M("shop_btn_gold") + '<b></b></div>';
                        html += '  <div class="shop-btn"><b></b>' +  '+3 ' + M("shop_btn_gold") + '</div>';
                    }
                    html += '</div>' ;
                    html += '  <div class="store-name">';
                    html += '       <p class="store-domain">'+ item.description +'</p>';
                    html += '  </div>' ;
                    html += '</li>';
                });
            } catch (e) {
                console.log(e);
            }
            $(".store-list").html(html);
            $(".trending-store-list").html(html);
            $(".trending-store-box").show();
            // add click listener
            $(".store-item").click(function(){
                var self = this;
                chrome.extension.getBackgroundPage().user.token(function(response){
                    let dealId = $(self).attr("deal-id");
                    let trackingId = generateTrackingId('reactive_coupert_click');
                    var url = `${baseURL}/out/${dealId}?pt=apistore&pv=testcodes&a=1&from=ext&tracking_id=${trackingId}`;
                    window.open(url);
                    let subdomain = $(self).attr("subdomain");
                    ga('send', 'event', 'click', 'activity', '/activity/click/view-hot-deals/' + subdomain, 1, {'nonInteraction': 1});
                    chrome.extension.getBackgroundPage().service.hotDealClick(dealId, trackingId);
                    $(self).find(".shop-btn").hide();
                    $(self).find(".shop-btn-viewed").show();
                    $(".view-gold-wrap").css("display","flex");
                    $(self).css({
                        'cursor': 'default',
                        'pointer-events': 'none'
                    });
                }, function() {
                    $('#account_user_page').click();
                });
            });

            // add 3.25
            $(".view-gold-wrap .modal-close-btn").click(function () {
                $(this).parent('.view-gold-wrap').hide();
            });
        });
    }

    /* common function in this class*/
    // get IsShow field equal "YES" CodeList
    self.getShowCodeList = function(codeList){
        var showCodeList = [];
        for (var i = 0; i < codeList.length; i++) {
            var item = codeList[i];
            if ("YES" == item.IsShow) {
                showCodeList.push(item);
            }
        }
        return self.analyzeCodeWorkTime(showCodeList);
    }

    // analyze code work time info, example worked just now; worked 19 hours ago
    self.analyzeCodeWorkTime = function(codeList){
        $(codeList).each(function(index,item){
            if (parseInt(item.workedTime) > 0) {
                if (parseInt(item.workedTimeDays) > 0) {
                    if (parseInt(item.workedTimeDays) > 30) {
                        codeList[index]["workedTimeInfo"] = L('VERIFIED');
                    } else {
                        codeList[index]["workedTimeInfo"] = L('WORKED') + L('SUB_WORKED') + ' ' + item.workedTimeDays + ' ' + ((parseInt(item.workedTimeDays) > 1 ? L('DAYS') : L('DAY'))) + ' ' + L('AGO');
                    }
                } else {
                    if (parseInt(item.workedTimeHours) > 0) {
                        codeList[index]["workedTimeInfo"] = L('WORKED') + L('SUB_WORKED') + ' ' + item.workedTimeHours + ' ' + ((parseInt(item.workedTimeHours) > 1) ? L('HOURS') : L('HOUR')) + ' ' + L('AGO');
                    } else {
                        codeList[index]["workedTimeInfo"] = ((parseInt(item.workedTime) > 1) ? (L('WORKED') + L('SUB_WORKED') + ' ' + item.workedTime + ' ' + L('MINUTES') + ' ' + L("AGO")) : (L('WORKED') + ' ' + L('JUST_NOW')));
                    }
                }
            } else {
                if ("0000-00-00 00:00:00" != item.StartWorkTime) {
                    codeList[index]["workedTimeInfo"] = L('WORKED') + ' ' + "1" + ' ' + L('MINUTES') + ' ' + L('AGO');
                } else {
                    codeList[index]["workedTimeInfo"] = L('VERIFIED');
                }
            }
        });
        return codeList;
    }

    /**
     * render code list to page
     * @param  {array} codeList     code list need render
     * @param  {string} element     which element need render
     * @return null
     */
    self.renderCodeList = function(codeList, element, merchantId, merchantDomain, data){
        var html = "";
        $(codeList).each(function(index,item){
            html += '<li class="item-code" data-code-id="'+item.ID+'" data-merchant-id="'+merchantId+'" " data-merchant-domain="'+merchantDomain+'" data-clipboard-text="'+item.Code+'">';
            html += '<div class="code-show" data-clipboard-text="'+item.Code+'"><div class="code-title">'+item.Code+'</div>';
            if(!!item.Title){
            html += '<p class="code-detail">'+item.Title+'</p>';
            }
            if (!!item.workedTimeInfo) {
                html += '<p class="worked"><span class="star"></span>&nbsp;&nbsp;<span class="worked-time">'+item.workedTimeInfo+'</span></p>';
            }
            html += '</div>';
            html +='<button class="copy">'+L("COPY")+'</button>'
            html += '</li>';
        });
        $(element).html(html);

        $('.item-code[data-code-id]').click(function(){
            let itemElemet = this;
            ga('send', 'event', 'click', 'cc_click', '/cc/click/' + $(this).attr("data-merchant-domain"), 1, {'nonInteraction': 1});
            var clipboard = new Clipboard(".item-code");
            clipboard.on('success', function(e) {
            });
            clipboard.on('error', function(e) {
            });
            $(this).find('.copy').html(L("COPIED"));
            $(this).siblings().find('.code-title').each(function(){
                $(this).parent().next().html(L("COPY"));
            });
            if (!!data) {
                if ("YES" == data["store-info"].is_cashback) {
                    chrome.tabs.sendMessage(self.tabId, {"action": "set-cashback-cookie", "domain":data["root-domain"]});
                    chrome.extension.getBackgroundPage().user.info({}, function(response){    
                        setCache("user_email", response.email);
                        $(".reward-activated-box").show();
                        $(".earn-up-cashback").hide();
                        chrome.tabs.sendMessage(self.tabId, {"action":"render-cb-activated"});
                        chrome.tabs.sendMessage(self.tabId, {"action":"set-inject-cb-button-actived"});
                    });
                }
            }

            let trackingId = generateTrackingId("cc_click");
            chrome.extension.getBackgroundPage().service.ccClick($(itemElemet).attr("data-merchant-id"), $(itemElemet).attr("data-code-id"), trackingId, getCache("user_email")); // cc-click log
            chrome.tabs.sendMessage(self.tabId, {"action": "set-affiliate-cookie", "domain": self.rootDomain, "relation": "self"}, function(response){
                if ("competitor" == response.status) {
                    chrome.extension.getBackgroundPage().openWindow(self.merchantInfo.url + "&tracking_id=" + trackingId, false, self.rootDomain);
                }
            });
        });
    }
    /* common function in this class*/

    self.showAcountModule = function(){
        chrome.extension.getBackgroundPage().user.token(function(response){
            $(".sign-in-after .gold").addClass("account-active");
            $(".sign-in-after .account").removeClass("account-active");
            $(".account-gold-box").show();
            $(".account-settings-box").hide();
            showUserInfo(response, self.tabId, self.storeInfo, self.rootDomain, self.domain);
        }, function(){
            $(".first-order").hide();
            $(".first-order-active").hide();
            $(".first-order-actived").hide();
            if ("YES" == self.storeInfo.is_cashback) {
                $('.first-order-active').show();
                $(".first-order").show();
                $('.first-order-tips').hide();
                if ('YES' != Storages.localStorage.get('first_order_tips_closed')) {
                    $('.first-order-tips').show();
                }
                Storages.localStorage.set('first_order_tips_closed', 'YES');
                delay(10000).then(function() {
                    $('.first-order-tips').hide();
                });
            }
            $(".sign-in-before").show();
            $(".sign-in-after").hide();
        });
    }
}

function countdowner() {
    $(".count-down").hide();
    chrome.extension.getBackgroundPage().activity.info()
    .then((response) => {
        $(".count-down").show();
        let counter = response.firstOrder.countdown;
        if (counter <= 0) {
            $(".count-down").hide();
            return ;
        }
        let handler = setInterval(function () {
            let time = countdownDevice(counter);
            let days = time.days;
            let hours = time.hours;
            let minutes = time.minutes;
            let seconds = time.seconds;
            // 72 : 00 : 00
            $('.count-down > b').text((parseInt(days) * 24 + parseInt(hours)) + " : " + minutes + " : " + seconds);
            counter --;
            if (counter <= 0) {
                $(".count-down").hide();
                clearInterval(handler);
            }
        }, 1000);
    });
}
/*-------------------------- birthdat init --------------------------*/
$(function () {
   new YMDselect('year','month','day');
});
/*------------------------------ > ^_^ < -----------------------------*/
function showUserInfo(data, tabId, storeInfo, rootDomain, domain){
    $(".sign-in-before").hide();
    $(".sign-in-after").show();
    $("#invite-friend-link input").val(baseURL + "/ref/" + data.Ref);
    $("#invite-friend-link").attr("data-clipboard-text", baseURL + "/ref/" + data.Ref);
    // replace ref in share url
    $("#share-module > li.messages > a").attr("href", messagesShareURL.replace(/\{REF\}/g, data.Ref));
    $("#share-module > li.facebook > a").attr("href", facebookShareURL.replace(/\{REF\}/g, data.Ref));
    $("#share-module > li.twitter > a").attr("href", twitterShareURL.replace(/\{REF\}/g, data.Ref));
    $("#share-module > li.email > a").attr("href", emailShareURL
        .replace('[[subject]]', M('share_email_title'))
        .replace('[[body]]', M('share_email_desc')
            .replace('[[ref]]', data.Ref)
        )
    );

    $(".nav-list-wrapper .share a.messages").attr("href", messagesShareURL.replace(/\{REF\}/g, data.Ref));
    $(".nav-list-wrapper .share a.facebook").attr("href", facebookShareURL.replace(/\{REF\}/g, data.Ref));
    $(".nav-list-wrapper .share a.twitter").attr("href", twitterShareURL.replace(/\{REF\}/g, data.Ref));
    $(".nav-list-wrapper .share a.share-email").attr("href", emailShareURL
        .replace('[[subject]]', M('share_email_title'))
        .replace('[[body]]', M('share_email_desc')
            .replace('[[ref]]', data.Ref)
        )
    );
    $('.nav-list-wrapper .share').show();
    $('#current-gold').html(thousandsFormat(data.current_balance));
    $('#pending-gold').html(thousandsFormat(data.pending_gold));
    $('#confirmed-gold').html(thousandsFormat(data.left_confirmed_gold));
    $('#withdraw-able-gold').html(thousandsFormat(data.withdraw_able_gold));

    $(".account-withdraw").removeClass("theme-color");
    $("#account_user_page .gold-prompt").hide();
    $('.account-gold-box .credit-card .new-flag').hide();
    if (1 == data.withdraw) {
        $(".account-withdraw").addClass("theme-color");
        $("#account_user_page .gold-prompt").show();
    }

    if(data.FacebookAccount){
        $("#fbaccount").val(data.FacebookAccount);
    }
    if (data.watch_demo == "YES") {
        $(".try-demo").addClass("complete");
    }
    if (data.complete_profile == "YES") {
        $(".complete-profile").addClass("complete");
    }
    $('.first-order-progress').removeClass('complete');
    if (data.first_order_done) {
        $('.first-order-progress').hide();
    }

    $(".first-order").hide();
    if (!data.first_order_done && "YES" == storeInfo.is_cashback) {
        $(".first-order-active").hide();
        $(".first-order-actived").hide();
        chrome.tabs.sendMessage(tabId, {action: "Cookies-get", name: "first_order_actived", options: {domain: rootDomain}}, function (response) {
            var value = response.value;
            if ("YES" == value) {
                $(".first-order-actived").show();
            } else {
                $('.first-order-active').show();
            }
        });
        $(".first-order").show();
    }

    $(".deafult-user-img > img, .user-img > img").attr("src", (!!data.HeadImg ? ("https://www.coupert.com/photo/"+data.HeadImg) : "/img/user-img.png"));

    $("#firstname").html(data.FullName || data.FirstName);
    $("#name").val(data.FullName);
    $("#lastname").html(data.LastName);
    $("#useremail").html(data.Email);
    if (data.Gender == 'MALE') {
        $('#male').attr("checked", true);
    } else {
        $('#female').attr("checked", true);
    }
    var userYear = new Date(data.Birthday).getFullYear();
    var userMonth = new Date(data.Birthday).getMonth() + 1;
    var userDay = new Date(data.Birthday).getDate();
    new YMDselect('year','month','day',userYear,userMonth,userDay);
    chrome.extension.getBackgroundPage().user.info({}, function(response){
        is_login = true;
        if (!!response) {
            setCache("user_email", response.email);

            if ("YES" == storeInfo.is_cashback) {
                chrome.tabs.sendMessage(tabId, {"action": "get-cache-or-cookie", "cookie": "cb_activate"}, function(cookie){
                    if ("YES" == cookie["cb_activate"]) {
                        // cb active
                        $(".reward-activated-box").show();
                        $(".earn-up-cashback").hide();
                        chrome.tabs.sendMessage(tabId, {"action":"render-cb-activated"});
                        chrome.tabs.sendMessage(tabId, {"action":"set-inject-cb-button-actived"});
                    } else {
                        if ("YES" == data.cb && "YES" != data.at) {
                            $(".reward-activated-box").hide();
                            $(".earn-up-cashback").show();
                        }
                    }
                });
            }
            let balance = response.balance || 0;
            let tasks = typeC(response.tasks) == 'object' ? response.tasks : {};
            Storages.localStorage.set('extension:tasks', tasks);
            renderNewUserTasks(balance);
        }
    },function(response){
        renderNewUserTasks();
    });
    $(".processing").css("width", (($(".complete").length / 7) * 100).toString() + "%");
}

function showSearchCodeList(domain){
    var url = "https://" + domain;
    chrome.extension.getBackgroundPage().store.info(domain, url, "", function(storeInfo) {
        chrome.extension.getBackgroundPage().store.codes(domain, url, function(response){
            $("#ad-panel").hide();
            $("#code-panel .earn-up-cashback").hide();
            $("#code-panel .store-coupon-count").hide();
            $("#code-panel .store-coupon-count-haveat").hide();
            $("#code-panel .store-coupon-list").hide();
            $("#code-panel .store-no-code").hide();
            $("#code-panel").show();
            $("#code-panel .store-home-domain").html(response.merinfo.Domain).attr("data-web-uri", response.merinfo.url).attr("href", response.merinfo.url);

            $("#code-panel .cashback-rate").html(cashbackMaxMinRate(response.merinfo.CBMinRate, response.merinfo.CBMaxRate) + " ");
            $("#code-list-store-rewards-active").attr("data-web-uri", response.merinfo.url);
            if ("YES" == storeInfo.is_cashback) {
                $("#code-panel .earn-up-cashback").show();
            }
            if (!!response.coupons.codes && response.coupons.codes.length > 0) {
                var s = new StorePop();
                var showCodeList = s.getShowCodeList(response.coupons.codes);
                s.renderCodeList(showCodeList, "#code-panel .store-coupon-list", response.merinfo.ID, response.merinfo.DomainSub);
                $("#code-panel .store-coupon-list").show();
                var rules = (response.merrules || []).filter(function (item) {
                    return item.MerchantType == 'AT';
                });
                if (rules.length > 0) {
                    $("#code-panel .store-coupon-count-haveat").show();
                } else {
                    $("#code-panel .store-coupon-count").show();
                }
            } else {
                $("#code-panel .store-no-code").show();
            }
        });
    });
}

/*------------------------------ entrance ---------------------------*/
    chrome.tabs.getCurrent(function(tab) {
        execute(tab.id, tab.url);
    });

    function execute(tabId, url){
        chrome.tabs.sendMessage(tabId, {"action": "get-cache-or-cookie",
            "session-cache": [
                "domain",
                "root-domain",
                "store-info",
                "merchant-info",
                "coupons",
                "similars",
                "deals",
                "merchant-rules",
                "cpt_url",
                "cookie-overrided",
            ],
            "local-cache": [
                "ls_cpt_url"
            ],
            "cookie": [
                "at_turnoff",
                "cb_click_at_popup_page",
                "login_click_at_test_result_page",
                "cb_click_at_inject_element",
                'click_position'
            ]
        }, function (data){
            console.log(data);
            data.url = url;
            siteUrl = url;
            countdowner(url);
            analyzeStoreInfo(data);
            var sp = new StorePop();
            sp.init(tabId, data);
            eventListener(tabId, data);
            chrome.extension.getBackgroundPage().statistics.log({action: 'impr', param: 'christmas_cc_banner', domain: data['domain'], root_domain: data['root-domain']});
        });
    }

    function analyzeStoreInfo(data){
        if (1 == data["store-info"].is_checkout && "YES" == data["store-info"].at) {
            data["at"] = "YES";
        }
        if (1 == data["store-info"].is_checkout && "YES" == data["store-info"].is_cashback && "YES" == data["store-info"].cb) {
            data["cb"] = "YES";
        }
        if ("YES" == data["store-info"].is_cashback) {
            data["hasCashback"] = "YES";
        }
    }
/*------------------------------ > ^_^ < -----------------------------*/

(function () {
    $('[ga-category][ga-action][ga-label]').click(function() {
        var category = $(this).attr('ga-category');
        var action = $(this).attr('ga-action');
        var label = $(this).attr('ga-label');
        if (category && action && label) {
            ga('send', 'event', category, action, label, 1, {'nonInteraction': 1});
        }
    });
})();

(function toggleCheckInRemindSwitch() {
    let value = Storages.localStorage.get('check_in_remind');
    value = value === 'on' ? 'on' : 'off';
    if ('on' === value) {
        $('.remind-turn').addClass("on");
    } else {
        $('.remind-turn').removeClass("on");
    }
})();

(function CheckInRemindSwitchClickListner() {
    $(".remind-turn").click(function () {
        $(this).toggleClass("on");
        let value = Storages.localStorage.get('check_in_remind');
        value = value === 'on' ? 'off' : 'on';
        Storages.localStorage.set('check_in_remind', value);
        chrome.extension.getBackgroundPage().statistics.remindCheckIn({
            type: 'CheckIn',
            status: value
        }).catch((e) => {});
    });
})();

/*-------------------------- event listener --------------------------*/
    function eventListener(tabId, data){
        $(".close").click(function (){
            chrome.tabs.sendMessage(tabId, {"action": "hide-iframe", "iframe":["__COUPERT_US_STORE__"]});
        });

        $(".store-home-domain").click(function(){
            if (!!$(this).attr("data-web-uri")) {
                let trackingId = generateTrackingId('merchatn_click');
                ga('send', 'event', 'click', 'cc_logo_click', '/cc/logo/click/' + data["domain"], 1, {'nonInteraction': 1});
                chrome.extension.getBackgroundPage().service.merchantClick(data['merchant-info'].ID, trackingId, getCache("user_email"));
                chrome.extension.getBackgroundPage().openWindow($(this).attr("data-web-uri") + "&tracking_id=" + trackingId);
            }
            return false;
        });

        $(".test-codes").click(function(){
            ga('send', 'event', 'click', 'cc_test_click', '/cc/testcode/click/' + data["domain"], 1, {'nonInteraction': 1});
            chrome.tabs.sendMessage(tabId, {"action": "set-affiliate-cookie", "domain": data["root-domain"], "relation": "self"});
            if ("YES" == data["store-info"].is_cashback) {
                chrome.tabs.sendMessage(tabId, {"action": "set-cashback-cookie", "domain":data["root-domain"]});
            }
            Storages.localStorage.set('welcome_disabled', 'YES');
            ls.set("batch-number", batchNumber());
            let trackingId = generateTrackingId('cc_at_click');
            chrome.extension.getBackgroundPage().openWindow(data["merchant-info"].url+"&tracking_id="+trackingId, false, data["root-domain"]);
            chrome.extension.getBackgroundPage().service.atClick(data["merchant-info"].ID, "CC_TEST_CODE", trackingId, getCache("user_email")); // at-click log
            chrome.tabs.sendMessage(tabId, {"action": "reloading-store-popup-page"});
            chrome.tabs.sendMessage(tabId, {"action": "show-at-testing-page"});
        });

        $("#store_location_switch").click(function(){
            ga('send', 'event', 'other', 'switchpos', '/other/switchpos/' + data["domain"], 1, {'nonInteraction': 1});
            chrome.tabs.sendMessage(tabId, {"action": "switch-panel-location", "iframe":"__COUPERT_US_STORE__"});
        });

        // home
        $("#store_home_page").click(function(){
            ga('send', 'event', 'navigation', 'home', '/navigation/click/home', 1, {'nonInteraction': 1});
            $("#store_search_page,#account_user_page,#store_checkin_page").removeClass('nav-active');
            $(this).addClass('nav-active');
            $(".store-search-box").hide();
            $(".store-account-box").hide();
            $(".store-deals-box, .check-in-box").hide();
            chrome.tabs.sendMessage(tabId, {"action": "get-cache-or-cookie", "session-cache": ["cookie-overrided"]}, function(cache){
                if ("YES" == cache["cookie-overrided"]) {
                    $(".store-home-box").hide();
                    $(".coupert-not-available-box").show();
                } else {
                    $(".store-home-box").show();
                    $(".coupert-not-available-box").hide();
                }
            });
        });

        $("#store-rewards-active").click(function(){
            chrome.extension.getBackgroundPage().setServiceUsedCookie();
            ga('send', 'event', 'click', 'cc_activate_click', '/cc/activate/click/' + data["domain"], 1, {'nonInteraction': 1});
            if(!!data["merchant-info"].url){
                chrome.tabs.sendMessage(tabId, {"action": "set-affiliate-cookie", "domain": data["root-domain"], "relation": "self"});
                if ("YES" == data["store-info"].is_cashback) {
                    chrome.tabs.sendMessage(tabId, {"action": "set-cashback-cookie", "domain":data["root-domain"]});
                }
                let trackingId = generateTrackingId('store_cb_click');
                chrome.extension.getBackgroundPage().openWindow(data["merchant-info"].url+"&tracking_id="+trackingId, false, data["root-domain"]);
                chrome.extension.getBackgroundPage().service.cbClick(data["domain"], data["merchant-info"].ID, "STORE_CB", trackingId, data["merchant-info"].LeastOrderAmount, data["merchant-info"].CashBackPercentage, "0", getCache("user_email")); // cb-click log
                chrome.extension.getBackgroundPage().user.info({}, function(response){
                    setCache("user_email", response.email);
                    chrome.tabs.sendMessage(tabId, {"action":"set-inject-cb-button-actived"});
                    $(".reward-activated-box").show();
                    $(".earn-up-cashback").hide();
                }, function(){
                    $("#store_home_page,#store_search_page,#store_checkin_page").removeClass('nav-active');
                    $("#account_user_page").addClass('nav-active');
                    $(".store-account-box").show();
                    $(".store-search-box").hide();
                    $(".store-home-box, .check-in-box").hide();
                    $(".store-deals-box").hide();
                    $(".coupert-not-available-box").hide();
                    $(".sign-in-before").show();
                    $(".account-box").show();
                    $(".log-in-box").show();
                    $(".sign-up-box").hide();
                    $("#account-log-in").addClass("active");
                    $("#account-sign-up").removeClass("active");
                    $(".reset-password-box").hide();
                    $(".sign-in-after").hide();
                });
            }
        });

        $(".list-item .feedback").click(function(){
            ga('send', 'event', 'statistics', 'feedback', '/statistics/feedback/impr/store/' + data["domain"], 1, {'nonInteraction': 1});
            ga('send', 'event', 'statistics', 'setting', '/statistics/setting/click/submit-feedback', 1, {'nonInteraction': 1});
            chrome.tabs.sendMessage(tabId, {"action": "show-feedback-page"});
        });

        $("#store_search_page").click(function(e){
            if(!!e.originalEvent) {
                ga('send', 'event', 'navigation', 'view-hot-deals', '/navigation/click/view-hot-deals', 1, {'nonInteraction': 1});
            }
            ga('send', 'event', 'click', 'store_search_click', '/store/search/click/' + data["domain"], 1, {'nonInteraction': 1});
            $("#store_home_page,#account_user_page,#store_checkin_page").removeClass('nav-active');
            $(this).addClass('nav-active');
            $(".store-home-box, .store-account-box, .store-deals-box, .coupert-not-available-box, #code-panel, .check-in-box").hide();
            $("#search-store-cancel").removeClass('cur');
            $("#search-close").show();
            $("#search-store").attr('placeholder','Search Store').val('');
            $(".trending-store-box").show();
            $(".store-search-box").show();
            $("#ad-panel").show();
            $(".stores").show();
            $("#search-store-cancel").hide();
            $("#search-store-input").val("");
            $(".search-result-list").hide();
        });

        $(".come-back").click(function(){
            ga('send', 'event', 'click', 'store_search_goback', '/store/search/goback/click/' + data["domain"], 1, {'nonInteraction': 1});
            $("#store_home_page,#account_user_page").removeClass('nav-active');
            $(this).addClass('nav-active');
            $(".store-home-box, .store-account-box, .store-deals-box, .coupert-not-available-box, #code-panel, .check-in-box").hide();
            $("#search-store-cancel").removeClass('cur');
            $("#search-close").show();
            $("#search-store").attr('placeholder','Search Store').val('');
            $(".trending-store-box").show();
            $(".store-search-box").show();
            $("#ad-panel").show();
            $(".stores").show();
            $("#search-store-cancel").hide();
            $("#search-store-input").val("");
            $(".search-result-list").hide();
        });

        $(".list-item .account").click(function(){
            ga('send', 'event', 'statistics', 'setting', '/statistics/setting/click/my-account', 1, {'nonInteraction': 1});
            $("#store_home_page,#store_search_page,#store_checkin_page").removeClass('nav-active');
            $("#account_user_page").addClass('nav-active');
            $(".store-account-box").show();
            $(".store-search-box").hide();
            $(".store-home-box, .check-in-box").hide();
            $(".store-deals-box").hide();
            $(".coupert-not-available-box").hide();
            $(".sign-in-after .gold").addClass("account-active");
            $(".sign-in-after .account").removeClass("account-active");
            $(".account-gold-box").show();
            $(".account-settings-box").hide();
            chrome.extension.getBackgroundPage().user.token(function(response){
                is_login = true;
                showUserInfo(response, tabId, data["store-info"], data["root-domain"], data["domain"]);
            }, function(){
                is_login = false;
                $(".sign-in-before").show();
                $(".sign-in-after").hide();
            });
        });

        $("#account_user_page").click(function(e){
            ga('send', 'event', 'account', 'impr', '/account/impr/' + data["domain"], 1, {'nonInteraction': 1});
            if(!!e.originalEvent) {
                ga('send', 'event', 'navigation', 'account-center', '/navigation/click/account-center', 1, {'nonInteraction': 1});
                chrome.extension.getBackgroundPage().statistics.log({action: 'click', param: 'account-icon', domain: data['domain'], root_domain: data['root-domain']});
            }
            $("#store_home_page,#store_search_page,#store_checkin_page").removeClass('nav-active');
            $("#account_user_page").addClass('nav-active');
            $(".store-account-box").show();
            $(".store-search-box").hide();
            $(".store-home-box, .check-in-box").hide();
            $(".store-deals-box").hide();
            $(".coupert-not-available-box").hide();
            $(".sign-in-after .gold").addClass("account-active");
            $(".sign-in-after .account").removeClass("account-active");
            $(".account-gold-box").show();
            $(".account-settings-box").hide();
            chrome.extension.getBackgroundPage().user.token(function(response){
                showUserInfo(response, tabId, data["store-info"], data["root-domain"], data["domain"]);
            }, function(){
                $(".sign-in-before").show();
                $(".sign-in-after").hide();
            });
        });

        $("#account-log-in, #account-sign-up, #reset-log-in, #reset-sign-up, .sign-up-now").click(function(){
            if ('account-fp' == $(this).attr('click-position')) {
                $('.sign-in-before').hide();
                $('.sign-in-after').show();
                return ;
            }
            $(".account-box").show();
            $(".reset-password-box").hide();
            if ("log-in" == $(this).attr("data-flag")) {
                $("#account-sign-up").removeClass("active");
                $("#account-log-in").addClass("active");
                $(".log-in-box").show();
                $(".sign-up-box").hide();
            } else {
                $("#account-log-in").removeClass("active");
                $("#account-sign-up").addClass("active");
                $(".sign-up-box").show();
                $(".log-in-box").hide();
            }
        });

        $(".account-withdraw").click(function(){
            if ($(this).hasClass("theme-color")) {
                window.open(baseURL + "/secure/gold");
            }
        });

        // password show or hide
        $(".eye").click(function(){
            if($(".pwd").attr('type')=='password'){
                $(".pwd").attr('type','text');
                $(".eye").addClass('clear');
            }else{
                $(".pwd").attr('type','password');
                $(".eye").removeClass('clear');
            }
        });

        // sign in
        $("#sign-in-button").click(function(){
            ga('send', 'event', 'account', 'login', '/account/login/email/page/account', 1, {'nonInteraction': 1});
            var sendData = {
                "user_email": $.trim($("#sign-in-email").val()),
                "password": $.trim($("#sign-in-password").val())
            };
            chrome.extension.getBackgroundPage().user.signin(sendData, function(response){
                chrome.extension.getBackgroundPage().user.token(function(userDate){
                    if (!!userDate) {
                        setCache("user_email", userDate.Email);
                        $(".sign-in-after .gold").addClass("account-active");
                        $(".sign-in-after .account").removeClass("account-active");
                        $(".account-gold-box").show();
                        $(".account-settings-box").hide();
                        showUserInfo(userDate, tabId, data["store-info"], data["root-domain"], data["domain"]);
                        chrome.tabs.sendMessage(tabId, {"action": "render-test-result-page-after-logged"});
                    }
                    var sudomain = getDomainFromURL(data["url"]);
                    var domain = getRootDomain(sudomain);
                    showDailyCheckInDetail(sudomain, domain);
                });
            }, function(response){
                $(".sign-in-password-error").html(L("LOGIN_ERROR_TIPS")).show();
            });
        });

        // sign up email input listener
        $('#sign-up-email').bind('input propertychange', function(){
            var email = $("#sign-up-email").val();
            var reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
            if(!reg.test(email)){
                $(".email-error-tips").html(L("EMAIL_CORRECT_TIPS")).show();
            }else{
                $(".email-error-tips").hide();
            }
        });

        // sign up password input listener
        $('#sign-up-password').bind('input propertychange', function(){
            var pwd_length = $("#sign-up-password").val().length;
            if(pwd_length < 6){
                $(".sign-up-password-error").show();
            }else{
                $(".sign-up-password-error").hide();
            }
        });

        // sign up
        $("#sign-up-button").click(function(){
            ga('send', 'event', 'account', 'signup', '/account/signup/email/page/account', 1, {'nonInteraction': 1});
            var ptn = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
            if(!ptn.test($("#sign-up-email").val())){
                $(".email-error-tips").html(L("EMAIL_CORRECT_TIPS")).show();
                return ;
            }
            if ($("#sign-up-password").val().length < 6) {
                $(".sign-up-password-error").show();
                return ;
            }
            var sendData = {
                "user_email": $.trim($("#sign-up-email").val()),
                "password": $.trim($("#sign-up-password").val()),
                "password_repeat": $.trim($("#sign-up-password").val())
            };
            chrome.extension.getBackgroundPage().user.signup(sendData, function(response){
                if (!!response) {
                    setCache("user_email", response.Email);
                    chrome.extension.getBackgroundPage().user.token(function(response){
                        $(".sign-in-after .gold").addClass("account-active");
                        $(".sign-in-after .account").removeClass("account-active");
                        $(".account-gold-box").show();
                        $(".account-settings-box").hide();
                        showUserInfo(response, tabId, data["store-info"], data["root-domain"], data["domain"]);
                    }, function(){
                        $(".first-order-active").hide();
                        $(".first-order-actived").hide();
                        $('.first-order-active').show();
                        $(".first-order").show();
                        $(".sign-in-before").show();
                        $(".sign-in-after").hide();
                        $('.first-order-tips').hide();
                        if ('YES' != Storages.localStorage.get('first_order_tips_closed')) {
                            $('.first-order-tips').show();
                        }
                        delay(10000).then(function() {
                            $('.first-order-tips').hide();
                        });
                        Storages.localStorage.set('first_order_tips_closed', 'YES')
                    });
                    chrome.tabs.sendMessage(tabId, {"action": "render-test-result-page-after-logged"});
                }
            }, function(response){
                $(".email-error-tips").html(L("EMAIL_REGISTERED_TIPS")).show();
            });
        });

        // fb login
        $(".account-with-facebook").click(function(){
            ga('send', 'event', 'account', 'login', '/account/login/facebook/page/account', 1, {'nonInteraction': 1});
            window.open(baseURL + '/auth/facebook/?action=facebook','','width=800,height=800');
            var sh = setInterval(checkFbLogin,1000);
            function checkFbLogin(){
                chrome.extension.getBackgroundPage().user.fbLogin(function(response){}, function(response){
                    if (2 == response.code) {
                        clearInterval(sh);
                        $(".facebook-tips").show();
                        return ;
                    }
                    if (0 == response.code) {
                        clearInterval(sh);
                        chrome.extension.getBackgroundPage().user.token(function(userData){
                            setCache("user_email", userData.Email);
                            $(".sign-in-after .gold").addClass("account-active");
                            $(".sign-in-after .account").removeClass("account-active");
                            $(".account-gold-box").show();
                            $(".account-settings-box").hide();
                            showUserInfo(userData, tabId, data["store-info"], data["root-domain"], data["domain"]);
                            chrome.tabs.sendMessage(tabId, {"action": "render-test-result-page-after-logged"});
                        }, function(){
                            $(".sign-in-before").show();
                            $(".sign-in-after").hide();
                        });
                    }
                });
            }
        });

        $(".close-facebook-tips").click(function (){
            $(".facebook-tips").hide();
        });

        $('#reset-email').bind('input propertychange', function(){
            var email = $("#reset-email").val();
            var reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
            if(!reg.test(email)){
                $(".continue").removeClass("active");
            }else{
                $(".continue").addClass("active");
            }
        });

        // reset password
        $(".continue").click(function(){
            if ($(".continue.active").length == 0) {
                return ;
            }
            var email = $.trim($("#reset-email").val());
            var sendData={
              'email': email,
            }
            chrome.extension.getBackgroundPage().user.resetPassword(sendData, function(response){
                $(".continue, .case-one").hide();
                $(".reset-user-name").html(email);
                $(".case-two").show();
            }, function(response){
                $(".case-one").show();
            });
        });

        // account panel and gold panel switch
        $(".sign-in-after .account, .sign-in-after .gold").click(function(){
            if ($(this).hasClass("gold")){
                $(".sign-in-after .account").removeClass("account-active");
                $(".account-gold-box").show();
                $(".account-settings-box").hide();
            } else {
                $(".sign-in-after .gold").removeClass("account-active");
                $(".account-gold-box").hide();
                $(".account-settings-box").show();
            }
            $(this).addClass("account-active");
        });

        $("#account-logout").click(function(){
            ga('send', 'event', 'account', 'logout', '/account/logout', 1, {'nonInteraction': 1});
            $('#account-log-in, #account-sign-up, #reset-log-in, #reset-sign-up, .sign-up-now').attr('click-position', '');
            chrome.extension.getBackgroundPage().user.logout(function(response){
                $(".first-order").hide();
                $(".first-order-active").hide();
                $(".first-order-actived").hide();
                if ("YES" == data["store-info"].is_cashback) {
                    $('.first-order-active').show();
                    $(".first-order").show();
                    $('.first-order-tips').hide();
                    if ('YES' != Storages.localStorage.get('first_order_tips_closed')) {
                        $('.first-order-tips').show();
                    }
                    delay(10000).then(function() {
                        $('.first-order-tips').hide();
                    });
                    Storages.localStorage.set('first_order_tips_closed', 'YES')
                }
                chrome.tabs.sendMessage(tabId, {"action": "render-test-result-page-after-logout"});
                chrome.tabs.sendMessage(tabId, {"action": "reset-inject-cb-button"});
                batchRemoveCache(["user_email", "user_gold"]);
                chrome.tabs.sendMessage(tabId, {"action": "remove-cookie", "name": "cb_activate", "domain":data["root-domain"]});
                chrome.tabs.sendMessage(tabId, {"action": "remove-cookie", "name": "affiliate_relation", "domain":data["root-domain"]});
                $(".sign-in-before").show();
                $(".sign-in-after").hide();
                $(".reward-activated-box").hide();
                if ("YES" == data["hasCashback"] && "YES" != data.at) {
                    $(".earn-up-cashback").show();
                }
                $('.nav-list-wrapper .share').hide();
                var sudomain = getDomainFromURL(data["url"]);
                var domain = getRootDomain(sudomain);
                showDailyCheckInDetail(sudomain, domain);
                $('.christmas-checkin-wraper .nogamewrper').show();
                $('.christmas-checkin-wraper .gamewraper').hide();
                $('.christmas-checkin-wraper .nochancewraper').hide();
 
                is_login = false;
                renderNewUserTasks();
            });
        });

        $(".forgot-password").click(function(){
            ga('send', 'event', 'account', 'forgetpwd', '/account/forgetpwd', 1, {'nonInteraction': 1});
            $("#account-log-in, #account-sign-up").removeClass("active");
            $(".account-box").hide();
            $(".reset-password-box").show();
        });

        $("#activate-now, #store-work-active, #store-work-reactivate").click(function(){
            chrome.extension.getBackgroundPage().setServiceUsedCookie();
            ga('send', 'event', 'click', 'cb_reactivate_click', '/cb/reactivate/click/' + data["domain"], 1, {'nonInteraction': 1});
            removeCache(tabId + ":afsrc");
            $("#store_search_page,#account_user_page,#store_checkin_page").removeClass('nav-active');
            $("#store_home_page").addClass('nav-active');
            $(".store-account-box, .coupert-not-available-box, .store-search-box, .store-deals-box, .check-in-box").hide();
            $(".store-home-box").show();
            chrome.tabs.sendMessage(tabId, {"action": "set-affiliate-cookie", "domain":data["root-domain"], "relation": "self"}); // set affiliate cookie
            let trackingId = generateTrackingId('reactive_coupert_click');
            chrome.extension.getBackgroundPage().openWindow(data["merchant-info"].url+"&tracking_id="+trackingId, false, data["root-domain"]);
            chrome.extension.getBackgroundPage().activateAndReloadStorePopup({"root-domain":data["root-domain"], "tab-id": tabId});
            chrome.extension.getBackgroundPage().statistics.reActivate(data["domain"]); // re active coupert log
            chrome.extension.getBackgroundPage().setIconBadge(tabId, getBadgeText(data));
            if ("YES" == data["store-info"].is_cashback) {
                chrome.tabs.sendMessage(tabId, {"action": "set-cashback-cookie", "domain":data["root-domain"]});
                chrome.extension.getBackgroundPage().service.cbClick(data["domain"], data["merchant-info"].ID, "CB_DISABLED_REACTIVATE", trackingId, data["merchant-info"].LeastOrderAmount, data["merchant-info"].CashBackPercentage, "0", getCache("user_email")); // cb click log
            }
            chrome.extension.getBackgroundPage().user.token(function(response){
                $(".sign-in-after .gold").addClass("account-active");
                $(".sign-in-after .account").removeClass("account-active");
                $(".account-gold-box").show();
                $(".account-settings-box").hide();
                showUserInfo(response, tabId, data["store-info"], data["root-domain"], data["domain"]);
            }, function(){
                $("#store_home_page,#store_search_page,#store_checkin_page").removeClass('nav-active');
                $("#account_user_page").addClass('nav-active');
                $(".store-account-box").show();
                $(".store-search-box").hide();
                $(".store-home-box").hide();
                $(".store-deals-box").hide();
                $(".coupert-not-available-box").hide();
                $(".sign-in-before").show();
                $(".sign-in-after").hide();
            });
        });

        // go to coupert website
        $("#invite-friend, #account-help, #account-settings, #account-center").click(function(){
            if (!!$(this).attr("data-web-uri")) {
                window.open(baseURL + $(this).attr("data-web-uri"), '_blank');
            }
        });

        $("#rate-coupert").click(function(){
            window.open(googleReviewURL);
        });

        $("#search-store-cancel").click(function(){
            $("#search-store-cancel").hide();
            $("#search-close").show();
            $("#search-store-input").val("");
            $(".stores").show();
            $(".search-result-list").hide();
        });

        $("#search-store-input").bind('input propertychange', function() {
            var kw = $.trim($(this).val());
            if (kw.length <= 0) {
                return ;
            }
            $("#search-store-cancel").show();
            $("#search-close").hide();
            chrome.extension.getBackgroundPage().store.search({"keyword": kw},function(response){
                if ("array" != typeC(response)) {
                    return ;
                }
                var html = "";
                $(response).each(function(index,item){
                    var name = item.Name.replace(new RegExp(kw,'i'), "<span>"+kw+"</span>");
                    html += '<li class="store_section_search" data-domain="' + item.Domain + '">';
                    html += '<a class="sr_sn">' + name + '</a>'
                    html += '<span class="i"></span>'
                    html += '</li>';
                });
                $(".search-reasult").html(html);
                $(".stores").hide();
                $(".search-result-list").show();

                $(".store_section_search").click(function(){
                    var domain = $(this).attr("data-domain");
                    ga('send', 'event', 'click', 'cc_search_click', '/cc/search/click/'+domain, 1, {'nonInteraction': 1});
                    showSearchCodeList(domain);
                });
            });
        });

        $("#code-list-store-rewards-active").click(function(){
            if (!!$(this).attr("data-web-uri")) {
                chrome.extension.getBackgroundPage().openWindow($(this).attr("data-web-uri"));
            }
        });

        $("#total-gold-svg, .question-icon").click(function(){
            if (!!$(this).attr("data-web-uri")) {
                window.open(baseURL + $(this).attr("data-web-uri"));
            }
        });

        $("#invite-friend-link").click(function(){
            var clipboard = new Clipboard("#invite-friend-link");
            clipboard.on('success', function(e) {
            });
            clipboard.on('error', function(e) {
            });
            $("#invite-friend-link .copied").html(L("COPIED"));
            delay(2000).then(function(){
                $("#invite-friend-link .copied").html(L("COPYLINK"));
            });
        });

        $(".store-codes-enable").click(function(){
            $(this).hide();
            $(".store-codes-enabled").show();
            chrome.tabs.sendMessage(tabId, {
                "action": "remove-cache-or-cookie",
                "cookie": {
                    "name":"at_turnoff",
                    "domain": data["root-domain"]
                }
            });
            setTimeout(function(){
                $(".store-codes-enabled").hide();
            }, 2500);
        });

        $(".user-currrent-coupons").click(function(){
            ga('send', 'event', 'click', 'balances', '/balances/click/' + data["domain"], 1, {'nonInteraction': 1});
            $("#store_home_page,#store_search_page,#store_checkin_page").removeClass('nav-active');
            $("#account_user_page").addClass('nav-active');
            $(".store-account-box").show();
            $(".store-search-box").hide();
            $(".store-home-box, .check-in-box").hide();
            $(".store-deals-box").hide();
            $(".coupert-not-available-box").hide();
            chrome.extension.getBackgroundPage().user.token(function(response){
                $(".sign-in-after .gold").addClass("account-active");
                $(".sign-in-after .account").removeClass("account-active");
                $(".account-gold-box").show();
                $(".account-settings-box").hide();
                showUserInfo(response, tabId, data["store-info"], data["root-domain"], data["domain"]);
            }, function(){
                $(".sign-in-before").show();
                $(".sign-in-after").hide();
            });
        });

        $(".withdraw-close, .withdraw-warning a").click(function () {
            if ($(this).hasClass("withdraw-close")) {
                chrome.extension.getBackgroundPage().user.clickException("withdraw", "close");
                $(".withdraw-warning").hide();
                $(".user-currrent-coupons").css("box-shadow","0 -3px 5px 0 rgba(157,157,157,.4)");
            } else {
                chrome.extension.getBackgroundPage().user.clickException("withdraw", "click");
            }
        });

        $("a.privacy-policy").click(function(){
            window.open(PRIVACY_POLICY_URL, "_blank");
            return false;
        });

        $("a.terms-of-use").click(function(){
            window.open(TERMS_OF_USE_URL, "_blank");
            return false;
        });

        $(".need-it").click(function () {
            var self = this;
            $(".click-after.unlogin").hide();
            $(".click-after.repeat-submit").hide();
            $(".click-after.login.gold").hide();
            $('.click-after.login.no-gold').hide();
            chrome.tabs.sendMessage(tabId, {"action": "get:url"}, function (response) {
                var url = response.url;
                chrome.extension.getBackgroundPage().statistics.needIt({url: url})
                .then(function (res) {
                    if ("Unauthorized" == res.msg) {
                        $(".click-after.unlogin").show();
                    } else if ("RepeatCommit" == res.msg) {
                        $(".click-after.repeat-submit").show();
                    } else if ("SubmitLimit" == res.msg) {
                        $(self).hide();
                        $('.click-after.login.no-gold').show();
                    } else {
                        $(self).hide();
                        $(".click-after.login.gold").show();
                    }
                })
                .catch(function (e) {
                    console.log(e);
                });
            });
        });

        $(".click-after.unlogin > span").click(function () {
            $('#account_user_page').click();
        });

        $(".list-item .guide").click(function() {
            ga('send', 'event', 'statistics', 'setting', '/statistics/setting/click/how-to-use', 1, {'nonInteraction': 1});
            window.open(GUIDE_URL+'nav-list&guid='+guid(), "_blank");
            return false;
        });

        $('.list-item .help').click(function() {
            ga('send', 'event', 'statistics', 'setting', '/statistics/setting/click/help-faq', 1, {'nonInteraction': 1});
            window.open(HELP_URL+'nav-list&guid='+guid(), "_blank");
            return false;
        });

        $('#store_checkin_page').click(function (e) {
            if(!!e.originalEvent) {
                ga('send', 'event', 'navigation', 'activity', '/navigation/click/activity', 1, {'nonInteraction': 1});
            }
            setTimeout(() => {
                $('.checkin-notice-welcome').hide();
                $('.checkin-notice').hide();
            }, 2000);
            showDailyCheckIn();
            showTaskList();
            $('#store_checkin_page').addClass('nav-active');
            $('#store_home_page, #store_search_page, #account_user_page').removeClass('nav-active');
            $('.store-home-box, .store-search-box, .store-account-box, .coupert-not-available-box').hide();
            $('.check-in-box').show();
        });

        $('.dailycheck-wraper-left > span > b').click(function () {
            window.open(GUIDE_URL+'check_in&guid='+guid()+'#daily-check-in', "_blank");
            return false;
        });

        $('.checkin-detail-container .back-checkin, .checkin-detail-container .right-arrow').click(function () {
            showDailyCheckIn();
            $('.checkin-detail-container').hide();
            $('.check-in-box .container').show();
        });

        $('.dailycheck-wraper-left').click(function () {
            var sudomain = getDomainFromURL(data["url"]);
            var domain = getRootDomain(sudomain);
            showDailyCheckInDetail(sudomain, domain);
        });

        $('.go-how-it-works').click(function () {
            var utm_content = $(this).attr('utm_content');
            chrome.extension.getBackgroundPage().statistics.log({action: 'click', param: utm_content+"_try_it_now", domain: data['domain'], root_domain: data['root-domain']});
            window.open(GUIDE_URL+utm_content+'&guid='+guid()+'#how-it-works', "_blank");
            return false;
        });

        $('.go-activity-checkin').click(function () {
            var action = $(this).attr('action');
            chrome.extension.getBackgroundPage().statistics.log({action: 'click', param: action, domain: data['domain'], root_domain: data['root-domain']});
            $('#store_checkin_page').click();
        });

        $(".how-it-works-link").click(function(){
            if (!!$(this).attr("data-utm_content")) {
                window.open(howItWorksURL + $(this).attr("data-utm_content") + "&guid=" + guid(), '_blank');
            }
            return false;
        });

        $(".how-it-works-cashback").unbind('hover').hover(function(){
            var utm_content = $(this).find('.how-it-works-link').attr("data-utm_content");
            $(this).find('.how-it-works-hover, .how-it-works-hover-reward').show();
            chrome.extension.getBackgroundPage().statistics.log({action: 'impr', param: utm_content, domain: data['domain'], root_domain: data['root-domain']});
        }, function(){
            $(this).find('.how-it-works-hover, .how-it-works-hover-reward').hide();
        });

        $('.new-user-cashback').hover(function () {
            $(this).find('.how-it-works-hover-newuser').show();
            var utm_content = $(this).find('.how-it-works-hover-newuser').attr("data-utm_content");
            chrome.extension.getBackgroundPage().statistics.log({action: 'impr', param: utm_content, domain: data['domain'], root_domain: data['root-domain']});
        }, function () {
            $(this).find('.how-it-works-hover-newuser').hide();
        });

        $(".how-it-works-hover .canclick").click(function () {
            if ($(this).parent().parent().find('.how-it-works-link').length > 0) {
                $(this).parent().parent().find('.how-it-works-link').click();
            } else {
                if (!!$(this).parent().attr("data-utm_content")) {
                    window.open(howItWorksURL + $(this).parent().attr("data-utm_content") + "&guid=" + guid(), '_blank');
                }
                return false;
            }
        });

        $("#account-forget-password").click(function () {
            $('.sign-in-after').hide();
            $('.sign-in-before').show();
            $('.forgot-password').click();
            $('#account-log-in, #account-sign-up, #reset-log-in, #reset-sign-up, .sign-up-now').attr('click-position', 'account-fp');
        });

        $(".share-code-click").click(function () {
            $('[name="web-site"]').val('');
            $('[name="code"]').val('');
            $('[name="expire-day"]').val('');
            $('[name="description"]').val('');
            var parent = $(this).parent().parent().siblings().each(function() {
                if ($(this).hasClass('submit-code-wraper')) {
                    $(this).show();
                    $(this).find('.submit-code-box').show();
                    $(this).find('.submit-success-box').hide();
                } else {
                    if ($(this).is(':visible')) {
                        $(this).attr('display-panel', 'yes');
                    }
                    $(this).hide();
                }
            });
            $(this).parent().attr('display-panel', 'yes');
            $(this).parent().hide();
        });

        $(".submit-code-box .close-submit, .submit-code-box .cancel-submit, .submit-success-box .complete-submit, .submit-success-box .close-submit").click(function () {
            var parent = $(this).parent().parent().siblings().each(function() {
                if ($(this).hasClass('submit-code-wraper')) {
                    $(this).hide();
                } else {
                    if ('yes' == $(this).attr('display-panel')) {
                        $(this).show();
                    }
                }
            });
            $('.share-code-wraper').show();
            $(this).parent().parent().hide();
        });

        $('.submit-code-box .submit-btn').click(function () {
            var domain = $.trim($('.submit-code-box [name="web-site"]').val());
            var code = $.trim($('.submit-code-box [name="code"]').val());
            var expire_day = $.trim($('.submit-code-box [name="expire-day"]').val());
            var description = $.trim($('.submit-code-box [name="description"]').val());
            var data = {
                domain: domain,
                code: code,
                expire_day: expire_day,
                description: description,
            };
            chrome.extension.getBackgroundPage().user.userShareCode(data, function(response) {
                $('.submit-code-box').hide();
                $('.submit-success-box').show();
            });
        });

        $('.submit-code-box [name="web-site"]').bind('input propertychange', function(){
            var domain = $.trim($('.submit-code-box [name="web-site"]').val());
            var code = $.trim($('.submit-code-box [name="code"]').val());
            var expire_day = $.trim($('.submit-code-box [name="expire-day"]').val());
            if (domain.length > 0 && code.length > 0 && expire_day.length > 0) {
                $('.submit-code-box .submit-btn').addClass('active').removeAttr("disabled");
            } else {
                $('.submit-code-box .submit-btn').removeClass('active').attr("disabled","disabled");
            }
        });

        $('.submit-code-box [name="code"]').bind('input propertychange', function(){
            var domain = $.trim($('.submit-code-box [name="web-site"]').val());
            var code = $.trim($('.submit-code-box [name="code"]').val());
            var expire_day = $.trim($('.submit-code-box [name="expire-day"]').val());
            if (domain.length > 0 && code.length > 0 && expire_day.length > 0) {
                $('.submit-code-box .submit-btn').addClass('active').removeAttr("disabled");
            } else {
                $('.submit-code-box .submit-btn').removeClass('active').attr("disabled","disabled");
            }
        });

        $('.submit-code-box [name="expire-day"]').bind('input propertychange', function(){
            var domain = $.trim($('.submit-code-box [name="web-site"]').val());
            var code = $.trim($('.submit-code-box [name="code"]').val());
            var expire_day = $.trim($('.submit-code-box [name="expire-day"]').val());
            if (domain.length > 0 && code.length > 0 && expire_day.length > 0) {
                $('.submit-code-box .submit-btn').addClass('active').removeAttr("disabled");
            } else {
                $('.submit-code-box .submit-btn').removeClass('active').attr("disabled","disabled");
            }
        });

        $('.submit-success-box .submit-another-code').click(function() {
            $('[name="web-site"]').val('');
            $('[name="code"]').val('');
            $('[name="expire-day"]').val('');
            $('[name="description"]').val('');
            $('.submit-code-box').show();
            $('.submit-success-box').hide();
        });

        $('.congratulations-wrap .modal-close-btn').click(function() {
            $(this).parent('.congratulations-wrap').hide();
            var sudomain = getDomainFromURL(data["url"]);
            var domain = getRootDomain(sudomain);
            showDailyCheckInDetail(sudomain, domain);
        });

        $('.account-settings-box .modify-user-info .arrow-left').click(function () {
            $('.account-settings-box .modify-user-info').hide();
            $('.account-settings-box .user-info, .account-settings-box .user-settings').show();
        });

        $('#name,[name="gender"]').bind('input propertychange', function(){
            $('.modify-user-info .info-update').removeAttr("disabled");
            $('.modify-user-info .info-update').removeClass('updated');
        });

        $('#birthday select').change(function (){
            var year = $("#year option:selected").val();
            var month = $("#month option:selected").val();
            var day = $("#day option:selected").val();
            if((year && month && day) != 0){
                $('.modify-user-info .info-update').removeAttr("disabled");
                $('.modify-user-info .info-update').removeClass('updated');
            }
        });

        $('.account-settings-box .user-info').click(function() {
            $('.account-settings-box .modify-user-info').show();
            $('.account-settings-box .user-info, .account-settings-box .user-settings').hide();
        });

        $('.modify-user-info .info-update').click(function () {
            var self = this;
            var year = $("#year option:selected").val();
            var month = $("#month option:selected").val();
            var day = $("#day option:selected").val();
            var name = $.trim($('#name').val());
            var birthday = $.trim(year +'-'+month +'-'+day);
            var gender = $.trim($('[name="gender"]:checked').val());
            chrome.extension.getBackgroundPage().user.userCompleteProfile({
                name: name,
                birthday: birthday,
                gender: gender
            })
            .then(function(response) {
                var msg = response.msg;
                var data = response.data;
                if (msg == 'Success') {
                    $("#firstname").html(data.FullName);
                    $(".complete-profile").addClass("complete");
                    $(".processing").css("width", (($(".complete").length / 7) * 100).toString() + "%");
                    $(self).addClass('updated');
                    $('.modify-user-info .info-update').attr("disabled");
                }
            });
        });

        $(".logged-in, .join-today").click(function () {
            $('#account_user_page').click();
        });

        $('.first-order').click(function () {
            window.open(FIRST_QUALIFYING_DEALS + 'extension_banner&guid='+guid(), "_blank");
            return false;
        });

        $('.first-order-active').click(function (e) {
            e.stopPropagation();
            ga('send', 'event', 'click', 'activity', '/activity/click/first-order/' + data["domain"], 1, {'nonInteraction': 1});
            chrome.extension.getBackgroundPage().setServiceUsedCookie();
            chrome.tabs.sendMessage(tabId, {action: 'Cookies-set', name: 'first_order_actived', value: 'YES', options: {domain: data["root-domain"], expires: 60 * 60 * 2}});
            chrome.tabs.sendMessage(tabId, {"action": "set-affiliate-cookie", "domain": data["root-domain"], "relation": "self"});
            if ("YES" == data["store-info"].is_cashback) {
                chrome.tabs.sendMessage(tabId, {"action": "set-cashback-cookie", "domain":data["root-domain"]});
            }
            let trackingId = generateTrackingId('FIRST_ORDER_CB');
            chrome.extension.getBackgroundPage().openWindow(data["merchant-info"].url+"&tracking_id="+trackingId, false, data["root-domain"]);
            chrome.extension.getBackgroundPage().service.cbClick(data["domain"], data["merchant-info"].ID, "CB_FIRST_QUALIFYING", trackingId, data["merchant-info"].LeastOrderAmount, data["merchant-info"].CashBackPercentage, "0", getCache("user_email")); // cb-click log
            chrome.extension.getBackgroundPage().statistics.firstQualifying();
            chrome.extension.getBackgroundPage().user.info({}, function(response){
                $('.first-order-active').hide();
                $('.first-order-actived').show();
                setCache("user_email", response.email);
                chrome.tabs.sendMessage(tabId, {"action":"set-inject-cb-button-actived"});
                $(".reward-activated-box").show();
                $(".earn-up-cashback").hide();
            }, function(){
                $('#account_user_page').click();
            });
        });

        $('.go-check-in').click(function (e) {
            e.stopPropagation();
            path['daily-check-in'] = 1;
            $("#store_checkin_page").click();
            delay(500).then(function () {
                $('.check-in-box .container').animate({scrollTop: $('#activity_check-in').offset().top - 64}, 1000);
            });
        });

        $('.close-new-user-wrapper').click(function () {
            Storages.localStorage.set('welcome_disabled', 'YES');
            $('.new-user-wraper').hide();
        });

        $('.close-first-order-tips').click(function(e) {
            e.stopPropagation();
            Storages.localStorage.set('first_order_tips_closed', 'YES');
            $('.first-order-tips').hide();
        });

        $('div.earn-up-cashback > h2 > div,div.reward-activated-box > h2 > div').hover(function () {
            $(this).find(".how-it-works-hover").show();
            return false;
        },function () {
            $(this).find(".how-it-works-hover").hide();
            return false;
        });

        $('.credit-card-btn').click(function () {
            ga('send', 'event', 'statistics', 'credit-card', '/statistics/credit-card/click/account-center', 1, {'nonInteraction': 1});
            chrome.extension.getBackgroundPage().statistics.log({action: 'click', param: 'credit_card_at_acoount', domain: data['domain'], root_domain: data['root-domain']});
            window.open(CREDIT_CARD + guid(), "_blank");
            Storages.localStorage.set('credit_card_clicked', 'YES');
            return false;
        });

        $('.earn-up-cashback .how-it-works-hover .canclick, .reward-activated-box .how-it-works-hover .canclick').click(function () {
            window.open(howItWorksURL + "cc-cb-button" + "&guid=" + guid(), '_blank');
            return false;
        });

        $('div.coupert-box div.new-user-wraper div.how-it-works-cashback span.new-user-cashback span.canclick').click(function (e) {
            e.stopPropagation();
            window.open(howItWorksURL + "cp_site" + "&guid=" + guid(), '_blank');
            return false;
        });

        $('div.store-home-box > div.container > div.new-user-wraper div.how-it-works-cashback span.new-user-cashback span.canclick').click(function (e) {
            e.stopPropagation();
            window.open(howItWorksURL + "welcome_module" + "&guid=" + guid(), '_blank');
            return false;
        });

        $('.dailycheck-wraper-left .learn-more-link').click(function(e) {
            e.stopPropagation();
            window.open(GUIDE_URL + "check_in" + "&guid=" + guid() + '#daily-check-in', '_blank');
            return false;
        });

        $('.account-balance .coupon-codes p.coupon').click(function() {
            window.open(baseURL + "/secure/gold");
        });

        $('.checkin-notice-welcome .close-notice').click(function(e) {
            e.stopPropagation();
            $('.checkin-notice-welcome').hide();
        });

        $('.faq-link').click(function() {
            window.open(HELP_URL + "account-center#coupert-gold");
        });

        $('.newcomer-benefits .install-coupert-wrapper .install-coupert-claim').click(function() {
            ga('send', 'event', 'click', 'welcome', '/welcome/click/install-coupert', 1, {'nonInteraction': 1});
            let tasks = Storages.localStorage.get('extension:tasks') || {};
            let task = {
                InstallCoupert: {
                    gold: 100
                }
            }
            tasks = Object.assign(tasks, task);
            Storages.localStorage.set('extension:tasks', tasks);
            console.log(is_login);
            if (is_login) {
                chrome.extension.getBackgroundPage()
                .activity.receiveGold('InstallCoupert')
                .then((response) => {
                    chrome.extension.getBackgroundPage().user.info({}, function(response){
                        is_login = true;
                        let balance = response.balance || 0;
                        let tasks = typeC(response.tasks) == 'object' ? response.tasks : {};
                        Storages.localStorage.set('extension:tasks', tasks);
                        renderNewUserTasks(balance);
                    }, function(response){
                        is_login = false;
                        renderNewUserTasks();
                    });
                });
            }
            renderNewUserTasks();
        });

        $('.newcomer-benefits .join-coupert-wrapper .go-btn').click(function() {
            $("#account_user_page").click();
        });

        $('.newcomer-benefits .join-coupert-wrapper .join-coupert-claim').click(function() {
            ga('send', 'event', 'click', 'welcome', '/welcome/click/join-coupert', 1, {'nonInteraction': 1});
            $(this).hide();
            $('.newcomer-benefits .join-coupert-wrapper .claimed').show();
            let tasks = Storages.localStorage.get('extension:tasks') || {};
            let task = {
                CreateAccount: {
                    gold: 100
                }
            }
            tasks = Object.assign(tasks, task);
            Storages.localStorage.set('extension:tasks', tasks);
            chrome.extension.getBackgroundPage()
            .activity.receiveGold('CreateAccount')
            .then((response) => {
                chrome.extension.getBackgroundPage().user.info({}, function(response){
                    is_login = true;
                    let balance = response.balance || 0;
                    let tasks = typeC(response.tasks) == 'object' ? response.tasks : {};
                    Storages.localStorage.set('extension:tasks', tasks);
                    renderNewUserTasks(balance);
                }, function(response){
                    is_login = false;
                    renderNewUserTasks();
                });
            });
        });

        $('.newcomer-benefits .try-demo-wrapper button.go-btn').click(function () {
            window.open(CART_URL + 'welcome-tasks-go&guid='+guid());
            ga('send', 'event', 'click', 'welcome', '/welcome/click/try-dome', 1, {'nonInteraction': 1});
            $(this).hide();
            $('.newcomer-benefits .try-demo-wrapper .try-demo-claim').show();
            Storages.localStorage.set('task:try_demo', true);
        });

        $('.newcomer-benefits .try-demo-wrapper button.try-demo-claim').click(function () {
            let tasks = Storages.localStorage.get('extension:tasks') || {};
            let task = {
                TryDemoReward: {
                    gold: 50
                }
            }
            tasks = Object.assign(tasks, task);
            Storages.localStorage.set('extension:tasks', tasks);
            if (is_login) {
                chrome.extension.getBackgroundPage()
                .activity.receiveGold('TryDemoReward')
                .then((response) => {
                    chrome.extension.getBackgroundPage().user.info({}, function(response){
                        is_login = true;
                        let balance = response.balance || 0;
                        let tasks = typeC(response.tasks) == 'object' ? response.tasks : {};
                        Storages.localStorage.set('extension:tasks', tasks);
                        renderNewUserTasks(balance);
                    }, function(response){
                        is_login = false;
                        renderNewUserTasks();
                    });
                });
            } else {
                $("#account_user_page").click();
            }
            renderNewUserTasks();
        });

        $('.newcomer-benefits .eran-more-gold').click(function() {
            ga('send', 'event', 'click', 'welcome', '/welcome/click/earn-more-gold', 1, {'nonInteraction': 1});
            $("#store_checkin_page").click();
            delay(500).then(function () {
                $('.check-in-box .container').animate({scrollTop: $('#activity_task-lists').offset().top - 64}, 1000);
            });
        });

        $('.mask-container .eran-more-gold').click(function() {
            $("#store_checkin_page").click();
            delay(500).then(function () {
                $('.check-in-box .container').animate({scrollTop: $('#activity_task-lists').offset().top - 64}, 1000);
            });
        });
    }
/*------------------------------ > ^_^ < -----------------------------*/

function renderNewUserTasks(balance = 0) {
    let tasks = Storages.localStorage.get('extension:tasks') || {};

    $('.newcomer-benefits .install-coupert-wrapper .install-coupert-claim').hide();
    $('.newcomer-benefits .install-coupert-wrapper .install-coupert-claimed').hide();
    $('.newcomer-benefits .join-coupert-wrapper .go-btn').hide();
    $('.newcomer-benefits .join-coupert-wrapper .join-coupert-claim').hide();
    $('.newcomer-benefits .join-coupert-wrapper .join-coupert-claimed').hide();
    $('.newcomer-benefits .try-demo-wrapper .try-demo-claim').hide();
    $('.newcomer-benefits .try-demo-wrapper .try-demo-claimed').hide();
    $('.newcomer-benefits .try-demo-wrapper .go-btn').hide();

    var finished_count = 0;

    if (typeof tasks.InstallCoupert !== 'undefined') {
        $('.newcomer-benefits .install-coupert-wrapper .install-coupert-claimed').show();
        finished_count ++;
    } else {
        $('.newcomer-benefits .install-coupert-wrapper .install-coupert-claim').show();
    }

    if (is_login) {
        if (typeof tasks.CreateAccount !== 'undefined') {
            $('.newcomer-benefits .join-coupert-wrapper .join-coupert-claimed').show();
            finished_count ++;
        } else {
            $('.newcomer-benefits .join-coupert-wrapper .join-coupert-claim').show();
        }

        if (typeof tasks.TryDemoReward !== 'undefined') {
            $('.newcomer-benefits .try-demo-wrapper .try-demo-claimed').show();
            finished_count ++;
        } else {
            if (Storages.localStorage.get('task:try_demo')) {
                $('.newcomer-benefits .try-demo-wrapper .try-demo-claim').show();
            } else {
                $('.newcomer-benefits .try-demo-wrapper .go-btn').show();
            }
        }
    } else {
        delete tasks.CreateAccount;
        delete tasks.TryDemoReward;
        Storages.localStorage.set('extension:tasks', tasks);
        $('.newcomer-benefits .join-coupert-wrapper .go-btn').show();
        if (Storages.localStorage.get('task:try_demo')) {
            $('.newcomer-benefits .try-demo-wrapper .try-demo-claim').show();
        } else {
            $('.newcomer-benefits .try-demo-wrapper .go-btn').show();
        }
    }
    let gold = getTaskGold();
    if (is_login) {
        $(".user-currrent-balances").html(dollarFormat(balance));
    } else {
        if (gold <= 0) {
            $(".user-currrent-balances").html('$*** USD');
        } else {
            $(".user-currrent-balances").html(dollarFormat(gold));
        }
    }

    if (finished_count >= 3) {
        $(".newcomer-benefits").hide();
        $("#welcome_task-lists").show();
        showTaskList();
    }
}

function getTaskGold() {
    let tasks = Storages.localStorage.get('extension:tasks') || {};
    let gold = 0;
    for (let type in tasks) {
        gold += parseInt(tasks[type]['gold']);
    }
    return gold;
}

function isNumber(o) {
    return '[object Number]' === Object.prototype.toString.call(o);
}

function isObject(o) {
    return '[object Object]' === Object.prototype.toString.call(o);
}

function trendingStoresListener() {
    $('.hot-stores-wrapper ul.hot-stores-list .hot-stores-item')
    .unbind('click')
    .click(function () {
        let storeId = $(this).attr("store-id");
        let trackingId = generateTrackingId('trending_stores_click');
        var url="http://www.coupert.com/go/store-" + storeId + ".html?pt=apistore&pv=testcodes&a=1&from=ext&tracking_id="+trackingId;
        window.open(url);
        chrome.extension.getBackgroundPage().service.searchClick(storeId, trackingId, 'TSSC');
    });
}

function showTrendingStores() {
    chrome.extension.getBackgroundPage().home.ads()
    .then((response) => {
        var code = response.ret_code;
        if (code == 0) {
            var stores = response.data;
            var html = '';
            for (var i = 0; i < stores.length; i++) {
                var store = stores[i];
                var logo = imgURL + '/mimg/merimg/s_' + (!!store.Logo ? store.Logo : "default.png");
                html += `
                    <li class="hot-stores-item" store-id="${store.MID}" store-subdomain="${store.subdomain}">
                        <div class="logo">
                            <img src="${logo}">
                        </div>
                        <div class="detail">
                            <h4>${store.Name}</h4>
                            <p><span>${store.num}</span> ${store.num > 1 ? M('codes_trending_stores') : M('code_trending_stores')}${(store.IsCashback == 'YES' ? (' + <span>'+cashbackMaxMinRate(store.CBMinRate, store.CBMaxRate)+'</span> '+ M('search_cash_back')) : '')}</p>
                        </div>
                        <button type="button" class="hot-stores-shop">${M('search_shop')}</button>
                    </li>
                `;
            }
            $('.hot-stores-wrapper ul.hot-stores-list').html(html);
            trendingStoresListener();
        }
    });
}

function tasksListener() {
    $("li.complete-profile span:nth-child(1)").unbind('hover').hover(function () {
        $(".complete-profile-tips").show();
    },function () {
        $(".complete-profile-tips").hide();
    });

    $('.first-order-progress').unbind('click').click(function () {
        window.open(FIRST_QUALIFYING_DEALS + 'progress&guid='+guid(), "_blank");
        return false;
    });

    $('.account-tasklists .tasklists .try-demo').unbind('click').click(function () {
        window.open(CART_URL + 'tasks-center&guid='+guid());
        return false;
    });

    $('.account-tasklists .tasklists .daily-check-in').unbind('click').click(function () {
        $("#store_checkin_page").click();
        delay(500).then(function () {
            $('.check-in-box .container').animate({scrollTop: $('#activity_check-in').offset().top - 64}, 1000);
        });
    });

    $('.account-tasklists .tasklists .invite-friends').click(function () {
        $("#account_user_page").click();
        $('.gold').click();
        delay(500).then(function () {
            $('.sign-in-after .container').animate({scrollTop: $('#activity_invite-friend').offset().top}, 1000);
        });
    });

    $('.account-settings-box .user-info, .complete-profile').click(function () {
        $('#account_user_page').click();
        $(".sign-in-after .account").click();
        $('.account-settings-box .user-info, .account-settings-box .user-settings').hide();
        $('.account-settings-box .modify-user-info').show();
        $('.modify-profile div.name input').focus();
    });

    $('.account-tasklists .tasklists .view-hot-deals').click(function () {
        $("#store_search_page").click();
    });

    $('.tasklists.in-process .install-coupert').click(function() {
        chrome.extension.getBackgroundPage()
            .activity.receiveGold('InstallCoupert')
            .then((response) => {
                $("#account_user_page").click();
            });
    });

    $('.tasklists.in-process .join-coupert').click(function() {
        chrome.extension.getBackgroundPage()
            .activity.receiveGold('CreateAccount')
            .then((response) => {
                $("#account_user_page").click();
            });
    });
}

function showTaskList() {
    chrome.extension.getBackgroundPage().user.tasks()
    .then((response) => {
        if (200 == response.ret_code) {
            let classmap = {
                'daily_check_in_task': 'daily-check-in',
                'watch_demo_task': 'try-demo',
                'join_coupert_task': 'join-coupert',
                'install_coupert_task': 'install-coupert',
                'complete_profile_task': 'complete-profile',
                'first_order_task': 'first-order-progress',
                'invite_friends_task': 'invite-friends',
                'view_hot_deals_task': 'view-hot-deals'
            };
            let data = response.data;
            let sorted = data.sort(function (a, b) {
                if (a.weight < b.weight) {
                    return -1;
                }
                if (a.weight > b.weight) {
                    return 1;
                }
                return 0;
            });
            let extensionTasks = Storages.localStorage.get('extension:tasks') || {};
            sorted.forEach((element, index) => {
                let taskName = element.taskName;
                if (taskName === 'install_coupert_task' && typeC(extensionTasks.InstallCoupert) !== 'undefined') {
                    sorted[index].isFinished = true;
                } else if (taskName === 'watch_demo_task' && typeC(extensionTasks.TryDemoReward) !== 'undefined') {
                    sorted[index].isFinished = true;
                }
            });
            let html = '';
            let unFinishedTasks = sorted.filter(element => {
                if (!element.isFinished) {
                    return element;
                }
            });
            unFinishedTasks.forEach(element => {
                let gold = element.gold;
                let taskName = element.taskName;

                html += '<li class="' + classmap[taskName] + '">';
                html += '   <p>';
                html += '       <b>' + M(taskName) + '</b>';
                html += '       <i>' + M(taskName + '_description') + '</i>';
                html += '   </p>';
                if (taskName == 'invite_friends_task') {
                    html += '<p>' + M('invite_friends_gold') + '</p>';
                } else {
                    html += '<p>' + (
                        taskName == 'join_coupert_task' || taskName == 'install_coupert_task' ? (M('claim') + ' ') : '+ '
                        ) +
                            (
                                isNumber(gold) ?
                                    gold :
                                    (
                                        isObject(gold) ?
                                            (gold.min + '~' + gold.max) :
                                            ""
                                    )
                            )
                            + ' ' + M('gold') +'</p>';
                    html += '</li>';
                }
            });
            $('#activity_task-lists .tasklists.in-process').html(html);
            $('#nocode_task-lists .tasklists.in-process').html(html);
            $('#welcome_task-lists .tasklists.in-process').html(html);
            let finishedTasks = sorted.filter(element => {
                if (element.isFinished) {
                    return element;
                }
            });
            html = '';
            finishedTasks.forEach(element => {
                let gold = element.gold;
                let taskName = element.taskName;
                html += '<li class="' + classmap[taskName] + ' complete">';
                html += '   <p>';
                html += '       <b>' + M(taskName) + '</b>';
                html += '       <i>' + M(taskName + '_description') + '</i>';
                html += '   </p>';
                if (taskName == 'invite_friends_task') {
                    html += '<p>' + M('invite_friends_gold') + '</p>';
                } else {
                    html += '<p>+ ' +
                            (
                                isNumber(gold) ?
                                    gold :
                                    (
                                        isObject(gold) ?
                                            (gold.min + '~' + gold.max) :
                                            ""
                                    )
                            )
                            + ' ' +M('gold')+ '</p>';
                    html += '</li>';
                }
            });
            $('#activity_task-lists .tasklists.finished').html(html);
            $('#nocode_task-lists .tasklists.finished').html(html);
            $('#welcome_task-lists .tasklists.finished').html(html);
            tasksListener();
        }
    })
    .catch((e) => {
        console.log(e);
    });
}

var checkInAtHomeTop = false;

function checkInListener(domain, rootDomain) {
    $('.date-detail.click-active').click(function () {
        if ($('.no-support-tips').is(':visible')) {
            chrome.extension.getBackgroundPage().statistics.log({action: 'click', param: "icon-click/site-not-supported/daily-check-in", domain: domain, root_domain: rootDomain});
        } else if ($('.no-code-tips').is(':visible')) {
            chrome.extension.getBackgroundPage().statistics.log({action: 'click', param: "icon-click/no-code-available/daily-check-in", domain: domain, root_domain: rootDomain});
        } else {
            if (path['daily-check-in'] == 1) {
                chrome.extension.getBackgroundPage().statistics.log({action: 'click', param: "icon-click/code-list-banner-click/daily-check-in", domain: domain, root_domain: rootDomain});
            } else {
                chrome.extension.getBackgroundPage().statistics.log({action: 'click', param: "icon-click/activity-navigation-click/daily-check-in", domain: domain, root_domain: rootDomain});
            }
        }
        ga('send', 'event', 'click', 'activity', '/activity/click/daily-check-in/' + domain, 1, {'nonInteraction': 1});
        if ($('#top-check-in').is(':visible')) {
            checkInAtHomeTop = true;
        }
        chrome.extension.getBackgroundPage().activity.checkIn(siteUrl)
        .then((response) => {
            let status = response['status'];
            if (401 == status) {
                $('#account_user_page').click();
            } else if (200 == status) {
                let checkIn = response['data'];
                $('.congratulations-wrap .today-checked-in-gold,.top-check-in-after-container .check-in-gold > p span').text(checkIn.gold);
                $('.congratulations-wrap .get-gold-days > span,.top-check-in-after-container .check-in-days > p span').text(checkIn.consecutive_days);
                $(this).parents('.checkin-detail-container').next().show();
                $(this).parents('.top-check-in-container').next().css("display","flex");
                $("#store_checkin_page .daily-prompt").hide();
                $('.daily-check-in').addClass('complete');
                showDailyCheckInDetail(domain, rootDomain);
                $('#top-check-in').hide();
            } else if (202 == status) {
                $("#store_checkin_page .daily-prompt").hide();
            }
        })
        .catch((e) => {
            console.log(e);
        });
    });
}

function showDailyCheckInList(records = []) {
    var html = '';
    for (var i = 0; i < records.length; i++) {
        var record = records[i];
        html += '<li class="date-detail';
        if (record.checked_in) {
            if (moment().format("MM/DD") == record.month_day) {
                html += ' date-active';
            } else {
                html += ' date-expired';
            }
        } else {
            if (moment().format('MM/DD') == record.month_day) {
                html += ' click-active';
            }
        }
        html += '">';
        html += `<div class="date-img">${record.gold}</div>`;
        html += `<div class="date-desc">${(moment().format('MM/DD') == record.month_day ? M('Today') : (M('checked_in_day') + (i + 1)))}</div>`;
    }
    $('.checkin-detail-container .date-list-box .date-list').html(html);
}

function showDailyCheckInDetail(domain, rootDomain) {
    $('.check-in-banner').hide();
    chrome.extension.getBackgroundPage().activity.checkInDetail()
    .then((response) => {
        $("#store_checkin_page .daily-prompt").show();
        $("#store_checkin_page .daily-prompt").show();
        var status = response['status'];
        if (200 == status) {
            $(".checkin-detail-container").show();
            var checkInDetail = response['data'];
            if (checkInDetail.today_is_checked_in) {
                $("#store_checkin_page .daily-prompt").hide();
                $('.daily-check-in').addClass('complete');
                if (!checkInAtHomeTop) {
                    $('#top-check-in').hide();
                    $('.top-check-in-after-container').hide();
                }
            } else {
                if (/(^|\.)coupert\./.test(rootDomain)) {
                    if ('displayed' !== Storages.localStorage.get('checkin_notice_welcome')) {
                        $('.checkin-notice-welcome').show();
                        Storages.localStorage.set('checkin_notice_welcome', 'displayed');
                    }
                } else {
                    let remindValue = Storages.localStorage.get('check_in_remind');
                    if (remindValue == 'on' && 'displayed' !== Cookies.get('checkin_notice')) {
                        $('.checkin-notice').show();
                        Cookies.set('checkin_notice', 'displayed', {expires: getMillisecondsRemainingToday()});
                    }
                }
                
                if (!/(^|\.)coupert\./.test(rootDomain) && !no_code) {
                    $('.check-in-banner').show();
                }
            }
            showDailyCheckInList(checkInDetail.records);
        } else {
            if (!/(^|\.)coupert\./.test(rootDomain) && !no_code) {
                $('.check-in-banner').show();
            }
        }
        checkInListener(domain, rootDomain);
    })
    .catch((e) => {
        console.log(e);
    });
}

function showDailyCheckIn() {
    chrome.extension.getBackgroundPage().activity.checkInDetail()
    .then((response) => {
        $('#store_checkin_page').addClass('nav-active');
        $('#store_home_page, #store_search_page, #account_user_page').removeClass('nav-active');
        $('.store-home-box, .store-search-box, .store-account-box, .coupert-not-available-box').hide();
        var status = response['status'];
        if (401 == status) {
            $('.check-in-box').show();
        } else if (200 == status) {
            $('.check-in-box').show();
        }
    })
    .catch((e) => {
        console.log(e);
    });
}

$(".user-wraper-desc .read-more").click(function () {
    $(".new-user-wraper-desc,.new-user-wraper .how-it-works-cashback").removeClass("hidden");
    $(this).hide();
    $(".new-user-wraper-desc .read-less").show();
});
$(".new-user-wraper-desc .read-less").click(function () {
    $(".new-user-wraper-desc,.new-user-wraper .how-it-works-cashback").addClass("hidden");
    $(this).hide();
    $(".user-wraper-desc .read-more").show();
});
$(".auto-test h3 span").hover(function () {
    $('.auto-test-hover').show();
},function () {
   $('.auto-test-hover').hide();
});
$("li.complete-profile span:nth-child(1)").hover(function () {
    $(".complete-profile-tips").show();
},function () {
    $(".complete-profile-tips").hide();
});
$(".need-it-detail .need-it-tips").hover(function () {
    $(".need-it-tips-hover").show();
},function () {
    $(".need-it-tips-hover").hide();
});
$(".close-new-user-wrapper").click(function () {
   $(".new-user-wraper").hide();
});

$("#nocode_task-lists .tasks-category .in-process-part").click(function () {
    $(this).addClass("active").siblings().removeClass("active");
    $("#nocode_task-lists ul.in-process").show();
    $("#nocode_task-lists ul.finished").hide();
});
$("#nocode_task-lists .tasks-category .finished-part").click(function () {
    $(this).addClass("active").siblings().removeClass("active");
    $("#nocode_task-lists ul.in-process").hide();
    $("#nocode_task-lists ul.finished").show();
});
$("#activity_task-lists .tasks-category .in-process-part").click(function () {
    $(this).addClass("active").siblings().removeClass("active");
    $("#activity_task-lists ul.in-process").show();
    $("#activity_task-lists ul.finished").hide();
});
$("#activity_task-lists .tasks-category .finished-part").click(function () {
    $(this).addClass("active").siblings().removeClass("active");
    $("#activity_task-lists ul.in-process").hide();
    $("#activity_task-lists ul.finished").show();
});
$("#welcome_task-lists .tasks-category .in-process-part").click(function () {
    $(this).addClass("active").siblings().removeClass("active");
    $("#welcome_task-lists ul.in-process").show();
    $("#welcome_task-lists ul.finished").hide();
});
$("#welcome_task-lists .tasks-category .finished-part").click(function () {
    $(this).addClass("active").siblings().removeClass("active");
    $("#welcome_task-lists ul.in-process").hide();
    $("#welcome_task-lists ul.finished").show();
});
$(".nav.menu").click(function () {
    $(".nav-list-wrapper").slideToggle("fast");
});

$(function() {
    $(document).bind("click",function(e){
        var target = $(e.target);
        if(target.closest(".nav").length == 0){
            $(".nav-list-wrapper").hide();
        }
    });
});

$(".dailycheck-wraper-left p b").hover(function () {
    $(this).find("span").show();
},function () {
    $(this).find("span").hide();
});

$(".exclusions-tips div").click(function () {
    $(this).next("p").toggle();
    $(this).find("b").toggleClass("up-icon");
});

$(".install-coupert-wrapper button.install-coupert-claim,.join-coupert-wrapper button.join-coupert-claim").click(function () {
    $(".newcomer-benefits .gold-icon").show();
    setTimeout(function () {
        $(".newcomer-benefits .gold-icon").hide();
    }, 2500);
    $(this).hide();
    $(this).next(".claimed").show();
});
$(".top-check-in-after-container .check-in-days button").click(function () {
    $("#store_checkin_page").click();
    delay(500).then(function () {
        $('.check-in-box .container').animate({scrollTop: $('#activity_task-lists').offset().top - 64}, 1000);
    });
});
$(".top-check-in-after-container .close-wrapper").click(function () {
    $(this).parent().hide();
});
$(".searchtxt").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $(this).parents("#search-head").siblings(".container-store-box").find(".code-title").filter(function() {
      $(this).parents('.item-code').toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
});
$(".search-icon").click(function(){
    $('body>div').not('.store-search-box').css("display","none");
    $('.store-search-box').css("display","block");
    $("#ad-panel").css("display","block");
});
$(".search-close").click(function(){
    $(this).closest(".store-search-box").css("display","none");
    $(this).closest("#ad-panel").css("display","none");
    $(".store-home-box").css("display", "block");
});
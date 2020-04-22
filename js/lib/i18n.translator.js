
(function(){
    function translate(key) {
        return chrome.i18n.getMessage(key);
    }

    function i18nTranslator(DOM = document){
        $("[i18n_html]:not(.i18n-replaced)", DOM).each(function() {
            var element = $(this, DOM);
            element.html(translate(element.attr("i18n_html")));
            element.addClass("i18n-replaced");
        });

        $("[i18n_value]:not(.i18n-replaced)", DOM).each(function() {
            var element = $(this, DOM);
            element.val(translate(element.attr("i18n_value")));
            element.addClass("i18n-replaced");
        });

        $("[i18n_title]:not(.i18n-replaced)", DOM).each(function() {
            var element = $(this, DOM);
            element.attr("title", translate(element.attr("i18n_title")));
            element.addClass("i18n-replaced");
        });

        $("[i18n_placeholder]:not(.i18n-replaced)", DOM).each(function() {
            var element = $(this, DOM);
            element.attr("placeholder", translate(element.attr("i18n_placeholder")) + element.attr("placeholder"));
            element.addClass("i18n-replaced");
        });

        $("[i18n_alt]:not(.i18n-replaced)", DOM).each(function() {
            var element = $(this, DOM);
            element.attr("alt", translate(element.attr("i18n_alt")));
            element.addClass("i18n-replaced");
        });
    }

    window.i18nTranslator = i18nTranslator;
})();





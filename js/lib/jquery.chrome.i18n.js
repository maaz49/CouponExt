(function($) {
    $.fn.extend({
        translate: function(){
            $(this).each(function(index, item){
                var key = $(item).attr("i18n");
                var html = $(item).html();
                if (undefined !== html && "" !== html) {
                    $(item).html(chrome.i18n.getMessage(key));
                }
                var placeholder = $(item).attr("placeholder");
                if (undefined !== placeholder && "" !== placeholder) {
                    $(item).attr("placeholder", chrome.i18n.getMessage(key));
                }                
            });
        }
    });
})(jQuery);

$("[i18n]").translate();


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

        $("[i18n_value]:not(.i18n_value-replaced)", DOM).each(function() {
            var element = $(this, DOM);
            element.val(translate(element.attr("i18n_value")));
            element.addClass("i18n_value-replaced");
        });

        $("[i18n_title]:not(.i18n_title-replaced)", DOM).each(function() {
            var element = $(this, DOM);
            element.attr("title", translate(element.attr("i18n_title")));
            element.addClass("i18n_title-replaced");
        });

        $("[i18n_placeholder]:not(.i18n_placeholder-replaced)", DOM).each(function() {
            var element = $(this, DOM);
            element.attr("placeholder", translate(element.attr("i18n_placeholder")));
            element.addClass("i18n_placeholder-replaced");
        });

        $("[i18n_alt]:not(.i18n_alt-replaced)", DOM).each(function() {
            var element = $(this, DOM);
            element.attr("alt", translate(element.attr("i18n_alt")));
            element.addClass("i18n_alt-replaced");
        });

        $("[i18n_src]:not(.i18n_src-replaced)", DOM).each(function() {
            var element = $(this, DOM);
            element.attr("src", translate(element.attr("i18n_src")));
            element.addClass("i18n_src-replaced");
        });
    }

    window.i18nTranslator = i18nTranslator;
})();

i18nTranslator();

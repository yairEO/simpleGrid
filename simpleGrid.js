;(function ($) {
    "use strict";

    var defaults = {
        margin      : 1,   // in percentage, divides across al items
        initialSize : 150, // aim for this size (in PX)
        minSize     : 100
    };

    function createStylesheet(selector){
        var style = $('<style type="text/css" rel="simpleGridStyle">' + selector + '{}' + selector + ':nth-child(n){}</style>');
        return style.appendTo('head')[0];
    }

    $.fn.simpleGrid = function (options){
        defaults.selector = this.selector;
        defaults.itemTagName = $(this.selector).find(':first-child')[0].tagName.toLowerCase();

        return this.each(function(){
            var $obj = $(this),
                simpleGrid = $obj.data('_simpleGrid');

            options = options || {};

            if( simpleGrid ){
                simpleGrid.calc();
                return this;
            }

            if( typeof options === 'object' )
                options = $.extend({}, defaults, options);

            else if( typeof options === 'string' )
                return this;

            // instanciate a new SimpleGrid
            simpleGrid = new SimpleGrid($obj[0], options);
            simpleGrid.init();

            $obj.data('_simpleGrid', simpleGrid);
        });
    };

    // Constructor
    function SimpleGrid(obj, options){
        this.el          = obj;
        this.rowItemsNum = 0;
        this.options     = options;
        this.selector    = this.options.selector + ' > '  + this.options.itemTagName;
        this.styleTag    = createStylesheet(this.selector);

        this.init();
    }

    SimpleGrid.prototype.init = function(){
        $(window).on('resize', this.calc.bind(this) );
        $(this.el).on("webkitTransitionEnd transitionend oTransitionEnd", this.calc.bind(this) );
        this.calc();
    }

    SimpleGrid.prototype.calc = function(){
        var itemsCount = this.el.children.length,
            rowWidth   = this.el.clientWidth,
            O          = this.options,
            itemSize   = 0,
            rule;

        // THE MOST IMPORTANT THING:
        // Do not continue if number of items per row hasn't changed
        // Or when there aren't enough items to fill a row:
        if( this.rowItemsNum == ((rowWidth / O.initialSize)|0) )
            return;

        this.rowItemsNum = (rowWidth / O.initialSize)|0;

        if( this.rowItemsNum > itemsCount ){
            this.updateRule();
            return;
        }

        

        itemSize = (100 - O.margin*(this.rowItemsNum-1)) / this.rowItemsNum; // in '%'

        // check if new size is less than the minimum allowed
        // if so, show less item's per-row
        if( this.el.children[0].clientWidth < O.minSize ){
            if( this.rowItemsNum > 1 )
                this.rowItemsNum--;
            else return;
        }

        this.updateRule(itemSize);
    }

    SimpleGrid.prototype.updateRule = function(width){
        // the style sheet in the style tag
        var sheet = this.styleTag.sheet ? this.styleTag.sheet : this.styleTag.styleSheet;
        // the first rule in the style sheet
        var rules = sheet.cssRules ? sheet.cssRules : sheet.rules,
            delMethod = sheet.cssRules ? 'deleteRule' : 'removeRule',
            addMethod = sheet.cssRules ? 'insertRule' : 'addRule';

        rules[0].style.cssText = width ? 'width:' + width + '%;' : '';

        sheet[delMethod](1);
        sheet[addMethod](this.selector + ':nth-child('+ this.rowItemsNum +'n){margin-right:0}', 1);
    }

})(jQuery);

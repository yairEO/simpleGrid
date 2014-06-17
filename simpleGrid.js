// By Yair Even-Or
// dropthebit.com

;(function ($) {
    "use strict";

    var defaults = {
        margin      : 1,   // in percentage, divides across al items
        initialSize : 150, // aim for this size (in PX)
        minSize     : 100,
        fullRows    : false // hide the last row if it doesn't have enough items to fill all of it
    };

    function createStylesheet(selector){
        var style = $('<style type="text/css" rel="simpleGridStyle">' + selector + '{}' + selector + ':nth-child(n){}</style>');
        return style.appendTo('head')[0];
    }

    $.fn.simpleGrid = function(options){
        defaults.selector = this.selector;

        defaults.itemTagName = options.itemTag || $(this).find(':first-child')[0].tagName.toLowerCase();

        // instatiate a new 'Sticky' object per item that needs to be floated
        return this.each(function(){
            var $obj = $(this),
                simpleGrid = $obj.data('_simpleGrid');

            options = options || {};
            // if already bounded on the element
            if( simpleGrid ){
                if( !$.isEmptyObject(options) ){ // update options
                    options = $.extend({}, simpleGrid.options, options);
                    simpleGrid.options = options;
                    simpleGrid.calc(true);
                }
                else
                  simpleGrid.calc();

                return this;
            }

            if( typeof options === 'object' )
                options = $.extend({}, defaults, options);

            // instanciate a new SimpleGrid
            simpleGrid = new SimpleGrid($obj, options);

            $obj.data('_simpleGrid', simpleGrid);
        });
    };

    // Constructor
    function SimpleGrid(obj, options){
        this.id          = new Array(8).join((Math.random().toString(36)+'00000000000000000').slice(2, 18)).slice(0, 7);
        this.$el         = obj;
        this.el          = obj[0];
        this.itemsPerRow = 0;
        this.options     = options;
        this.selector    = this.options.selector + ' > '  + this.options.itemTagName;
        this.styleTag    = createStylesheet(this.selector);

        $(window).on('resize.simpleGrid' + this.id, this.calc.bind(this) );
        this.calc();
    }

    SimpleGrid.prototype.destroy = function(){
        $(window).off('resize.simpleGrid' + this.id);
        this.styleTag.remove();
    }

    SimpleGrid.prototype.calc = function(forceUpdate){
        var items      = this.el.children,
            itemsCount = items.length,
            rowWidth   = this.el.clientWidth,
            O          = this.options,
            itemSize   = 0,
            rule;

        // THE MOST IMPORTANT THING:
        // Do not continue if number of items per row hasn't changed
        if( !forceUpdate && this.itemsPerRow == ((rowWidth / O.initialSize)|0) )
            return;

        this.itemsPerRow = (rowWidth / O.initialSize)|0;

        if( O.fullRows ){
            this.$el.find('.hidden').removeClass('hidden'); // cleanup

            var howManyTohide = itemsCount % this.itemsPerRow,
                elmsToHide;

            if( howManyTohide ){
                elmsToHide = [].slice.call( items, -howManyTohide );
                elmsToHide.forEach(function(item){
                    $(item).addClass('hidden');
                });
            }
        }

        // when there aren't enough items to fill a row:
        if( this.itemsPerRow > itemsCount ){
            this.itemsPerRow = itemsCount;
            // this.updateRule(); // remove the styling
            // return;
        }

        itemSize = (100 - O.margin*(this.itemsPerRow-1)) / this.itemsPerRow; // in '%'

        // check if new size is less than the minimum allowed
        // if so, show less item's per-row
        if( this.el.children[0].clientWidth < O.minSize ){
            if( this.itemsPerRow > 1 )
                this.itemsPerRow--;
            else return;
        }

        this.updateRule(itemSize, O.margin);
    }

    SimpleGrid.prototype.updateRule = function(width, margin){
        // the style sheet in the style tag
        var sheet = this.styleTag.sheet ? this.styleTag.sheet : this.styleTag.styleSheet,
            rules = sheet.cssRules ? sheet.cssRules : sheet.rules,
            cssText = 'width:' + width + '%; margin-right:'+ margin+ '%; margin-bottom:'+ margin+ '%';

        rules[0].style.cssText = width ? cssText : '';

        if( sheet.cssRules ){
            sheet.deleteRule(1);
            sheet.insertRule(this.selector + ':nth-child('+ this.itemsPerRow +'n){margin-right:0 !important}', 1);
        }
        else{
            sheet.removeRule(1);
            sheet.addRule(this.selector + ':nth-child('+ this.itemsPerRow +'n)', 'margin-right:0 !important', 1);
        }
    }

})(jQuery);
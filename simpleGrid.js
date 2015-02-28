// By Yair Even-Or
// dropthebit.com


;(function ($) {
    "use strict";

    var defaults = {
        margin      : [1,1],   // in percentage, divides across al items
        initialSize : 150, // aim for this size (in PX)
        minSize     : 100,
        fullRows    : false, // hide the last row if it doesn't have enough items to fill all of it
        itemTagName : 'li'
    };

    function createStylesheet(selector){
        var style = $('<style type="text/css" rel="simpleGridStyle">' + selector + '{} ' + selector + ':nth-child(n){}</style>');
        return style.appendTo('head')[0];
    }

    $.fn.simpleGrid = function(options){
        defaults.selector = this.selector || options.selector;
        
        // instantiate a new 'Sticky' object per item that needs to be floated
        return this.each(function(){
            options = options || {};
            
            var $obj       = $(this),
                settings   = $.extend({}, defaults, options),
                simpleGrid = $obj.data('_simpleGrid');

            
            if( options.margin && !(options.margin instanceof Array) )
                settings.margin = [options.margin|0, options.margin|0];
          
          
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

            // if "itemTagName" wasn't provided and the container has child elements, check & set their type (tag name)
            if( !options.itemTagName && this.children[0] )
                settings.itemTagName = this.children[0].tagName.toLowerCase();

            // instantiate a new SimpleGrid
            simpleGrid = new SimpleGrid($obj, settings);

            $obj.data('_simpleGrid', simpleGrid);
        });
    };

    // Constructor
    function SimpleGrid(obj, options){
        this.id          = new Array(8).join((Math.random().toString(36)+'00000000000000000').slice(2, 18)).slice(0, 7); // generate an UID for each instance
        this.$el         = obj;
        this.el          = obj[0];
        this.itemsPerRow = 0;
        this.options     = options;
        this.selector    = options.selector + ' > '  + this.options.itemTagName;
        this.styleTag    = createStylesheet(this.selector);
        
        $(window).on('resize.simpleGrid' + this.id, this.calc.bind(this) ); // please throttle this call
        this.calc();
    }

    SimpleGrid.prototype.destroy = function(){
        $(window).off('resize.simpleGrid' + this.id);

        // if styleTag is in the DOM, remove it
        if( this.styleTag.parentNode )
            this.styleTag.parentNode.removeChild(this.styleTag);
    }

    SimpleGrid.prototype.calc = function(forceUpdate){
        // do not update hidden containers
        if( this.el.clientWidth == 0 )
            return;

        var items      = this.el.children,
            itemsCount = items.length,
            rowWidth   = this.el.clientWidth,
            O          = this.options,
            itemSize   = 0;

        // THE MOST IMPORTANT THING:
        // Do not continue if number of items per row hasn't changed
        if( !forceUpdate && this.itemsPerRow == ((rowWidth / O.initialSize)|0) )
            return;

        // calculate how many items CAN fit a row
        this.itemsPerRow = (rowWidth / O.initialSize)|0;

        if( this.itemsPerRow < 1 )
            this.itemsPerRow = 1;

        // when there aren't enough items to fill a row:
        if( this.itemsPerRow > itemsCount ){
            this.itemsPerRow = itemsCount;
            // this.updateRule(); // remove the styling
            // return;
        }
        else if( O.fullRows ){
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

        itemSize = (100 - O.margin[0]*(this.itemsPerRow-1)) / this.itemsPerRow; // in '%'

        // check if new size is less than the minimum allowed
        // if so, show less item's per-row, so each item will be rendered bigger
        // IE10 - before img is loaded, it has min height and widht of 28, therefor checking "30"
        if( this.el.children[0] && this.el.children[0].clientWidth > 30 && this.el.children[0].clientWidth < O.minSize  ){
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
            cssText = 'width:' + width + '%; margin-right:'+ margin[0] + '% !important; margin-bottom:'+ margin[1] + '% !important',
			nthChildRule = this.selector + ':nth-child('+ this.itemsPerRow +'n){margin-right:0 !important}';

        rules[0].style.cssText = width ? cssText : '';

        if( this.itemsPerRow < 2 )
            return;


        if( sheet.cssRules ){
            sheet.deleteRule(1);
            sheet.insertRule(nthChildRule, 1);
        }
        else{
            sheet.removeRule(1);
            sheet.addRule(nthChildRule, 1);
        }
    }

})(jQuery);
simlpeGrid
========

This grid is good for items which have the same proportions, and are to be aligned perfectly within their containing element. 
The grid works in percentage units, and only changes the DOM when it should (when number of items-per-row has changed). 
Also, the amount of DOM elements does not matter to performance, since the grid does not loop over the items, 
but uses it's own dynamic style element to change the width of the elements.

Weight: ~4kb (uncompressed)

##[View Demo Page](http://cdpn.io/kLjDK)

##[Blog post](http://dropthebit.com/757/)

## How to use:
    $('ul').simpleGrid({
        margin      : .5,  // spacing between grids (only for calculations. set this in CSS as well)
        initialSize : 250, // aim for this size (per item)
        minSize     : 150  // minimum item size
    });
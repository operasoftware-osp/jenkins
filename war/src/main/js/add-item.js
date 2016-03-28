// Initialize all modules by requiring them. Also makes sure they get bundled (see gulpfile.js).
var $ = require('jquery-detached').getJQuery();

var getItems = function(){
  var d = $.Deferred();
  $.get('categories?depth=3').done(
      function(data){
        d.resolve(data);
      }
  );
  return d.promise();
}; 

var jRoot = $('head').attr('data-rooturl');

$.when(getItems()).done(function(data){
  $(function() {

    // The main panel content is hidden by default via an inline style. We're ready to remove that now.
    $('#add-item-panel').removeAttr('style');

    //////////////////////////
    // helper functions...

    function cleanClassName(className){
      return className.replace(/\./g,'_');
    }

    function checkForLink(desc) {
      if (desc.indexOf('&lt;a href="') === -1) {
        return desc;
      }
      var newDesc = desc.replace(/\&lt;/g,'<').replace(/\&gt;/g,'>');
      return newDesc;
    }

    //////////////////////////////////
    // Draw functions

    function drawCategory(category) {
      var $category = $('<div/>').addClass('category').attr('id', 'j-add-item-type-' + cleanClassName(category.id));
      var $items = $('<ul/>').addClass('j-item-options');
      var $catHeader = $('<div class="header" />');
      var title = '<h2>' + category.name + '</h2>';
      var description = '<p>' + category.description + '</p>';

      // Add items
      $.each(category.items, function(i, elem) {
        $items.append(drawItem(elem));
      });

      $catHeader.append(title);
      $catHeader.append(description);
      $category.append($catHeader);
      $category.append($items);

      return $category;
    }

    function drawItem(elem) {
      var desc = checkForLink(elem.description);
      var $item = $(['<li class="', cleanClassName(elem.class), '"><label><input type="radio" name="mode" value="',
      elem.class ,'"/> <span class="label">', elem.displayName, '</span></label></li>'].join('')).append(['<div class="desc">', desc, '</div>'].join('')).append(drawIcon(elem));

      function setSelectState(e) {
        e.preventDefault();
        var $this = $(this).closest('li');
        $this.closest('.categories').find('input[type="radio"][name="mode"]').removeAttr('checked');
        $this.closest('.categories').find('.active').removeClass('active');
        $this.addClass('active');
        $this.find('input[type="radio"][name="mode"]').prop('checked', true);
        $('input[type="text"][name="from"]', '#createItem').val('');
      }
      $item.click(setSelectState);

      return $item;
    }

    function drawIcon(elem) {
      var $icn;
      if (elem.iconFilePathPattern) {
        $icn = $('<div class="icon">');
        var iconFilePath = jRoot + '/' + elem.iconFilePathPattern.replace(":size", "48x48");
        $(['<img src="', iconFilePath, '">'].join('')).appendTo($icn);
      } else {
        $icn = $('<div class="default-icon">');
        var colors = ['c-49728B','c-335061','c-D33833','c-6D6B6D', 'c-6699CC'];
        var desc = elem.description || '';
        var name = elem.displayName;
        var colorClass= colors[(desc.length) % 4];
        var aName = name.split(' ');
        var a = name.substring(0,1);
        var b = ((aName.length === 1) ? name.substring(1,2) : aName[1].substring(0,1));
        $(['<span class="a">',a,'</span><span class="b">',b,'</span>'].join('')).appendTo($icn);
        $icn.addClass(colorClass);
      }
      return $icn;
    }

    // drawTabs(data.categories);

    // Render all categories
    var $categories = $('div.categories');
    $.each(data.categories, function(i, elem) {
      drawCategory(elem).appendTo($categories);
    });

    // Focus
    $("#add-item-panel").find("#name").focus();

    // Init CopyFromField
    $('input[name="from"]', '#createItem').focus(function() {
      $('#createItem').find('input[type="radio"][value="copy"]').prop('checked', true);
      $('.categories').find('.active').removeClass('active');
    });

    // Client-side validation
    $("#createItem").submit(function(event) {
      console.log( "Handler for .submit() called.");
      console.log("JobName: " + $("input[name=name]", "#createItem").val());
      console.log("JobType: " + $("input[type=radio]:checked", "#createItem").val());
      console.log("CopyFromValue: " + $("input[name=from]", "#createItem").val());
      event.preventDefault();
    });
  });
});

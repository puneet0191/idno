/* 
 * Javascript used by the main page shell.
 * 
 * IMPORTANT:
 * This file isn't loaded directly, for changes to show you must generate a minified
 * version. E.g.
 *
 *   yui-compressor shell.js > shell.min.js
 */


function Template() {}

/**
 * Add a notice info
 * @param {type} message
 * @param {type} message_type
 * @returns {undefined}
 */
Template.addMessage = function(message, message_type)
{
    if (message_type === undefined) {
	message_type = 'alert-info';
    }
    
    if (message !== undefined) {
    
	$('div#page-messages').append('<div class="alert ' + message_type + ' col-md-10 col-md-offset-1">' +
			    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
			    message + '</div>');
    }
}


/**
 * Add an error message
 * @param {type} message
 * @returns {undefined}
 */
Template.addErrorMessage = function(message) { Template.addMessage(message, 'alert-danger'); }


function addMessage(message, message_type) { Template.addMessage(); }
function addErrorMessage(message) { Template.addErrorMessage(message); }

/** Enable some form candy, like ctrl+enter submit */
Template.enableFormCandy = function() {
    
    $('.ctrl-enter-submit').keypress(function(event){
	var keyCode = (event.which ? event.which : event.keyCode);  
	
	if ((keyCode == 10 || keyCode == 13) && event.ctrlKey) {
	    
	    $(this).closest('form').submit();
	}
    });
    
}

/** Enable AJAX powered pagination */
Template.enablePagination = function() {
    $('.pager-xhr a').click(function(e) {
            
	e.preventDefault();

	var settings = $(this).closest('.pager-xhr');
	var offset = parseInt(settings.attr('data-offset'));
	var limit = parseInt(settings.attr('data-limit'));
	var count = parseInt(settings.attr('data-count'));
	var control = $('#' + settings.attr('data-control-id'));
	var source = settings.attr('data-source-url');
	var direction = $(this).attr('rel');

	var newercontrol = $(this).closest('.pager-xhr').find('li.newer');
	var oldercontrol = $(this).closest('.pager-xhr').find('li.older');

	// Normalise source, removing get vars (TODO: Do this nicer to preserve non pagination vars
	source = source.split('?')[0];

	var new_offset;

	if (direction == 'next') {

	    new_offset = offset - limit;
	    if (new_offset < 0) new_offset = 0;

	} else {

	    new_offset = offset + limit;
	    if (new_offset > (count - 1)) new_offset = count - 1;
	}


	
	// Fetch new url
	source = source + "?offset=" + new_offset.toString() + "&limit=" + limit.toString();
	control.load(source, function(responseText, status, xhr){
	    if (status != 'error') {
		
		// Update controls
		settings.attr('data-offset', new_offset.toString());

		// Show buttons if necessary
		newercontrol.removeClass('pagination-disabled');
		oldercontrol.removeClass('pagination-disabled');
		if (new_offset == 0)
		    newercontrol.addClass('pagination-disabled');
		if (new_offset > count - limit)    
		    oldercontrol.addClass('pagination-disabled');
		
		// Reset scrollbars
		control.scrollTop(0);
	    }
	}); 
	
    });
}

/**
 * Enable html5 like "required" support for rich text input controls.
 * @returns {undefined}
 */
Template.enableRichTextRequired = function () {

    $('textarea.validation-required').each(function(){
	var form = $(this).closest('form');
	var content = $(this);
	var alert = $(this).closest('div.richtext-container').find('div.alert');
	
	form.submit(function(e){
	    
	    // Hide, if we've previously tried to submit.
	    alert.hide();
	    
	    if (content.val().length == 0) {
		e.preventDefault();
		
		console.error("Required richtext field " + content.attr('name') + ' is blank, preventing form submission');
		
		alert.show().focus();
	    }
	});
	
    });
}

/**
 * Enable fallback image for broken images.
 */
Template.enableImageFallback = function () {
    $("img").on("error", function(){
	console.error("Loading fallback image " + known.config.displayUrl + 'gfx/users/default.png');
        $(this).attr('src', known.config.displayUrl + 'gfx/users/default.png');
    });
}

/**
 * Periodically send the current values of this form to the server.
 *
 * @param string context Usually the type of entity being saved. We keep one autosave
 *     for each unique context.
 * @param array elements The elements to save, e.g. ["title", "body"].
 * @param object selectors (optional) A mapping from element name to its unique
 *     JQuery-style selector. If no mapping is provided, defaults to "#element";
 */
Template.autoSave = function (context, elements, selectors) {
    var previousVal = {};
    setInterval(function () {
	var changed = {};
	for (var i = 0; i < elements.length; i++) {
	    var element = elements[i];
	    var selector = "#" + element;
	    if (selectors && element in selectors) {
		selector = selectors[element];
	    }
	    var val = false;
	    if ($(selector).val() != previousVal[element]) {
		val = $(selector).val();
	    }
	    if (val !== false) {
		changed[element] = val;
		previousVal[element] = val;
	    }
	}
	if (Object.keys(changed).length > 0) {
	    $.post(wwwroot() + 'autosave/',
		    {
			"context": context,
			"elements": changed,
			"names": elements
		    },
		    function () {
		    }
	    );
	}
    }, 10000);
}


/**
 * Periodically send the current values of this form to the server.
 *
 * @deprecated use Template.autoSave()
 */
function autoSave(context, elements, selectors) {
    return Template.autoSave(context, elements, selectors);
}

/** Configure timeago and adjust videos in content */
function annotateContent() {
    $(".h-entry").fitVids();
    $("time.dt-published").timeago();
}

$(document).ready(function () {
    $.timeago.settings.cutoff = 30 * 24 * 60 * 60 * 1000; // 1 month
    annotateContent();
});

/**
 * Better handle links in iOS web applications.
 * This code (from the discussion here: https://gist.github.com/kylebarrow/1042026)
 * will prevent internal links being opened up in safari when known is installed
 * on an ios home screen.
 */
(function (document, navigator, standalone) {
    if ((standalone in navigator) && navigator[standalone]) {
        var curnode, location = document.location, stop = /^(a|html)$/i;
        document.addEventListener('click', function (e) {
            curnode = e.target;
            while (!(stop).test(curnode.nodeName)) {
                curnode = curnode.parentNode;
            }
            if ('href' in curnode && (curnode.href.indexOf('http') || ~curnode.href.indexOf(location.host)) && (!curnode.classList.contains('contentTypeButton'))) {
                e.preventDefault();
                location.href = curnode.href;
            }
        }, false);
    }
})(document, window.navigator, 'standalone');

// Open external links in new tab
$(document).ready(function(){
    $('body').on('click', function (event, el) {
        var clickTarget = event.target;

        if (clickTarget.href && clickTarget.href.indexOf(window.location.origin) === -1) {
            clickTarget.target = "_blank";
        }
    });
});

// Enable ctrl+enter submit for certain forms
$(document).ready(function(){
    Template.enableFormCandy();
    Template.enablePagination();
    Template.enableRichTextRequired();
    Template.enableImageFallback();
});
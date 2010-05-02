/**
 * Import script for the HTML5 Security Cheatsheet HTML version
 */
(function(){
    window.onload = function() {
        (function() {
            // enumerate categories and build initial lists
            for(var category in categories) {
                // determine navigator language or set default
                var lang = navigator.language ? navigator.language : 'en';
                if(typeof categories[category][lang] === 'undefined' || !categories[category][lang]) {
                    lang = 'en';
                }
                // check if translated items exist
                if (typeof categories[category][lang] === 'string') {
                    $('#categories').append('<li id="' + category + '"><h3>' 
                        + categories[category][lang] + '</h3></li>');
                    $('#sidebar').append('<li><a href="#' + category + '">' 
                        + categories[category][lang] + '</a></li>');
                }
			}
			$('#categories li').wrap('<ul/>');
			$('#sidebar li').wrap('<ul/>');
        })();
        (function() {
            for (var item in items) {
                // replace the payload templates
                for (var payload in payloads) {
                    var regex = new RegExp('%' + payload + '%');
                    items[item].data = items[item].data.replace(regex, payloads[payload]);
                }
                // sanitize the input
                items[item].data = items[item].data.replace(/&/gm, '&amp;');
                items[item].data = items[item].data.replace(/</gm, '&lt;');
                items[item].data = items[item].data.replace(/>/gm, '&gt;');   
                             
                // build markup container for the content
                var li = $('#categories li#'+items[item].category+' h3');
                var container = $($('#item_template').html());
                
                // enable direct vector navi by id
                container.prepend('<a name="'+items[item].id+'"></a>');
                
                for(var c in items[item]) {
                    // determine navigator language or set default
                    var lang = navigator.language ? navigator.language : 'en';
                    if(typeof items[item][c][lang] === 'undefined' || !items[item][c][lang]) {
                        lang = 'en';
                    }
                    // check if translated items exist
                    if(typeof items[item][c][lang] === 'string') {
                        items[item][c][lang] = items[item][c][lang].replace(/</gm, '&lt;');
                        items[item][c][lang] = items[item][c][lang].replace(/>/gm, '&gt;');                        
                        container.find('.'+c).html(items[item][c][lang]);
                        if(c === 'name'){
                            container.find('.'+c).append('<a href="#'+items[item]['id']
                                +'">#'+items[item]['id']+'</a>') 
                        }
                    } else if(typeof items[item][c] === 'string') {
                        items[item][c] = items[item][c].replace(/</gm, '&lt;');
                        items[item][c] = items[item][c].replace(/>/gm, '&gt;');                        
                        container.find('.'+c).html(items[item][c]);   
                    }
                }
                // fill browser list
                if(items[item].browsers) {
                    for(var browser in items[item].browsers) {
                        container.find('.browsers').append('<ul class="'+browser+'" />');
                        for(var version in items[item].browsers[browser]) {
                            var short_browser = browser.replace(/^(\w+)\s\w+/, '$1'); 
                            container.find('.browsers .'+short_browser).append(
                                '<li>'+browser+' '+items[item].browsers[browser][version]+'</li>'
                            )
                        }
                    }
                    container.find('.browsers').append('<span class="clear"></span>');
                }   
                // fill tag list
                if(items[item].tags) {
                    for(var tag in items[item].tags) {
                        container.find('.tags').append('<li>'+items[item].tags[tag]+'</li>');
                    } 
					container.find('.tags').append('<span class="clear"></span>');
                }   
                // fill ticket list
                if(items[item].tickets) {
                    for(var ticket in items[item].tickets) {
                        container.find('.tickets').append(
                            '<li><a href="'+items[item].tickets[ticket]+'" target="_blank">'
                                + items[item].tickets[ticket]+'</a></li>'
                        );
                    } 
                } 
                li.parent().append(container);
            }
            // enable direct jumps via hash url
		    if(location.hash && location.hash.match(/^#\w+$/)) {
		        location=location.hash;
		    }
        })();
        
        // search functionality
        (function(){
            $('#search').live('keyup', function(){
                var term = $('#search').attr('value');
                term = term.replace(/([\[\]\(\\)\{\}])/g, '\\$1');
                term = term.replace(/&/g, '&amp;');
                term = term.replace(/</g, '&lt;');
                term = term.replace(/>/g, '&gt;');  
                if(term) {
                    $('div.item').each(function(){
                        if($(this).html().match(new RegExp(term), 'i')) {
                            $(this).show();
                            $('#categories').attr(
                                {scrollTop: $('div.item:visible')
                                    .first().attr('scrollHeight')}
                            );                            
                        } else {$(this).fadeOut('fast')}
                    });
                } else {$('div.item').show()}
            });
            $('#search').live('dblclick', function(){
                $(this).attr('value', '').keyup();
            }); 
        })();
    };
})();
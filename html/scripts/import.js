/**
 * Import script for the HTML5 Security Cheatsheet HTML version
 */
(function(){
    window.onload = function() {
        (function() {
            for(var category in categories) {
                $('#categories').append('<li id="'+category+'"><h3>'+categories[category]+'</h3></li>');
                $('#sidebar').append('<li><a href="#'+category+'">'+categories[category]+'</a></li>');
			}
			$('#categories li').wrap('<ul />');
			$('#sidebar li').wrap('<ul />');
        })();
        (function() {
            for (var item in items) {
                for (var payload in payloads) {
                    var regex = new RegExp('%' + payload + '%');
                    items[item].data = items[item].data.replace(regex, payloads[payload]);
                    items[item].data = items[item].data.replace(/&/gm, '&amp;');
                    items[item].data = items[item].data.replace(/</gm, '&lt;');
                    items[item].data = items[item].data.replace(/>/gm, '&gt;');
                }
                var li = $('#categories li#'+items[item].category+' h3');
                var container = $($('#item_template').html());
                
                for(var c in items[item]) {
                    if(typeof items[item][c] === 'string') {
                        items[item][c] = items[item][c].replace(/&/gm, '&amp;');
                        items[item][c] = items[item][c].replace(/</gm, '&lt;');
                        items[item][c] = items[item][c].replace(/>/gm, '&gt;');                        
                        container.find('.'+c).html(items[item][c]);        
                    }
                }
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
                if(items[item].tags) {
                    for(var tag in items[item].tags) {
                        container.find('.tags').append('<li>'+items[item].tags[tag]+'</li>');
                    } 
					container.find('.tags').append('<span class="clear"></span>');
                }   
                if(items[item].tickets) {
                    for(var ticket in items[item].tickets) {
                        container.find('.tickets').append(
                            '<li><a href="'+items[item].tickets[ticket]+'" target="_blank">'+items[item].tickets[ticket]+'</a></li>'
                        );
                    } 
                }                  
                li.after(container);
            }
		    if(location.hash && location.hash.match(/^#\w+$/)) {
		        location=location.hash;
		    }			
        })();
    };
})();
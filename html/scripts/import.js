/**
 * Import script for the HTML5 Security Cheatsheet HTML version
 */
(function(){
    window.onload = function() {
        // sanitize
        var sanitize = function(input){
            output = input.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;').replace(/>/g, '&gt;');              
            return output;
        };
        // categories
        (function() {
            // enumerate categories and build initial lists
            for(var category in categories) {
                // determine navigator language or set default
                var lang = navigator.language ? navigator.language : 'en';
                if(typeof categories[category][lang] === 'undefined' 
                    || !categories[category][lang]) {
                    lang = 'en';
                }
                // check if translated items exist
                if (typeof categories[category][lang] === 'string') {
                    $('#content').append('<li id="' + category + '"><h3>' 
                        + categories[category][lang] + '</h3></li>');
                    $('#sidebar').append('<li><a href="#' + category + '">' 
                        + categories[category][lang] + '</a></li>');
                }
            }
            $('#content li').wrap('<ul/>');
            $('#sidebar li').wrap('<ul/>');
        })();
        // content
        (function() {
            for (var item in items) {
                // replace the payload templates
                for (var payload in payloads) {
                    var regex = new RegExp('%' + payload + '%');
                    items[item].data = items[item].data.replace(regex, payloads[payload]);
                    if(items[item].attachment && items[item].attachment.raw) {
                        items[item].attachment.raw = items[item].attachment.raw.replace(regex, payloads[payload]);                        
                    }
                }
                // sanitize the input
                //items[item].data = sanitize(items[item].data);
                             
                // build markup container for the content
                var li = $('#content li#'+items[item].category+' h3');
                var container = $($('#item_template').html());
                
                // enable direct vector navi by id
                container.prepend('<a name="'+items[item].id+'"></a>');
                for(var c in items[item]) {
                    // determine navigator language or set default
                    var lang = navigator.language ? navigator.language : 'en';
                    if(typeof items[item][c][lang] === 'undefined' 
                        || !items[item][c][lang]) {
                        lang = 'en';
                    }
                    // check if translated items exist
                    if(typeof items[item][c][lang] === 'string') {
                        container.find('.'+c).html(sanitize(items[item][c][lang]));
                        if(c === 'name'){
                            container.find('.'+c).append('<a href="#'+items[item]['id']
                                +'">#'+items[item]['id']+'</a>') 
                        }
                    } else if(typeof items[item][c] === 'string') {
                        container.find('.'+c).html(sanitize(items[item][c]));   
                    }
                }
                // check for attachment data
                if(items[item].attachment) {
                    container.find('.attachment').show().append(sanitize(items[item].attachment.raw));
                    if(items[item].attachment.mime) {
                        container.find('.attachment').append('<span class="mime">MIME: '+items[item].attachment.mime+'</span>');
                    }
                    if(items[item].attachment.name) {
                        container.find('.attachment').append('<span class="name">Name: '+items[item].attachment.name+'</span>');
                    }
                    if(items[item].attachment.path) {
                        container.find('.attachment').append('<span class="path">Path: '+items[item].attachment.path+'</span>');
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
                        container.find('.tags')
                            .append('<li>'+items[item].tags[tag]+'</li>');
                    } 
                    container.find('.tags')
                        .append('<span class="clear"></span>');
                }   
                // fill ticket list
                if(items[item].tickets) {
                    for(var ticket in items[item].tickets) {
                        container.find('.tickets').append(
                            '<li><a href="'+items[item].tickets[ticket]
                                +'" target="_blank">'
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
            $('ul.tags li, ul.browsers li').live('click', function(){
                $('#search').attr('value', $(this).html()).keyup();        
            });
            $('#search').live('keyup', function(){
                var term = $('#search').attr('value');
                term = term.replace(/([\[\]\(\\)\{\}\+\-])/g, '\\$1');
                term = sanitize(term);
                if(term) {
                    $('div.item').each(function(){
                        if($(this).html().match(new RegExp(term, 'gi'))) {
                            $(this).show();
                            $(document).scrollTop(
                                $('div.item:visible').first().attr('scrollHeight')
                            );                            
                        } else {$(this).hide()}
                    });
                } else {$('div.item').show()}
            });
            $('#search').live('dblclick', function(){
                $(this).attr('value', '').keyup();
            }); 
            $('#sidebar a').live('click', function(){
                $('#search').attr('value', '').keyup();
            }); 
            // enable direct jumps via hash url
            if(location.search) {
                var search = unescape(location.search.replace(/^\?/, ''));
                $('#search').attr('value', search).keyup();
            }
        })();
    };
})();
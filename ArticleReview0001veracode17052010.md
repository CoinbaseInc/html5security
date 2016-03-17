# Introduction #

After stumbling over a tweet telling about an article on HTML5 security (linked later on) and ranting about it @rgaucher asked for a comment on this rant - so here we go.

We haven't seen so many articles about the security implications HTML5 ships. I am not ranting against articles about that in general - the more (better) the better - just this one was full of things you wouldn't wanna have on your dinner table and kind of missing the turkey.

# Rant #

Almost any single line in this article is wrong http://www.veracode.com/blog/2010/05/html5-security-in-a-nutshell/ wow #fail

http://twitter.com/0x6D6172696F/statuses/14254551498

# Reasons #

  * Cite: Don’t Forget Origin Checks on Cross-Document Messaging
    * Those checks are implicit - as a developer you have to do it wrong on purpose. You really have to want it. Especially when handling the message - why not mentioning native JSON here as an awesome alternative to eval() or `__defineSetter__()` and friends? And... code please! Don't tell to not mess up - show how to mess up and how **not** to!

  * Cite: Local Storage Isn’t as Problematic as You Think
    * Oh it isn't?  We are talking about XSS here and we are talking about the combination XSS and SQLI - in case the website uses `localStorage`, `globalStorage` or `openDatabase()` and XSS will have more impact than in most known scenarios. Once you have a script running on the target domain the client side database is yours - no matter if `localStorage` NVPs or SQLite via openDatabase or the other client side storage mechanisms. It _is_ as problematic as you think.

  * Cite: New Tags Increase Attack Surface
    * No they don't. Testing with enumeration and fuzzing showed that not the tags are the problem - but the attributes. And what browsers do with it. `<video>` and `<audio>` don't cause too much harm from a web security perspective - there's nothing they do `<object>` hasn't done before and that much worse. Not to even mention `<applet>`. Think about the attributes - "autofocus", "poster", "formaction", and all the stuff that has been there before - the tags were never the real problem.

  * Cite: Local storage doesn’t appear to present major security risks, despite a lot of FUD circulating on the topic.
    * Citation needed - especially on the FUD.

  * Cite: Developers Should Be Wary of Cross-Origin JavaScript Requests
    * Yes - and? It's easy to make cross domain requests - use images, style sheets, scripted forms whatever. What's hard is reading the response - and that's what's relevant for most attack patterns in this direction either. Don't blame XDR for what HTTP did wrong.

  * Cite: Developers need to be aware of both probe types and ensure that their applications won’t be fooled by probes
    * They had to be 15+ years ago - HTML5 does not change the matter.

  * Cite: Fortunately, cookies aren’t passed in any browser’s probe request.
    * Really? And even if? If an attacker would be able to conduct a cross domain preflight containing cookies and XSS or worse would be the basis. In that situations cookies are dough - the user can be "remoted" anyway. A talented attacker doesn't need cookies anymore in case s?he is able to perform XDR preflights.

  * Cite: Sandbox Attribute Could Make Security Easier
    * Nope - it doesn't. We have the SOP for this and it (usually) works for cross domain restrictions. One problem the "sandbox" attribute can actually solve if implemented correctly are frame busters via "allow-scripting". Since no user agent has actually implemented the sandbox so far it's still a lot of hypothesis powder involved in saying it makes security easier. What will the "webmaster" do with sand-boxed `<iframe>` tags and let's say his precious money making ad banners and skyscrapers? No JavaScript for them? Or better some flash? Or no `<iframes>` at all? Sand-boxed frames raise a lot of new questions instead of solving them. Again you managed to invert HTML5 goodies to be problematic and vice versa. And what about "seamless" iframes?

  * Cite: Always Remember Input Validation
    * Ah - right! Input validation. I totally forgot in my new project... no comments on that educational gem. So - what makes input validation in the HTML5 era special? What should we be taking care of? What are critical things to keep in kind? Input validation to prevent client side SQL injection maybe? New attributes that need to be black-listed? Or less attributes to be white-listed?

# Conclusion #

So - where's the actual substance - none of the _real_ HTML5 security problems were addressed. Attributes, `undoManager`, inline SVG, `<meta charset>`, the "autofocus" related security implications. What about `<iframe>` "srcdoc"? What about focus stealing attacks? What about `toStaticHtml()`? What about DoS via client side regex validation? Where's actual advice on how to do it better? And not to forget about the things HTML5 actually fixes - like the weird SHORTTAG syntax - compare Firefox 3.6+ in HTML4 and HTML5 mode with this example `<p<a href="javascript:alert(1)">a</>b`...

I would have ranted more if it weren't 2am. Maybe more tomorrow. Open for comments.

# Material #

  * http://simon.html5.org/html5-elements
  * https://developer.mozilla.org/En/DOM/Window.postMessage
  * http://msdn.microsoft.com/en-us/library/cc848909%28VS.85%29.aspx
  * http://blog.whatwg.org/whats-next-in-html-episode-2-sandbox
  * http://diveintohtml5.org/forms.html
  * http://dev.w3.org/html5/spec-author-view/dnd.html#the-undomanager-interface
  * http://www.w3.org/QA/2007/10/shorttags.html
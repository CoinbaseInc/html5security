## Introduction ##

Redirects are often important tools for attackers and even more often ignored as such. They can be used to initialize attacks, jump to malicious URLs, hide important content visible in the address bar or execute script code. This wiki page attempts to list all of them -  no matter if initiated by the browser or delegated to the browser by other tools such as Flash content, Java applets and PDF files.

Great information on redirection methods can also be found here:
  * http://en.wikipedia.org/wiki/URL_redirection
  * http://www.owasp.org/index.php/Top_10_2010-A10-Unvalidated_Redirects_and_Forwards

Not so great and hopefully soon to be updated info can be found here:
http://www.owasp.org/index.php/Open_redirect

## Redirection Methods ##

### HTML ###

| **Name** | **Code** | **Cross Domain** | **User Interaction** | **Referrer Leak** | **Notes** |
|:---------|:---------|:-----------------|:---------------------|:------------------|:----------|
| META Refresh | `<meta http-equiv="refresh" content="0;url=http://evil.com/" />` | Yes              | No                   |                   | Depending on the user agent the target can consist of `javascript:` or `data:` URIs to execute JavaScript. While Internet Explorer 8 and and Firefox forbid `javascript:` URIs, Opera, Safari and even Chrome will execute JavaScript on the originating domain. Firefox allows data URIs - they will execute on `about:blank` though. More info can be found here: http://en.wikipedia.org/wiki/Meta_refresh |
| META Location | `<meta http-equiv="location" content="URL=http://evil.com" />` | Yes              | No                   |                   | Not many user agents support this method anymore. Some resources such as http://help.dottoro.com/lhquobhe.php claim it works on all browsers - which has been falsified during testing. |
| BASE Hijacking | `<base href="http://evil.com/" />` | Yes              | Yes                  |                   | The `base` tag can be used to supply relative links with domain and protocol handler differing from the one of the loaded document. Most browsers still support this tag - some even allow to execute JavaScript with especially crafted `base` tag data http://html5sec.org/#42 |

### JavaScript ###

| **Name** | **Code** | **Cross Domain** | **User Interaction** | **Referrer Leak** | **Notes** |
|:---------|:---------|:-----------------|:---------------------|:------------------|:----------|
| Setting location | `location='http://evil.com/';` | Yes              | No                   |                   | Note that you can access location by either using location, `window.location` (including all `window`, `parent` and `top` aliases) as well as `document.location` in most user agents. This is for the following variable assignments and method calls too. All properties can be set with `javascript:`, `data:` or `vbscript:` URIs to execute JavaScript on the originating domain. See MDC on `location` for more info: https://developer.mozilla.org/en/window.location |
| Setting location.href | `location.href='http://evil.com/';` | Yes              | No                   |                   | Similar to setting the `location` object. |
| Setting location.host | `location.host='http://evil.com/';` | Yes              | No                   |                   | Enables to manipulate the host(name) - but no other parts of the URI. |
| Setting location.hostname | `location.hostname='http://evil.com/';` | Yes              | No                   |                   | Enables to manipulate the hostname - but no other parts of the URI. |
| Setting location.reload | `location.reload='http://evil.com/';` | Yes              | No                   |                   | Works on Internet Explorer. Most methods of the `location` object can just be assigned with values to perform arbitrary redirects. |
| Calling location.replace() | `location.replace('http://evil.com/');` | Yes              | No                   |                   | Simple replacement of the whole URI. Works with arbitrary protocol handlers such as `javascript:`. |
| Calling location.assign() | `location.assign('http://evil.com/');` | Yes              | No                   |                   | Simple assignment of a new URI. Works with arbitrary protocol handlers such as `javascript:`. |
| Calling location.reload() | `location.reload('http://evil.com/');` | Yes              | No                   |                   | Simple assignment of a new URI. Works with arbitrary protocol handlers such as `javascript:`. |
| Calling window.navigate() | `window.navigate('http://evil.com/');` | Yes              | No                   |                   |  This method is non-standard and currently being supported by Internet Explorer and Opera. http://msdn.microsoft.com/en-us/library/ms536638%28v=vs.85%29.aspx |
| Calling window.open() | `window.open('http://evil.com/');` | Yes              | Yes                  |                   | Most modern browsers will activate the popup blocker before performing the request. Thus the user interaction flag is set to `Yes`. This method call is not necessarily a redirect but can be turned into one by consolidating name and target value of opener and popup. Arbitrary URIs and protocol handlers can be used with this method. |
| Calling showModalDialog() | `window.showModalDialog('http://evil.com/');` | Yes              | Yes                  |                   | Same as with `window.open()` this method call activates the popup blocker if not called with a trusted event. Arbitrary URIs and protocol handlers can be used with this method. http://msdn.microsoft.com/en-us/library/ms536759%28v=vs.85%29.aspx |
| Calling showModelessDialog() | `window.showModelessDialog("http://evil.com/");` | Yes              | No                   |                   | Only works on Internet Explorer. Same as with `window.open()` this method call activates the popup blocker if not called with a trusted event. Arbitrary URIs and protocol handlers can be used with this method. http://msdn.microsoft.com/en-us/library/ms536761%28v=vs.85%29.aspx |
| Setting document.URL | `document.URL='http://evil.com/';` | Yes              | No                   |                   | This non standard behavior only works in Internet Explorer. Its possible to use arbitrary protocol handlers - such as for example `javascript:` and `vbscript:` to execute JavaScript. |
| Evil Framebuster | `top.location.href='http://evil.com/'` | Yes              | No                   |                   | Equivalent to the aforementioned location setters - yet worth mentioning due to many popular services allowing `iframe` from trusted and semi-trusted domains |
| History pushState() Redirect | `with(history)pushState(null, null, 'http://evil.com/'),go()` | No               | No                   |                   | HTML5 enabled browsers supporting `history.pushState()` provide another possibility to conduct on-site redirects. Note that the URL passed as third method argument has to comply the SOP rules. http://html5sec.org/#103 |
| History go() Redirect | `history.go('http://evil.com/')` | Yes              | Yes/No               |                   | This trick is working on Internet Explorer - but requires the user to have visited the redirect target before so it's exact representation occurs in the history array: http://msdn.microsoft.com/en-us/library/ms536443%28v=VS.85%29.aspx |


### Flash ###

| **Name** | **Code** | **Cross Domain** | **User Interaction** | **Referrer Leak** | **Notes** |
|:---------|:---------|:-----------------|:---------------------|:------------------|:----------|
| getURL() Redirect | `getURL('http://evil.com/', '_self')` | Yes              | No                   |                   | It is possible to use `javascript:` URIs and other protocol handlers to execute JavaScript. The domain context depends on the domain the Flash file is being stored on if opened directly - or embedded from if instantiated via `<object>` or `<embed>`. More info on `getURL()` can be found here: http://kb2.adobe.com/cps/141/tn_14192.html This method has been introduced with ActionScript 2.0. |
| navigateToURL() Redirect | ` var url:URLRequest = new URLRequest("http://www.adobe.com");navigateToURL(url, "_self");` | Yes              | No                   |                   | The `navigateToURL()` method is the ActionScript 3.0 equivalent for `getURL()`. As `getURL()` this method can be used with `javascript:` URIs and other protocol handlers. More info can be found here: http://kb2.adobe.com/cps/141/tn_14192.html#main_getURL_navigateToURL |
| fscommand Redirects | `fscommand("open", "http://evil.com/|foo");` | Yes              | No                   |                   | The `fscommand` method is used to execute methods available on the HTML page embedding the Flash file. Multiple parameters can be separated by the pipe character `|` as shown in http://kb2.adobe.com/cps/141/tn_14192.html#main_fscommand |
| ExternalInterface | `ExternalInterface.call("window.open", "http://evil.com", "foo");` | Yes              | No                   |                   | Similar to `fscommand` the `ExternalInterface` object and its `call()` method can be used to execute JavaScript on the embedding HTML document. The object is available since Flash Player version 8 http://kb2.adobe.com/cps/141/tn_14192.html#main_ExternalInterface |


### Java ###

| **Name** | **Code** | **Cross Domain** | **User Interaction** | **Referrer Leak** | **Notes** |
|:---------|:---------|:-----------------|:---------------------|:------------------|:----------|
| Applet showDocument() | `getAppletContext().showDocument(new URL('http://evil.com'), '_self');` | Yes              | No                   |                   | The Java applet can redirect the user agent to any given HTTP URL. Note that current Java Runtime Engine versions use a whitelist of protocol handlers. http://download.oracle.com/javase/1.4.2/docs/api/java/applet/AppletContext.html#showDocument%28java.net.URL%29  |
| Applet and internal Java Browser | `with(new Packages.javax.swing.JFrame()){add(new Packages.javax.swing.JEditorPane('http://evil.com/')), setSize(500,500),setVisible(true)`} | No               | No                   |                   | Java provides an internal minimalistic browser. This tool is capable for rendering minimal HTML but can be used to leverage more complex attacks. The show demo code is working on Gecko based browsers when executed as JavaScript. http://download.oracle.com/javase/1.4.2/docs/api/javax/swing/JEditorPane.html |


### PDF ###

| **Name** | **Code** | **Cross Domain** | **User Interaction** | **Referrer Leak** | **Notes** |
|:---------|:---------|:-----------------|:---------------------|:------------------|:----------|
| launchURL() Redirect | `app.launchURL('http://evil.com/', false)` | Yes              | Yes/No               |                   | Note that an embedded Adobe PDF reader can redirect without user interaction in case the SOP is not being violated by the redirect target. Otherwise modern versions of the Acrobat Reader pop up a confirmation dialog before redirecting. Adobe Script uses a blacklist to forbid redirects to file:, javascript: and data: URIs as well as vbscript:  and jscript: URIs. You can find more information on `app.launchURL()` in he Acrobat Script documentation:  http://livedocs.adobe.com/acrobat_sdk/9.1/Acrobat9_1_HTMLHelp/wwhelp/wwhimpl/common/html/wwhelp.htm?context=Acrobat9_HTMLHelp&file=JS_API_AcroJS.88.150.html Note that the Adobe Reader will open the page to redirect on in the default browser - which is not necessarily the browser showing the document with the embedded PDF. |
| getURL() Redirect | `app.getURL('http://evil.com/', false)` | Yes              | Yes/No               |                   | This method has been heavily restricted security wise and can only be used as a redirect helper in Acrobat versions older than Acrobat 6.0. The documentation for this method can be found here: http://livedocs.adobe.com/acrobat_sdk/9.1/Acrobat9_1_HTMLHelp/wwhelp/wwhimpl/common/html/wwhelp.htm?context=Acrobat9_HTMLHelp&file=JS_API_AcroJS.88.495.html |


### Quicktime ###
| **Name** | **Code** | **Cross Domain** | **User Interaction** | **Referrer Leak** | **Notes** |
|:---------|:---------|:-----------------|:---------------------|:------------------|:----------|
| Redirect via QTL/qtnext | `<?xml version="1.0"?><?quicktime type="application/x-quicktime-media-link"?><embed qtnext="http://evil.com/" src="sample_iTunes.mov" />` | Yes              | No                   |                   | Quicktime files - usually when embedded - support redirection via the proprietary `qtnext` parameter. It's also possible to redirect to the given website if the shown code is placed inside a QTL file and then opened in the Quicktime player. The example code works for QTL files as well as for embedding. http://developer.apple.com/library/mac/#qa/qa2008/qa1593.html  |

### XML ###

| **Name** | **Code** | **Cross Domain** | **User Interaction** | **Referrer Leak** | **Notes** |
|:---------|:---------|:-----------------|:---------------------|:------------------|:----------|
| XLink Redirect | `<x xmlns:xlink="http://www.w3.org/1999/xlink" xlink:actuate="onLoad" xlink:href="http://evil.com" xlink:type="simple"/>` | Yes              | No                   |                   | This example currently works on Gecko based browsers. XLink `href` attributes can be triggered to be activated by an XLink `actuate` attribute applied with `onload`. This kind of redirect is thus basically a self-clicking link. More info is available here:  http://html5sec.org/#81 |


### OpenOffice ###

TBD

### Special Cases ###

| **Name** | **Code** | **Cross Domain** | **User Interaction** | **Referrer Leak** | **Notes** |
|:---------|:---------|:-----------------|:---------------------|:------------------|:----------|
| Pidgin, Kopete, other Instant Messengers | `<a href="file:///">http://www.google.com/</a>` | Yes              | Yes                  |                   | Many instant messaging tools and libraries allow posting links jumping to `file:` or `data:` URIs. This allows attackers to exploit local DOMXSS and hide payload in data URIs. Often the window manager in use plays a role too. Pidgin on Gnome for example utilizes `gnome-open` to delegate URIs. |
| Wedia Player ASF Banner Redirect | `<ASX Version="3"><TITLE></TITLE><ENTRY><REF HREF="some-video.asf" /><BANNER HREF="some-image.png" ><MOREINFO HREF="http://evil.com/" target="_self" /></BANNER></ENTRY></ASX>` | Yes              | Yes                  |                   | Recent Windows Media Player versions allow to fetch external HTTP data for in-video banner images. Those can be over-layed with a link that will be opened in the default browser on click. |
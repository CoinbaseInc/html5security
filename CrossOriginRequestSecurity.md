#Guide to Secure Implementation of HTML5's Cross Origin Requests

# Introduction #

Ajax requests have traditionally been restricted by the Same Origin Policy which only allowed them to make request to resources within the same domain. HTML5 breaks this restriction and allows for Ajax requests to be made across domains. We’ll discuss the security implications of the same and provide pointers on how Cross Origin Requests(COR) can be implemented securely.

# What’s New #

It has always been possible for the browser so make cross origin requests by specifying a resource from a foreign domain in the IMG, SCRIPT, IFRAME tags etc. But with these requests the client-side script does not have access to the content of this resource, it can only be executed or rendered by the browser.

Whereas COR enables  JavaScript to read the content of the foreign site through the ‘responseText’ property.

# Differences from crossdomain.xml #

Plug-ins like Flash and Silverlight are also able to make cross domain requests and read the response. However their design is completely different from COR’s.

In the case of Flash or Silverlight a Crossdomain.xml file is created on the server stating which domain can make cross domain requests to this site. And if http://your.site allows http://my.site in its policy file then http://my.site can access all the files in http://your.site. It’s a per-site access-control mode. Either you allow a foreign site to access all your resources or none of your resources.

COR on the other hand, works on a per-page access-control model. Every page has to respond with a special header, the ‘Access-Control-Allow-Origin’ header to be accessible by a foreign site. This is a significant difference because you can only expose limited portions of your website to foreign sites while keeping the rest inaccessible.
And in the COR model the responsibility of Access Control is in the hands of the developers and not the server administrators. The developers have to write special code in those pages that should be accessible by foreign sites.

Another major difference is that in Flash/Silverlight, the crossdomain.xml file of a site is first fetched and analyzed by the browser. If a foreign site is not allowed to make cross domain calls based on the file then the browser restricts any calls from being made.

CORs on the other hand, makes the request first and then checks the ‘Access-Control-Allow-Origin’ header on the response. If this header allows the foreign site then it can read the response otherwise the response is inaccessible to JavaScript. However if the request is not a Simple COR then there is a Preflight request sent and based on the permissions defined in the response the browser decides to send the COR or reject it.


This article will cover some of the potential mistakes that developers/implementers can make with COR and provide suggestions on how they can be avoided to create a secure implementation.

# Potential Security Concerns with COR #

  * Universal Allow:
  * Site-level Cross Origin Access:
  * Access-control decision based on Origin header:
  * Prolonged caching of Preflight responses:
  * Misplaced-trust
  * Processing rogue COR

## Universal Allow: ##

This is the most common and obvious mistake that implementers can be make. The ‘Access-Control-Allow-Origin’ header should contain the list of Origins that can make COR. This header also takes a wildcard value – `*`. This value would allow any website to make a COR to that page and read the response.

This can be abused in some cases:
  * If a part of an intranet website which is not accessible from outside has an universal allow option and if an internal user visits an attacker controlled website, the attacker’s site can make COR to this internal resource, read the response and steal it.

  * A variation of this is when a website is accessible on the internet but has a slightly different behavior when accessed from the intranet. For example, if you make a Google search from within the Google intranet then apart from the features available to external users, there might be some new experimental extra features.  And if Google had a universal allow option, to allow any website to access its search then an outsider can also access these internal features from the browser of an internal employee.

  * The earlier two scenarios showed how this can be used to attack the server, while this one is about the attack on the user. Let’s say the attackers have identified a SQL Injection vulnerability on your ‘productsearch.php’ page that is accessible universally. Instead of mining the database from their system, they might write a data miner in JavaScript and insert it on their website or on a website containing persistent XSS. When a victim visit’s that website containing this malicious JavaScript, his browser will perform SQL Injection attack against ‘productsearch.php’, mine all the data and send it back to the attackers. Inspection of the server logs would indicate that the victim was performing this attack, since HTTP headers apart from Referrer generally don’t get logged. The victim cannot claim his system was compromised because a forensic examination would not show any traces of malware or system compromise.

**Demo:**

A page that is accessible by COR from any domain - http://www.andlabs.org/html5/uCOR.php

## Site-level Cross Origin Access: ##

COR by design requires access-control on every page. Only if a page is explicitly allowed it be accessible from a foreign site.  This has its disadvantages as well. If a website allows 10 pages to be accessible by COR then every time there is a change in the list of 'Allowed Origins', the developers have to make changes to all 10 pages.
Instead developers might create a single page which would contain the code associated with COR handling like:

**cor.php**
```

  <?php
    if($_SERVER['HTTP_ORIGIN'] == "http://www.andlabs.org”)
    {
      header('Access-Control-Allow-Origin: http://www.andlabs.org');
    }
  ?>
```

Then they might just call this in all the 10 pages with the include function:  include(cor.php)

In multi-developer environments it is possible that cor.php might get included in more or all the pages of the website resulting in site-level cross origin access.

Instead it would be safer to have a table in the database, which contains the name of each page and the list of Origins that can access that page. And a file like cor.php can lookup the name of the calling page in this table and a suitable 'Access-Control-Allow-Origin' header. If the table does not contain an entry for the calling page then this header is not returned. This would enable easier access control while reducing possibilities of mistakes.


## Access-control decision based on Origin header: ##

There is a certain amount of trust placed on the Origin’ header. If the basis of this trust is not fully understood then it is possible to make mistakes. The Origin’ header only indicates that the request is from a particular domain, it does not guarantee this fact. The request could actually be from a Perl script which spoofs the Origin header.

Consider this insecure example:

```
  <?php
    if($_SERVER['HTTP_ORIGIN'] == "http://intranet.andlabs.org”)
    {
      header('Access-Control-Allow-Origin: http://intranet.andlabs.org');
      //perform some important action
      print >>> sensitive internal information <<< ;
    }
    else
    {
      print >>> normal page <<< ;
    }
  ?>
```

This is nothing but an unintentional backdoor in the application. The application performs some important actions and reveals sensitive information based on the trust in the Origin header. An attacker could craft an HTTP request with the required Origin header value and get access to sensitive information.

Unauthenticated COR should never be trusted. If some important functionality should be exposed or sensitive information should be returned, the request should have the 'Credentials Flag' set and supply the cookie containing the user’s valid session ID. Only after verifying the cookie value should the COR be processed.

**Demo:**

An insecure page that does Access Control only based on the Origin header - http://www.andlabs.org/html5/acCOR.php

## Prolonged caching of Preflight Result: ##

When a COR is not a simple request then a preflight request is made first and the response is analyzed before sending the actual request. The Preflight Result contains the list of allowed methods, headers and the value of the ‘Access-Control-Allow-Credentials’ header.

Performing a preflight request everytime a non-simple request has to be made can be a performance overhead so it is possible to cache the preflight response by setting a cache time span in the ‘Access-Control-Max-Age’ header.

This should ideally be for a short duration like 30 minutes. Caching the preflight response for longer duration can pose a security risk. Because even if the COR access-control policy is changed on the server the browser would still follow the old policy available in the Preflight Result Cache.

## Misplaced-trust: ##

Two parties are involved in a COR - the requesting site and the serving site.
There is a amount of trust between both these parties. The requesting site expects the serving site to provide valid and authentic response and trusts the response from the server.
The serving site on the other hand expects the requesting site to be authorized to access its data and responds to it with information.

Even though both the involved parties might be legitimate and might even be from the same provider, still the trust placed on the other party should be minimal. This is because even though the other party is legitimate, it could have been compromised by an attacker and now the attacker can exploit your site by riding on the trust placed on the compromised website.

For example let’s take a fictional situation with FriendFeed and Twitter where FriendFeed makes COR to twitter to read tweets, submit tweets and perform other actions on behalf of a user. And Twitter permits COR from FriendFeed and processes them and responds. They both trust each other so FriendFeed does not validate the data from Twitter and Twitter exposes almost all its functionality to FriendFeed via COR.

Now let’s consider two scenarios-

**Scenario 1 – Twitter is compromised:**

Since FriendFeed knows that Twitter always sends data that is HTML encoded it publishes this data on its site without encoding or validating. Now since Twitter is compromised the attacker can send malicious feed containing raw HTML and JavaScript and can compromise the users of FriendFeed as well.

**Scenario 2 – FriendFeed is compromised:**

Twitter has exposed a lot of functionality through COR from FriendFeed, this includes sending Tweets, changing the Twitter username, deleting the account etc. Now since FriendFeed is compromised the attackers can send COR to Twitter and perform malicious actions on the user’s behalf like deleting their accounts.

It is very important for the requesting party to validate the data received and for the serving party to expose the absolute minimum possible features. A compromise of one site should not automatically result in the compromise of the other.

## Processing rogue COR: ##

Simple COR can be made even if the server does not permit COR for that page. It’s only in case of special requests that preflight requests are made.  A page that is not exposed to CORs can still receive rouge CORs. Similarly a page that only permits CORs from http://trusted.site can receive rogue CORs from lots of different Origins. These rogue CORs can sometimes be used to perform application level DDOS attacks and should not be processed by the application.

For example consider a search page, ‘documentsearch.php’. When searching for ‘%’ the server might return all its records and this can be a computationally heavy request. To bring down this site, attackers can make use of public forums which contain persistent XSS vulnerabilities to inject JavaScript in to the victim’s browser to repeatedly perform this search request to the server. Even though the same can be done without COR by adding a new img element to the site with target URL containing the search parameter, the performance benefits of COR over this approach are significant.  If possible the attacker could even create a WebWorker to perform this attack.

This might not be isolated to GET requests, a feedback/contact form submitted over POST requests  might also be open for abuse. For example, if $_REQUEST is used instead of $_POST to get the form parameters then these forms can be submitted over GET requests.

Therefore parts of the site that are accessible to external users and which can be subject to abuse should be protected specifically against such attacks.

If the page is not meant to be accessed from other domains then check for the presence of Origin header in each request and if present then reject the request. This can also be done at the WAF.

**Eg:**
```
  <?php
    If( isset($_SERVER['HTTP_ORIGIN']))
    {
      exit;
    }
    else
    {
       //process request;
    }
  ?>
```

If the page is meant to process CORs from certain Origins then first validate the value of the Origin header and only if it matches should the request be processed.

**Eg:**
```
  <?php
    If($_SERVER['HTTP_ORIGIN'] == 'http://trusted.site')
    {
      header('Access-Control-Allow-Origin: http://trusted.site');
      //process request
    }
    else
    {
       exit;
    }
  ?>
```

If you only rely on the 'Access-Control-Allow-Origin' for protection then the page would be open for abuse. Because the server would process the request irrespective of the Origin, its only the response which would not be accessible by the client.

**Insecure Eg:**
```
  <?php
    header('Access-Control-Allow-Origin: http://trusted.site');
    //process request
  ?>
```

**Demos:**
  * An insecure example processing a rougue COR - http://www.andlabs.org/html5/processCOR.php
  * Secure example which rejects rogue COR - http://www.andlabs.org/html5/rejectCOR.php

# References: #

  * W3C Specification for Cross Origin Request - http://www.w3.org/TR/cors/
  * HTTP access control - https://developer.mozilla.org/en/http_access_control
  * Server-Side Access Control - https://developer.mozilla.org/En/Server-Side_Access_Control
  * Arun Ranganathan's COR demos - http://arunranga.com/examples/access-control/
  * HTML5 Security Quick Reference Guide with Demos - http://www.andlabs.org/html5.html
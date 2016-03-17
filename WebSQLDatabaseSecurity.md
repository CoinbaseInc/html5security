#Guide to Secure Implementation of HTML5's Web SQL Database

# Introduction #

HTML5 implements a client-side database that can be used to store and access data using JavaScript. This is not the first implementation of such a feature, that credit would probably go to Google Gears. However HTML5’s implementation is no doubt going to be the most popular and widely used.

This is a new feature for most web developers and there are a lot of questions over its security implication. Some of the concerns are if implementing this feature would open up new attacks vectors, if it is safe to store sensitive data in the client-side and how this can be implemented in the most secure way.

This article would try to answer the following questions:
  * What should and should not be stored on client-side?
  * How to securely store sensitive data?
  * When to store data and when not to store data?
  * How to prevent stored XSS vulnerabilities?
  * How to prevent client-side SQL Injections?
  * Can we trust data stored in the client-side database?

Following these suggestions would allow you to provide the benefits of this feature to your users without exposing them to additional risk.


## What should and should not be stored on client-side? ##
Data that is not sensitive and can be accessible even to unauthenticated users makes an ideal candidate for offline storage.

**Example:**

A movie ticket booking website can store details about all the different shows and their timings when the user visits its homepage. Subsequently as the user is checking the shows of different movies over different dates, the data is fetched locally and the server does not have to run SQL queries every time, saving lot of server processing.

Nothing sensitive is stored here - ideal scenario.

However, there are instances when the need and temptation to store user specific data is too high. MySpace and Gmail stored the entire mailbox of the user in the Google Gears database. There was a finance management website that even stored the user’s credit card information client-side.

One golden rule that could be followed is, ‘Any piece of information that would not be stored in clear-text on the server-side should never be stored on the client-side in any form’.
Examples of these are passwords, credit card pin numbers etc.

If other sensitive information like the user’s mailbox, preferences, activity history etc are to be stored client-side then read the next section to understand how it can be done securely.


## How to securely store sensitive data? ##
### **1) Use SSL:** ###
If sensitive data is to be stored then only store it over HTTPS. Since the database is subject to Same Origin constraints, the database created over HTTPS cannot be accessed over HTTP. This would prevent trivial loss of data to DNS spoofing attacks.

A website like FaceBook is sending all session information over HTTP so is there any merit for them in storing data over HTTPS? Yes!!

Users would generally use sites like FaceBook only when they feel they are over a secure network, like home or office. They might chose not to login in to their FaceBook account when connected to an open Wi-Fi in airport.

However, FaceBook data stored over HTTP can be stolen without the user’s knowledge when she connects to an untrusted network even for just casual browsing without logging in to any website.

Tools like [Imposter](http://www.andlabs.org/tools.html#imposter) can help automate such attacks.

### **2) Unique Database Name:** ###
The database name is the primary piece of information required to read and write to client-side databases. This should differ from user to user and should ideally be long and difficult to guess. The database name can be created using a random string generator and stored on the server-side and when the user logs in, the site can fetch the database name and add it to the client-side script to read and write to the database. However any rouge client-side script cannot access it through a Cross-site Scripting or DNS Spoofing attack because the attacker would not know the Database name.

If a Cross-site Scripting attack is performed on an victim who is authenticated to the website then the database name can be obtained from the client-side scripts and rouge script can access the database. However in this case the attacker has control of a valid session and can directly steal data from the server, so there is no additional risk due to Web SQL Database.

Though using a completely random database name would be ideal, it would severely affect offline access. Storing the database name in the Offline Application Cache is bad idea as this can be read by rogue scripts.

In such cases the user could be asked to pick an 'offline password', which added with her username would make up the database name. This value can be stored on the server-side. And for offline access the user would have to enter both the username and the 'offline password' to access the offline mode of the application.

**NOTE:** Offline password should be different than the usual login password.

If nothing else then at the very least use the username as the database name. This is what Google did in their Google Gears implementation for Offline Gmail. Though this does not completely prevent data theft, it makes it harder.

A demo of client-side database created using the username as database name is available at http://www.andlabs.org/html5/csSQLdbname.html


## When to store data and when not to store data? ##
This question is trickier than it appears.
Data should be stored only when it has been explicitly permitted by the user and it should only be stored in the system from which the user enabled this option.

Before creating a client-side database the application should show a message about what it intends to do and then ask the user to opt-in or opt-out of storing sensitive data on the client-side.
When accessing the Web Database API the browser prompts the user for permission, this should not be considered as the user permitting the application since the prompt from the browser is generic and non-informative. The user would not be able to make an informed decision based on the browser's prompt.

Only after the user permits the application to store data locally should the application create a database with a unique name as mentioned in the earlier section.

After enabling this feature, if the user accesses the application from a different system then the application should detect this and not proceed to create a local database on this new system.
Since the permission given by the user was for storing data on the earlier system alone, the application should not create a local database on the new system without the explicit permission of the user.

This is important because the user could be accessing the application from shared computers and if the application proceeds to create the local database again on these computers then the user risks leaking his data.

The application should also have a reliable method to identify the instances when the user is accessing the application from a different system. Using only the presence of the database as an indication is a bad idea as it can be spoofed by an attacker.
For example lets say an application uses the username as the database name. And A is a user of this application and he permits the application to store data locally on his home computer. An evil co-worker B who is looking to steal A's data can create a database with the username of A in the office computer. When A logs in to the application from his office computer, the application would check for a database with A's username and since B has already created one, the application would presume that it is A's home computer and proceed to store data in the office computer which can later be accessed by B.

One method could be that the application can create a generic table separate from the table containing the user information and can store the salted-hash of the last used Session ID. This same value would be stored on the server-side as well. When the user logs in, this value form the client-side database can be verified against the server-side value to determine if the user had permitted client-side databases for that system.

If the application finds more than one such unique value in this database then it indicates that the system is a shared system and it can suitably warm the user against storing data client-side on that system.

## How to prevent stored XSS vulnerabilities? ##
Since data stored in client-side database would be queried and printed to the browser, stored XSS is a real threat. Data from the client-side database is untrusted data and proper output encoding should be performed on it.

Output encoding should be performed on the data after it is fetched from the database. Performing the encoding before storing in to the database is not enough. Because the attacker can sometime directly write to the database by exploiting reflected XSS and DNS spoofing attacks.

MySpace has a [Stored XSS vulnerability](http://www.andlabs.org/whitepapers/GoogleGears_for_Attackers.pdf) in their Gears database implementation because they only performed encoding before storing data in the database. It was not performed on the data fetched from the database.

**Demos:**
  * Simple stored XSS - http://www.andlabs.org/html5/csXSS1.html
  * Stored XSS because encoding performed before storing and not when displaying - http://www.andlabs.org/html5/csXSS2.html.
  * Secure implementation with no XSS - http://www.andlabs.org/html5/csXSS_secure.html

## How to prevent client-side SQL Injections? ##

This is the simplest issue to avoid. Always use prepared statements for all database interaction, never use string concatenation in the SQL query.

Using the HMTL5 Database API it is easier to create SQL queries using Prepared Statements and difficult to create queries using Concatenation.

However a developer unaware of the risk might take the harder route and introduce a SQL Injection vulnerability. So it is very important to understand the risks of Client-side SQL Injection.

**Demo**

A live demo to show the impact of this is available at http://www.andlabs.org/html5/csSQLi.html

## Can we trust data stored in the client-side database? ##
No. Inspite of the best counter-measures, data stored on the client-side is always subject to tampering either by the user or by an attacker. Don’t place trust on it and take decisions based on that data. It would lead to logical flaws.  This feature is primarily meant to enable offline browsing. Don’t get carried away by all the possibilities and invent new vulnerabilities.


# References #

  * W3C Specification - http://dev.w3.org/html5/webdatabase/
  * Google Gears for Attackers - http://www.andlabs.org/whitepapers/GoogleGears_for_Attackers.pdf
  * Remy Sharp's HTML5 Web Database Demo - http://html5demos.com/database
  * Imposter - the Browser Phishing Tool - http://www.andlabs.org/tools.html#imposter
  * HTML5 Security Quick Reference Guide with Demos - http://www.andlabs.org/html5.html
var fs = require('fs'); // This is the node fs module, it has different methods than the Phantom FS module in genBitmaps.js, despite having the same / name purpose
var Crawler = require('simplecrawler'); // Documentation for this crawler: https://www.npmjs.com/package/simplecrawler
var urlsArray = ["URLS:"];
var errorsArray = ["ERRORS:"];

// Removes 'bitmaps_test' so the urls txt file is placed in backstop_data instead
function removeTest(testPath) {
    var t = testPath.split('/');
    t.pop();
    var testDirRemoved = t.join('/');
    return testDirRemoved;
}

function addToArray(newItem) {
    urlsArray.push(newItem)
}

function writeArrayToFile(wFile, wArray) {
    fs.writeFile(wFile, wArray.join('\n'));
}

function appendArrayToFile(apFile, apArray) {
    fs.appendFile(apFile, apArray.join('\n'))
}

// The crawler is very particular about the url format. It wants no leading prefixes like http:// and it can't deal with trailing slashes. This function filters the url to its needs.
function filterUrl(theUrl) {
    var wwwRe = new RegExp("www.");
    var httpRe = new RegExp("^https?://");
    var withoutWs = theUrl.replace(wwwRe, '');
    var withoutHttp = withoutWs.replace(httpRe, '');
    // Removes trailing slashes
    if (withoutHttp.slice(-1) === "/") {
        withoutHttp = withoutHttp.substring(0, withoutHttp.length - 1);
    }
    return withoutHttp
}

fs.readFile('capture/config.json', function(err, data) {
    if (err || !data) {
        console.log("File read failed at line 6 of crawl.js, apologies");
        console.log("The error was: " + err);
        console.log("If there was no error, than no data was found in capture/config.json");
    } else {
        var config = JSON.parse(data);
        var backstop_data = removeTest(config.paths.bitmaps_test);
        var writeFileName = backstop_data + "/site_urls.txt";
        var filteredUrl = filterUrl(config.rootUrl);
        console.log(filteredUrl)
        var myCrawler = new Crawler(filteredUrl);

        var conditionID = myCrawler.addFetchCondition(function(parsedURL) {
            // The crawler will ignore any file types in this block. 
            if (parsedURL.path.match(/\.(css|jpg|pdf|docx|js|png|zip|ico|svg|gif)/i)) {
                return false;
            }
            return true;
        });

        myCrawler.on('crawlstart', function() {
            console.log('Crawl starting');
        })

        myCrawler.on("fetchcomplete", function(queueItem) {
            console.log(queueItem.url)
            addToArray(queueItem.url);
        });

        myCrawler.on("fetcherror", function(error) {
            console.log("Error received: " + error);
            for (var key in error) {
                var t = key + " : " + error[key];
                errorsArray.push(t);
            }
        });

        myCrawler.on("complete", function() {
            console.log("Crawl complete, see " + writeFileName + " for the results");
            writeArrayToFile(writeFileName, urlsArray);
            if (errorsArray.length > 1) {
                fs.appendFile(writeFileName, '\n\n');
                appendArrayToFile(writeFileName, errorsArray);
            }
        });

        myCrawler.start();

    }
});
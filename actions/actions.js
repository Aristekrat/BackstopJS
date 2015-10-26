"use strict";

var require = patchRequire(require);
var actionsUtil = require('./actionsUtil.js');

// This is properly a UTIL function, but it's difficult to put there since it calls captureSelector. 
function createErrorScreenshot(directory) {
    var errorDir = actionsUtil.determineErrorDirectory(directory);
    if (errorDir) {
        errorDir = errorDir + "/"
        console.log("Additionally, if you want to see what the page looked like on timeout, you can check the timeout_error.png screenshot in the static_errors folder");
        captureSelector('body', errorDir, "timeout_error");
    }
}

/* Actions API */

// A click function that is designed to move to a new url. 
function clickNext(clickTarget, workingDirectory) {
    console.log("Reaching click next");
    var url = casper.getCurrentUrl();
    casper.thenClick(clickTarget).waitFor(function() {
            return casper.getCurrentUrl() !== url;
        }, function() {
            console.log("Click next complete");
        },
        function() {
            console.log("The Click Next function timed out, please check your selector: " + clickTarget);
            createErrorScreenshot(workingDirectory);
        }, 20000);
}

// General purpose click function, receives a css selector, designed for a click that stays on page.
function click(clickTarget, workingDirectory) {
    casper.waitForSelector(clickTarget, function() {
        casper.thenClick(clickTarget, function() {
            console.log("click ran");
        });
    }, function() {
        console.log("The click function timed out, please check your selector: " + clickTarget);
        createErrorScreenshot(workingDirectory);
    }, 20000);
}

// The capture function is designed to take a screenshot of a chunk of the page, with the top of the page and a screen size of a large desktop as the default
function capture(imgName, saveDir, t, l, w, h) {
    var top = window.screenY;
    var left = window.screenX;
    var width = w ? w : 1920;
    var height = h ? h : 1080;
    var saveImg = saveDir + imgName;
    casper.capture(saveImg, {
        top: top,
        left: left,
        width: width,
        height: height
    });
}

/*
function waitThenCapture(waitTime, imgName, saveDir, t, l, w, h) {
    casper.wait(waitTime, capture(imgName, saveDir, t, l, w, h))
}*/

function captureSelector(selector, saveDir, fileName) {
    var fullImgPath = saveDir + fileName
    casper.wait(1000);
    casper.captureSelector(fullImgPath, selector)
    console.log("capture complete, see: " + fullImgPath);
}

// For capturing DOM elements that appear after a user event or asynchronously. Waits for the DOM element and then captures the whole page.
function waitToCapture(waitSelector, saveDir, fileName) {
    casper.waitUntilVisible(waitSelector, function() {
        captureSelector(waitSelector, saveDir, fileName);
    }, function() {
        console.log("Wait to capture timed out, please check your selector to make sure it's valid: " + waitSelector);
        createErrorScreenshot(saveDir);
    }, 20000);
}

// Fill form has troubles with select boxes, thus, this function was need to fill the gap
function setSelectDropdown(selectTarget, newValue) {
    casper.thenEvaluate(function(selectT, selectV) {
        jQuery(selectT).val(selectV).change();
    }, selectTarget, newValue);
}

// This function takes a CSS selector string as its first arg. The second arg is data to enter into the form, which is formatted { selector : value, ... }
function fillForm(formSelector, inputJSON, workingDirectory) {
    casper.waitForSelector(formSelector, function() {
        console.log("Form selector found");
        casper.fillSelectors(formSelector, inputJSON, true);
    }, function() {
        console.log("The Fill Form function failed. This is probably because it received a selector it didn't understand");
        console.log("If you saw the message 'Form Selector Found' then your form selector is valid and you should check your input selectors");
        console.log("If not, casper couldn't find your form selector");
        createErrorScreenshot(workingDirectory);
    }, 20000)
}

function navigateToURL(url) {
    casper.thenOpen(url);
}

function evaluate(func) {
    casper.thenEvaluate(func);
}

function wait(waitTime) {
    var wt = Number(waitTime)
    casper.wait(wt)
}

// A small helper function, only used in execute below
function notify(subject) {
    console.log("Next action: " + subject);
}

// This function goes through the backstop.json actions array and executes all the API functions it receives
function execute(nextAction, directory, fileName) {
    casper.then(function() {
        for (var key in nextAction) {
            switch (key) {
                case "clickNext":
                    notify(key);
                    clickNext(nextAction[key], directory);
                    break;
                case "click":
                    notify(key);
                    click(nextAction[key], directory);
                    break;
                case "form":
                    notify(key);
                    var formSelector = nextAction[key];
                    delete nextAction[key];
                    fillForm(formSelector, nextAction, directory)
                    break;
                case "select":
                    notify(key);
                    var z = nextAction[key]
                    setSelectDropdown(z, nextAction[z]);
                    break;
                case "capture":
                    notify(key);
                    capture(fileName, directory);
                    break;
                case "captureSelector":
                    notify(key);
                    captureSelector(nextAction[key], directory, fileName);
                    break;
                case "waitToCapture":
                    notify(key);
                    waitToCapture(nextAction[key], directory, fileName);
                    break;
                case "evaluate":
                    notify(key);
                    evaluate(nextAction[key]);
                    break;
                case "navigate":
                    notify(key);
                    navigateToURL(nextAction[key]);
                    break;
                case "wait":
                    notify(key);
                    wait(nextAction[key]);
                    break;
                default:
                    continue;
            }
        }
    })
}

exports.execute = execute;
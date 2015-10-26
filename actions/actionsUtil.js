"use strict"

var randEmailPrefix = ["test", "testgenerated", "backstopgenerated", "testing", "dummy", "tester", "generated", "backstop", "automatedtest", "biff4eva"];
var randEmailSuffix = ["@email.com", "@test.com", "@generic.com", "@dummyaddress.com", "@testemail.com", "@fakeemail.com", "@testingemail.com", "@testime.com", "@testtime.com", "@dummyemail.com"];

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

exports.generateRandomEmail = function() {
    var a = Math.round(getRandomArbitrary(0, 9));
    var b = Math.round(getRandomArbitrary(-0, 9));
    var c = Math.round(getRandomArbitrary(0, 100000));
    return randEmailPrefix[a] + c + randEmailSuffix[b];
}

exports.determineErrorDirectory = function(workingDirectory) {
    var components = workingDirectory.split('/');
    components.pop();
    if (components[components.length - 1] === "bitmaps_reference") {
        components.pop();
        return components.join('/') + "/static/error_screenshots";
    } else if (components[components.length - 2] === "bitmaps_test") {
        components.splice(components.length - 2, 2, 'static', 'error_screenshots');
        return components.join('/');
    } else {
        console.log("Error, unable to determine error screenshot directory");
        return false;
    }
}
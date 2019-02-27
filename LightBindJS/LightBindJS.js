// Cache DOM input/bound elements
let inputElements = [];
let boundElements = [];
// Initialize scope variable
let scope = {};

var init = function () {
    rewriteContent();

    inputElements = document.querySelectorAll('[lb-model]');
    boundElements = document.querySelectorAll('[lb-bind]');
    // Loop through input elements
    for (let el of inputElements) {
        //If text input
        if (el.type === 'text') {
            // Get property name from each input with an attribute of 'lb-model'
            let propName = el.getAttribute('lb-model');
            //Must match {{value.value2}} format
            var regex = /{{.*}}$/g;
            if (propName.match(regex)) {
                // Update bound scope property on input change
                el.addEventListener('keyup',
                    e => {
                        scope[propName] = el.value;
                    });

                // Set property update logic
                setPropUpdateLogic(propName);
            }
        }
        //else if (el.type === 'radio') {

        //}
        //etc etc
    }
};

var setPropUpdateLogic = function(prop) {
    if (!scope.hasOwnProperty(prop)) {
        let value;
        Object.defineProperty(scope,
            prop,
            {
                // Automatically update bound dom elements when a scope property is set to a new value
                set: (newValue) => {
                    value = newValue;

                    // Set input elements to new value
                    for (let el of inputElements) {
                        if (el.getAttribute('lb-model') === prop) {
                            if (el.type) {
                                el.value = newValue;
                            }
                        }
                    }

                    // Set all other bound dom elements to new value
                    for (let el of boundElements) {
                        if (el.getAttribute('lb-bind') === prop) {
                            if (!el.type) {
                                el.innerHTML = newValue;
                            }
                        }
                    }
                },
                get: () => {
                    return value;
                },
                enumerable: true
            });
    }
};

var rewriteContent = function () {
    var html = document.body.innerHTML;
    var newHtml = html;
    // replace all '{{myVar}}' into '<span lb-bind="{{myVar}}"></span>'
    var searchValue = /<div>{{.*}}<\/div>/g;
    var results = html.match(searchValue);
    for (let match of results) {
        var innerSearchValue = /{{(.*?)}}/g;
        var innerValue = match.match(innerSearchValue, match);
        var replaceSearchValue = new RegExp("<div>" + innerValue + "<\/div>", "g");
        newHtml = newHtml.replace(replaceSearchValue, '<span lb-bind="'+innerValue+'"></span>');
    }
    // re-write html only if necessary
    if (newHtml !== html) {
        document.body.innerHTML = newHtml;
    }
};

document.addEventListener("DOMContentLoaded", function (event) {
    init();
});


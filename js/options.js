/**
 * Created by Krzysiek on 06/06/2017.
 */

loadAnalytics(DEBUG_MODE);

$(function() {
    ga('send', 'pageview');

    localizeHtmlPage();
    localizeHintData();
    registerListeners();
    refreshForm();
});

/**
 * Refreshes the form with fresh values
 * @see loadSettings()
 */
function refreshForm() {
    loadSettings(function(settings) {
        loadForm(settings);
    });
}

/**
 * Looks for every <code>.tooltipped</code> element, and replaces the <code>data-tooltip</code> with it's localized version
 */
function localizeHintData() {
    $(".tooltipped").each(function() {
        const tag = $(this).attr("data-tooltip");
        const msg = tag.replace(/__MSG_(\w+)__/g, function(match, v1) {
            return v1 ? chrome.i18n.getMessage(v1) : '';
        });
        $(this).attr("data-tooltip", msg);
    })
}

/**
 * Register onChange listeners to the form and onClick listeners to the buttons
 */
function registerListeners() {
    $("#btn-save").click(function() {
        saveForm(true);
        ga('send', {
            hitType: 'event',
            eventCategory: 'Buttons',
            eventAction: 'saveForm',
            eventLabel: 'Save button click'
        });
    });

    $("input").change(function(e) {
        saveForm();
        const target = $(e.target);
        let eventValue = target.val();
        if(isNaN(parseFloat(eventValue))) {
            eventValue = target[0].checked ? 1 : 0;
        } else {
            eventValue = parseFloat(eventValue);
        }
        ga('send', {
            hitType: 'event',
            eventCategory: 'Inputs',
            eventAction: 'changeValue',
            eventLabel: target.attr("id"),
            eventValue: eventValue < 1 ? Math.round(eventValue * 100) : eventValue
        });
    });

    $("#btn-reset").click(function() {
        clearSettings(function() {
            refreshForm();
        });
        ga('send', {
            hitType: 'event',
            eventCategory: 'Buttons',
            eventAction: 'resetForm',
            eventLabel: 'Reset button click'
        });
    });
    let target;
    let t0;
    $(".tooltipped").hover(function(e) {
        target = e.target;
        t0 = new Date().getTime();
    }, function(e) {
        if(e.target === target) {
            let t1 = new Date().getTime();
            let dt = t1 - t0;
            if(dt >= 225) {
                ga('send', {
                    hitType: 'event',
                    eventCategory: 'Hints',
                    eventAction: 'viewHint',
                    eventLabel: $(e.target).attr("id"),
                    eventValue: dt
                });
            }
        }
    });
}

//This has been replaced with standard HTML (min, max, step) attributes for input with type number
/*function onArrowPress(event)
 {
 let change = event.which == 38 ? 0.05 : event.which === 40 ? - 0.05 : 0;
 const focused = $("#input-plus-weight:focus,#input-minus-weight:focus");
 if(focused.length === 1 && change !== 0)
 {
 //e.preventDefault();

 let val = parseFloat(focused.val().replace(/[^\d.-]/g, ""));
 val = Math.round((val+change) * 100) / 100;

 if(val > 1)
 val = 1;
 if(val < 0)
 val = 0;

 focused.val(val);
 saveForm();
 }
 }*/

/**
 * Loads provided settings into the form
 * @param {object} [settings = DEFAULT_SETTINGS] settings to load into the form
 * @see DEFAULT_SETTINGS
 */
function loadForm(settings = DEFAULT_SETTINGS) {
    const defaultWeight = $("#input-default-weight");
    const plusWeight = $("#input-plus-weight");
    const minusWeight = $("#input-minus-weight");
    const policy = $("#checkbox-policy");
    const weights = $("#checkbox-weights");
    const hide = $("#checkbox-hide");

    defaultWeight.val(settings.defaultWeight);
    plusWeight.val(settings.plusWeight);
    minusWeight.val(settings.minusWeight);
    policy.prop("checked", settings.respectPolicy);
    weights.prop("checked", settings.useWeights);
    hide.prop("checked", settings.hideEmpty);

    Materialize.updateTextFields();
}

/**
 * Validates and saves the form and shows a {@link Materialize.toast toast}
 * @param {boolean} [notify = false] will show a {@link Materialize.toast toast} if <code>true</code>
 */
function saveForm(notify = false) {
    const settings = {};

    let defaultWeight = $("#input-default-weight").val().replace(/[^\d.-]/g, "");
    let plusWeight = $("#input-plus-weight").val().replace(/[^\d.-]/g, "");
    let minusWeight = $("#input-minus-weight").val().replace(/[^\d.-]/g, "");
    let policy = $("#checkbox-policy")[0].checked;
    let weights = $("#checkbox-weights")[0].checked;
    let hide = $("#checkbox-hide")[0].checked;

    defaultWeight = parseInt(defaultWeight);
    plusWeight = parseFloat(plusWeight);
    minusWeight = parseFloat(minusWeight);

    if(defaultWeight < 0)
        defaultWeight = 0;
    else if(defaultWeight > 10)
        defaultWeight = 10;


    if(plusWeight > 1)
        plusWeight = 1;
    else if(plusWeight < 0)
        plusWeight = 0;

    if(minusWeight > 1)
        minusWeight = 1;
    else if(minusWeight < 0)
        minusWeight = 0;

    settings.defaultWeight = defaultWeight;
    settings.plusWeight = plusWeight;
    settings.minusWeight = minusWeight;
    settings.respectPolicy = policy;
    settings.useWeights = weights;
    settings.hideEmpty = hide;

    saveSettings(settings, function() {
        refreshForm();
        if(notify === true) {
            const message = chrome.i18n.getMessage("options_saved_successfully");
            Materialize.toast(message, 800);
        }
    });
}

//Credit: https://stackoverflow.com/a/39810769/4061413
function replace_i18n(obj, tag) {
    const msg = tag.replace(/__MSG_(\w+)__/g, function(match, v1) {
        return v1 ? chrome.i18n.getMessage(v1) : '';
    });

    if(msg !== tag)
        obj.innerHTML = msg;
}

function localizeHtmlPage() {
    // Localize using __MSG_***__ data tags
    const data = document.querySelectorAll('[data-localize]');

    for(let i in data) if(data.hasOwnProperty(i)) {
        let obj = data[i];
        let tag = obj.getAttribute('data-localize').toString();

        replace_i18n(obj, tag);
    }

    // Localize everything else by replacing all __MSG_***__ tags
    const page = document.getElementsByTagName('html');

    for(let j = 0; j < page.length; j++) {
        const obj = page[j];
        const tag = obj.innerHTML.toString();

        replace_i18n(obj, tag);
    }
}
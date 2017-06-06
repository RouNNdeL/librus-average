/**
 * Created by Krzysiek on 06/06/2017.
 */


$(function()
{
    localizeHtmlPage();
    localizeHintData();
    registerListeners();
    refreshForm();
});

/**
 * Refreshes the form with fresh values
 * @see loadSettings()
 */
function refreshForm()
{
    loadSettings(function(settings)
    {
        loadForm(settings);
    });
}

/**
 * Looks for every <code>.tooltipped</code> element, and replaces the <code>data-tooltip</code> with it's localized version
 */
function localizeHintData()
{
    $(".tooltipped").each(function()
    {
        const tag = $(this).attr("data-tooltip");
        const msg = tag.replace(/__MSG_(\w+)__/g, function(match, v1)
        {
            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            return v1 ? chrome.i18n.getMessage(v1) : '';
        });
        $(this).attr("data-tooltip", msg);
    })
}

/**
 * Register onChange listeners to the form and onClick listeners to the buttons
 */
function registerListeners()
{
    $("#btn-save").click(function()
    {
        saveForm(true)
    });
    //noinspection JSUnresolvedFunction
    $("input").change(saveForm);
    $("#btn-reset").click(function()
    {
        clearSettings(function()
        {
            refreshForm();
        })
    });
}

/**
 * Loads provided settings into the form
 * @param {object} [settings = DEFAULT_SETTINGS] settings to load into the form
 * @see DEFAULT_SETTINGS
 */
function loadForm(settings = DEFAULT_SETTINGS)
{
    const defaultWeight = $("#input-default-weight");
    const plusWeight = $("#input-plus-weight");
    const minusWeight = $("#input-minus-weight");
    const policy = $("#checkbox-policy");

    defaultWeight.val(settings.defaultWeight);
    plusWeight.val(settings.plusWeight);
    minusWeight.val(settings.minusWeight);
    policy.prop("checked", settings.respectPolicy);

    Materialize.updateTextFields();
}

/**
 * Validates and saves the form and shows a {@link Materialize.toast toast}
 * @param {boolean} [notify = false] will show a {@link Materialize.toast toast} if <code>true</code>
 */
function saveForm(notify = false)
{
    const settings = {};

    let defaultWeight = $("#input-default-weight").val().replace(/[^\d]/g, "");
    let plusWeight = $("#input-plus-weight").val().replace(/[^\d\.-]/g, "");
    let minusWeight = $("#input-minus-weight").val().replace(/[^\d\.-]/g, "");
    let policy = $("#checkbox-policy")[0].checked;

    console.log(policy);

    defaultWeight = parseInt(defaultWeight);
    plusWeight = parseFloat(plusWeight);
    minusWeight = parseFloat(minusWeight);

    if(defaultWeight < 0)
        defaultWeight = 0;

    if(plusWeight > 1)
        plusWeight = 1;
    if(plusWeight < 0)
        plusWeight = 0;

    if(minusWeight > 1)
        minusWeight = 1;
    if(minusWeight < 0)
        minusWeight = 0;

    settings.defaultWeight = defaultWeight;
    settings.plusWeight = plusWeight;
    settings.minusWeight = minusWeight;
    settings.respectPolicy = policy;

    saveSettings(settings, function()
    {
        refreshForm();
        if(notify === true)
        {
            //noinspection JSUnresolvedFunction,JSUnresolvedVariable
            const message = chrome.i18n.getMessage("options_saved_successfully");
            Materialize.toast(message, 800);
        }
    });
}

//Credit: https://stackoverflow.com/a/39810769/4061413
function replace_i18n(obj, tag)
{
    const msg = tag.replace(/__MSG_(\w+)__/g, function(match, v1)
    {
        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
        return v1 ? chrome.i18n.getMessage(v1) : '';
    });

    if(msg != tag) obj.innerHTML = msg;
}

function localizeHtmlPage()
{
    // Localize using __MSG_***__ data tags
    const data = document.querySelectorAll('[data-localize]');

    for(let i in data) if(data.hasOwnProperty(i))
    {
        let obj = data[i];
        let tag = obj.getAttribute('data-localize').toString();

        replace_i18n(obj, tag);
    }

    // Localize everything else by replacing all __MSG_***__ tags
    const page = document.getElementsByTagName('html');

    for(let j = 0; j < page.length; j ++)
    {
        const obj = page[j];
        const tag = obj.innerHTML.toString();

        replace_i18n(obj, tag);
    }
}
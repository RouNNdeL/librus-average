/**
 * Created by Krzysiek on 06/06/2017.
 */

const MINUS_REGEX = /!minus_weight!/;
const PLUS_REGEX = /!plus_weight!/;

$(function(e)
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
    $(".tooltipped").each(function(i)
    {
        const tag = $(this).attr("data-tooltip");
        const msg = tag.replace(/__MSG_(\w+)__/g, function(match, v1)
        {
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
 * Saves the form and shows a {@link Materialize.toast toast}
 * @param {boolean} [notify = false] will show a {@link Materialize.toast toast} if <code>true</code>
 */
function saveForm(notify = false)
{
    const settings = {};

    const defaultWeight = $("#input-default-weight");
    const plusWeight = $("#input-plus-weight");
    const minusWeight = $("#input-minus-weight");
    const policy = $("#checkbox-policy");

    settings.defaultWeight = parseInt(defaultWeight.val());
    settings.plusWeight = parseFloat(plusWeight.val());
    settings.minusWeight = parseFloat(minusWeight.val());
    settings.respectPolicy = policy.val() === "on";

    saveSettings(settings, function()
    {
        if(notify === true)
        {
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
        obj = page[j];
        tag = obj.innerHTML.toString();

        replace_i18n(obj, tag);
    }
}
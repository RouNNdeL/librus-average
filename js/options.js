/**
 * Created by Krzysiek on 06/06/2017.
 */

const MINUS_REGEX = /!minus_weight!/;
const PLUS_REGEX = /!plus_weight!/;

$(function(e)
{
    localizeHtmlPage();
    loadSettings(function(settings)
    {
        loadForm(settings);
        registerOnChangeListener();
        loadHintData();
    });
});

function loadHintData()
{
    $(".tooltipped").each(function(i)
    {
        const tag = $(this).attr("data-tooltip")
        const msg = tag.replace(/__MSG_(\w+)__/g, function(match, v1)
        {
            return v1 ? chrome.i18n.getMessage(v1) : '';
        });
        $(this).attr("data-tooltip", msg);
    })
}

function registerOnChangeListener()
{
    $("#btn-save").click(function()
    {
        saveForm(true)
    });
    $("input").change(saveForm);
}

function loadForm(settings)
{
    const defaultWeight = $("#input-default-weight");
    const plusWeight = $("#input-plus-weight");
    const minusWeight = $("#input-minus-weight");
    const policy = $("#checkbox-policy");

    defaultWeight.val(settings.defaultWeight);
    plusWeight.val(settings.plusWeight);
    minusWeight.val(settings.minusWeight);
    policy.val(settings.respectPolicy);
}

function saveForm(notify = false)
{
    const settings = {};

    const defaultWeight = $("#input-default-weight");
    const plusWeight = $("#input-plus-weight");
    const minusWeight = $("#input-minus-weight");
    const policy = $("#checkbox-policy");

    settings.defaultWeight = defaultWeight.val();
    settings.plusWeight = plusWeight.val();
    settings.minusWeight = minusWeight.val();
    settings.respectPolicy = policy.val();

    saveSettings(settings, function()
    {
        if(notify === true)
        {
            const message = chrome.i18n.getMessage("options_saved_successfully");
            Materialize.toast(message, 1000);
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
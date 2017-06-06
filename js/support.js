const SETTINGS = "settings";

const REGEX_WEIGHT = /Waga: (\d+)/;
const REGEX_MARK = /(\d)([+-]?)/;
const REGEX_POLICY = /Licz do średniej:\s*(tak|nie)/;

const POLICY_POSITIVE = "tak";

const FIRST_TERM_INDEX = 2;
const FIRST_TERM_AVG = 3;
const SECOND_TERM_INDEX = 6;
const SECOND_TERM_AVG = 7;
const YEAR_AVG = 9;

//Default Settings
const PLUS_WEIGHT = 0.5;
const MINUS_WEIGHT = 0.25;
const DEFAULT_WEIGHT = 1;
const RESPECT_POLICY = true;

const DEFAULT_SETTINGS = {
    plusWeight: PLUS_WEIGHT,
    minusWeight: MINUS_WEIGHT,
    defaultWeight: DEFAULT_WEIGHT,
    respectPolicy: RESPECT_POLICY
};


function loadSettings(callback)
{
    chrome.storage.sync.get(SETTINGS, function(items)
    {
        let settings = items[SETTINGS];
        if(settings === undefined || settings === null)
        {
            settings = DEFAULT_SETTINGS;
            saveSettings(settings);
        }
        callback(settings);
    });
}

function saveSettings(settings, callback)
{
    if(typeof callback == "function")
        chrome.storage.sync.set({SETTINGS: settings}, callback);
    else
        chrome.storage.sync.set({SETTINGS: settings});
}
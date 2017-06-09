const SETTINGS = "settings";

const REGEX_WEIGHT = /Waga: (\d+)/;
const REGEX_MARK = /(\d)([+-]?)/;
const REGEX_POLICY = /Licz do średniej:\s*(tak|nie)/;

const REGEX_FIRST_TERM_MARKS = /Oceny bieżące/;
const REGEX_FIRST_TERM_AVERAGE = /ocen.*pierwszego okresu/i;
const REGEX_SECOND_TERM_MARKS = /Oceny bieżące/;
const REGEX_SECOND_TERM_AVERAGE = /ocen.*drugiego okresu/i;
const REGEX_YEAR_AVERAGE = /średnia roczna/i;

const POLICY_POSITIVE = "tak";

/**
 * Librus sometimes hides unnecessary columns, so we need to dynamically check what they are
 * @type {{firstTermMarks: number, firstTermAverage: number, secondTermMarks: number, secondTermAverage: number, yearAverage: number}}
 */
const DEFAULT_COLUMN_NUMBERS = {
    firstTermMarks: 2,
    firstTermAverage: 3,
    secondTermMarks: 6,
    secondTermAverage: 7,
    yearAverage: 9,
};

THEAD_COLUMN_OFFSET = 2; //The columns in the head row are offset by 2 compared to the subject rows

//Default Settings
const PLUS_WEIGHT = 0.5;
const MINUS_WEIGHT = 0.25;
const DEFAULT_WEIGHT = 1;
const RESPECT_POLICY = true;
const USE_WEIGHTS = true;

/**
 * This is an example of a settings object
 * @type {{plusWeight: number, minusWeight: number, defaultWeight: number, respectPolicy: boolean}}
 */
const DEFAULT_SETTINGS = {
    plusWeight: PLUS_WEIGHT,
    minusWeight: MINUS_WEIGHT,
    defaultWeight: DEFAULT_WEIGHT,
    respectPolicy: RESPECT_POLICY,
    useWeights: USE_WEIGHTS
};

/**
 * Loads settings from Chrome's sync storage, if no settings are found returns default settings and saves them
 * @param {function} callback function to receive the settings
 * @see DEFAULT_SETTINGS
 */
function loadSettings(callback)
{
    //noinspection JSUnresolvedVariable
    chrome.storage.sync.get(function(items)
    {
        let settings = items[SETTINGS];
        if(settings === undefined || settings === null)
        {
            settings = DEFAULT_SETTINGS;
            saveSettings(settings);
        }

        if(settings.defaultWeight === null || settings.defaultWeight === undefined || isNaN(settings.defaultWeight))
            settings.defaultWeight = DEFAULT_WEIGHT;

        if(settings.plusWeight === null || settings.plusWeight === undefined || isNaN(settings.plusWeight))
            settings.plusWeight = PLUS_WEIGHT;

        if(settings.minusWeight === null || settings.minusWeight === undefined || isNaN(settings.minusWeight))
            settings.minusWeight = MINUS_WEIGHT;

        if(settings.respectPolicy === null || settings.respectPolicy === undefined)
            settings.respectPolicy = RESPECT_POLICY;

        if(settings.useWeights === null || settings.useWeights === undefined)
            settings.useWeights = USE_WEIGHTS;

        callback(settings);
    });
}

/**
 * Saves provided settings to Chrome's sync storage
 * @param {object} settings to save
 * @param {function} [callback] passed to {@link chrome.storage.sync.set()}
 * @see DEFAULT_SETTINGS
 */
function saveSettings(settings, callback)
{
    if(typeof callback === "function")
    {
        const obj = {};
        obj[SETTINGS] = settings;
        //noinspection JSUnresolvedVariable
        chrome.storage.sync.set(obj, callback);
    }
    else
    {
        const obj = {};
        obj[SETTINGS] = settings;
        //noinspection JSUnresolvedVariable
        chrome.storage.sync.set(obj);
    }
}

/**
 * Resets the settings to their default values
 * @param {function} [callback] passed to {@link chrome.storage.sync.set()}
 * @see DEFAULT_SETTINGS
 */
function clearSettings(callback)
{
    if(typeof callback === "function")
    {
        const obj = {};
        obj[SETTINGS] = DEFAULT_SETTINGS;
        //noinspection JSUnresolvedVariable
        chrome.storage.sync.set(obj, callback);
    }
    else
    {
        const obj = {};
        obj[SETTINGS] = DEFAULT_SETTINGS;
        //noinspection JSUnresolvedVariable
        chrome.storage.sync.set(obj);
    }
}
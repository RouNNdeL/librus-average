const DEBUG_MODE = false;

const SETTINGS = "settings";

const REGEX_WEIGHT = /Waga: (\d+)/;
const REGEX_MARK = /(\d)([+-]?)/;
const REGEX_POLICY = /Licz do średniej:\s*(tak|nie)/;

const REGEX_FIRST_TERM_MARKS = /Oceny bieżące/i;
const REGEX_FIRST_TERM_AVERAGE = /ocen.*pierwszego okresu/i;
const REGEX_SECOND_TERM_MARKS = /Oceny bieżące/i;
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
 * @typedef {Object}
 * @property {number} plusWeight the fraction that will be added to a grade with a plus
 * @property {number} minusWeight the fraction that will be subtracted from a grade with a minus
 * @property {number} defaultWeight weight that will be assigned to a grade with no weight
 * @property {boolean} respectPolicy whether to count grades marked as 'Do not count toward the average'
 * @property {boolean} useWeights whether to use weights at all
 */
const DEFAULT_SETTINGS = {
    plusWeight: PLUS_WEIGHT,
    minusWeight: MINUS_WEIGHT,
    defaultWeight: DEFAULT_WEIGHT,
    respectPolicy: RESPECT_POLICY,
    useWeights: USE_WEIGHTS
};

//Messaging constants
const MSG_COM = "com";
const MSG_DATA = "data";
const CONTENT_SCRIPT_LOADED = "CONTENT_SCRIPT_LOADED";

/**
 * Loads settings from Chrome's sync storage, if no settings are found returns default settings and saves them
 * @param {function} callback function to receive the settings
 * @see DEFAULT_SETTINGS
 */
function loadSettings(callback)
{
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
        chrome.storage.sync.set(obj, callback);
    }
    else
    {
        const obj = {};
        obj[SETTINGS] = settings;
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
        chrome.storage.sync.set(obj, callback);
    }
    else
    {
        const obj = {};
        obj[SETTINGS] = DEFAULT_SETTINGS;
        chrome.storage.sync.set(obj);
    }
}

/**
 * Initializes Google Analytics (analytics.js)
 * @param debug whether to initialize in debugging mode
 */
function loadAnalytics(debug = false)
{
    (function(i, s, o, g, r, a, m)
    {
        i['GoogleAnalyticsObject'] = r;
        //noinspection CommaExpressionJS
        i[r] = i[r] || function()
            {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date();
        //noinspection CommaExpressionJS
        a = s.createElement(o),
            m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m)
    })(window, document, 'script', debug ? 'https://www.google-analytics.com/analytics_debug.js'
        : 'https://www.google-analytics.com/analytics.js', 'ga');

    if(debug)
        window.ga_debug = {trace: true};

    ga('create', 'UA-88362826-2', 'auto');
    ga('set', 'checkProtocolTask', function()
    { /* nothing */
    });
    if(debug)
        ga('set', 'sendHitTask', null);
}
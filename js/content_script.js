/**
 * Created by Krzysiek on 05/06/2017.
 */
'use strict';

$(function()
{
    loadSettings(function(settings)
    {
        setup(settings);
    });
    registerOnChangedListener();
});

/**
 * A simple object tah represents a grade/mark
 * @param mark
 * @param weight
 * @constructor
 */
function Mark(mark, weight)
{
    this.mark = mark;
    this.weight = weight;
}

/**
 * An object containing an array of {@link Mark Marks} and also offering some other functionality
 * (ex. {@link MarkList.getAverage getAverage()});
 * @param {Mark[]} markList an array of {@link Mark Marks} to create the object from
 * @constructor
 */
function MarkList(markList)
{
    if(markList === undefined)
        this.markList = [];
    else
        this.markList = markList;

    /**
     * Calculates a weighted average of all {@link Mark Marks} in the markList
     * @returns {number} weighted average
     */
    this.getAverage = function()
    {
        let markSum = 0;
        let weightSum = 0;

        for(let i = 0; i < this.markList.length; i ++)
        {
            markSum += this.markList[i].mark * this.markList[i].weight;
            weightSum += this.markList[i].weight;
        }

        return weightSum !== 0 ? markSum / weightSum : 0;
    };

    /**
     * Creates a new {@link MarkList} object that contains {@link Mark Marks} from <code>this</code> and the provided {@link MarkList}
     * @param {MarkList} list to be concatenated with <code>this</code>
     * @returns {MarkList} a new object containing all marks
     */
    this.concat = function(list)
    {
        return new MarkList(this.markList.concat(list.markList));
    };
}

/**
 * Registers a {@link  chrome.storage.onChanged} listener to update the averages when the settings change
 */
function registerOnChangedListener()
{
    //noinspection JSUnresolvedVariable
    chrome.storage.onChanged.addListener(function(changes, namespace)
    {
        for(let key in changes)
        {
            if(key === SETTINGS)
            {
                setup(changes[SETTINGS]["newValue"])
            }
        }
    });
}

/**
 * This function allows a regex selector for jQuery
 * @param elem
 * @param index
 * @param match
 * @returns {boolean}
 */
jQuery.expr[':'].regex = function(elem, index, match)
{
    const matchParams = match[3].split(','),
        validLabels = /^(data|css):/,
        attr = {
            method: matchParams[0].match(validLabels) ?
                matchParams[0].split(':')[0] : 'attr',
            property: matchParams.shift().replace(validLabels, '')
        },
        regexFlags = 'ig',
        regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g, ''), regexFlags);

    return regex.test(jQuery(elem)[attr.method](attr.property));
};

/**
 * Used to grab marks from a single row and column in that row.
 * @param {object} row an element that represents a single subject grabbed with jQuery from the subject table
 * @param {number} column index of the column in said table
 * @param {object} [settings = DEFAULT_SETTINGS] used to check for the weights, and the policy
 * @returns {MarkList} for a single subject in a single school term
 * @see DEFAULT_SETTINGS
 */
function getMarks(row, column, settings = DEFAULT_SETTINGS)
{
    let marks = new MarkList();

    $(row).find("td").eq(column).find("span.grade-box  a").each(function()
    {
        let rawMark = $(this).text();
        let markDescription = $(this).attr("title");
        let markMatch = rawMark.match(REGEX_MARK);
        let weightMatch = markDescription.match(REGEX_WEIGHT);
        let policyMatch = markDescription.match(REGEX_POLICY);
        let weight = weightMatch !== null ? parseInt(weightMatch[1]) : settings.defaultWeight;

        let policy = policyMatch !== null ? policyMatch[1] : POLICY_POSITIVE;

        if(markMatch !== null && (! settings.respectPolicy || policy === POLICY_POSITIVE))
        {
            let mark = parseInt(markMatch[1]);
            if(markMatch[2] === "+")
                mark += settings.plusWeight;
            else if(markMatch[2] === "-")
                mark -= settings.minusWeight;
            marks.markList.push(new Mark(mark, weight));
        }
    });

    return marks;
}

/**
 * Performs the whole setup. Using a selector goes through every single row and using {@link getMarks}
 * receives 2 {@link MarkList MarksLists} for both terms and then displays the average
 * calculated by {@link MarkList.getAverage} in the corresponding columns
 * @param {object} [settings = DEFAULT_SETTINGS] settings that are going to be used in the setup
 * @see DEFAULT_SETTINGS
 */
function setup(settings = DEFAULT_SETTINGS)
{
    //Those are rows corresponding to a subject
    //noinspection CssInvalidPseudoSelector
    $("table.decorated.stretch tbody tr:regex(class, line[0,1])")
        .not("tr:regex(name, przedmioty_all)")
        .each(function()
        {
            let firstTermMarks = getMarks(this, FIRST_TERM_INDEX, settings);
            let secondTermMarks = getMarks(this, SECOND_TERM_INDEX, settings);
            let yearMarks = firstTermMarks.concat(secondTermMarks);

            if(firstTermMarks.getAverage() > 0)
                $(this).find("td").eq(FIRST_TERM_AVG).text(firstTermMarks.getAverage().toFixed(2));
            else
                $(this).find("td").eq(FIRST_TERM_AVG).text("-");

            if(secondTermMarks.getAverage() > 0)
                $(this).find("td").eq(SECOND_TERM_AVG).text(secondTermMarks.getAverage().toFixed(2));
            else
                $(this).find("td").eq(SECOND_TERM_AVG).text("-");

            if(yearMarks.getAverage() > 0)
                $(this).find("td").eq(YEAR_AVG).text(yearMarks.getAverage().toFixed(2));
            else
                $(this).find("td").eq(YEAR_AVG).text("-");
        });
}

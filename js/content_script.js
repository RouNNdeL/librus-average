/**
 * Created by Krzysiek on 05/06/2017.
 */
'use strict';

$(function(e)
{
    loadSettings(function(settings)
    {
        console.log(settings);
        setup(settings);
    });
});

function Mark(mark, weight)
{
    this.mark = mark;
    this.weight = weight;
}

function MarkList(markList)
{
    if(markList === undefined)
        this.markList = [];
    else
        this.markList = markList;

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

    this.concat = function(list)
    {
        return new MarkList(this.markList.concat(list.markList));
    };
}

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

function getMarks(row, column_no, settings)
{
    let marks = new MarkList();

    $(row).find("td").eq(column_no).find("span.grade-box  a").each(function(i)
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

function setup(settings)
{
    //Those are rows corresponding to a subject
    //noinspection CssInvalidPseudoSelector
    $("table.decorated.stretch tbody tr:regex(class, line[0,1])")
        .not("tr:regex(name, przedmioty_all)")
        .each(function(i)
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

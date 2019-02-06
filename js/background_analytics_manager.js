//noinspection JSUnusedLocalSymbols
/**
 * Created by Krzysiek on 10/06/2017.
 */

function onMessageListener(request, sender, sendResponse) {
    let url;
    if(sender.tab !== undefined && sender.tab.url !== undefined)
        url = sender.tab.url;
    else if(sender.url !== undefined)
        url = sender.url;
    else
        url = "no_url";
    switch(request[MSG_COM]) {
        case CONTENT_SCRIPT_LOADED: {
            //noinspection JSUnresolvedVariable
            ga('send', {
                hitType: 'event',
                eventCategory: 'Content Script',
                eventAction: 'pageLoad',
                eventLabel: url
            });
            break;
        }
        case CONTENT_SCRIPT_EXITING: {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Content Script',
                eventAction: 'pageExit',
                eventLabel: url,
                eventValue: request[MSG_DATA]
            });
            break;
        }
    }
}

chrome.runtime.onMessage.addListener(onMessageListener);

loadAnalytics(DEBUG_MODE);

//noinspection JSUnusedLocalSymbols
/**
 * Created by Krzysiek on 10/06/2017.
 */

function onMessageListener(request, sender, sendResponse) {
    switch(request[MSG_COM]) {
        case CONTENT_SCRIPT_LOADED: {
            //noinspection JSUnresolvedVariable
            ga('send', {
                hitType: 'event',
                eventCategory: 'Content Script',
                eventAction: 'pageLoad',
                eventLabel: sender.tab ? sender.tab.url : "extension"
            });
        }
    }
}

chrome.runtime.onMessage.addListener(onMessageListener);

loadAnalytics(DEBUG_MODE);
ga('send', "pageview");
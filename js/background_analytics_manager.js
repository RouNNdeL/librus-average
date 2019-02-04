//noinspection JSUnusedLocalSymbols
/**
 * Created by Krzysiek on 10/06/2017.
 */

function onMessageListener(request, sender, sendResponse) {
    switch(request[MSG_COM]) {
        case CONTENT_SCRIPT_LOADED: {
            let url;
            if(sender.tab !== undefined && sender.tab.url !== undefined)
                url = sender.tab.url;
            else if(sender.url !== undefined)
                url = sender.url;
            else
                url = "no_url";
            //noinspection JSUnresolvedVariable
            ga('send', {
                hitType: 'event',
                eventCategory: 'Content Script',
                eventAction: 'pageLoad',
                eventLabel: url
            });
        }
    }
}

chrome.runtime.onMessage.addListener(onMessageListener);

loadAnalytics(DEBUG_MODE);

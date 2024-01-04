chrome.runtime.onInstalled.addListener(() => {
    // Disabled by default and enabled on select tabs
    chrome.action.disable();

	chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        const whRule = {
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {
                        hostSuffix: '.wallhaven.cc'
                    }
                })
            ],
            actions: [new chrome.declarativeContent.ShowAction()]
        };
        const rules = [ whRule ];

		chrome.declarativeContent.onPageChanged.addRules(rules);
	});
});

// 监听来自content-script的消息
var allData = null;
var initPromise = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // 当 service worker 首次激活开始处理信息时, allData 尚未初始化
    if (!allData) {
        if (initPromise) {
            initPromise.then(() => {
                processMessage(request, sender, sendResponse);
            });
        }
    }
    else {
        processMessage(request, sender, sendResponse);
    }

    // Must return true...
    return true;
});

function processMessage (request, sender, sendResponse) {
    if (request.action === 'insert') {
        // from content-script, insert new image
        var newData = request.payload;
        var exists = allData.findIndex(item => item.key === newData.key) >= 0;

        if (!exists) {
            allData.push(newData);

            updateBadgeText();
        }

        chrome.storage.local.set({whImageList: allData}, function() {
            console.log('>> after background [local.set], allData: ', allData);
        });
        
        sendResponse({exists: exists});
    }
    else if (request.action === 'getdata') {
        chrome.storage.local.get({whImageList: []}, function(data) {
            var currentData = data.whImageList;
            sendResponse({payload: currentData});
        });
    }
    else if (request.action === 'cleardata') {
        clearData();
        sendResponse({payload: true});
    }
}

function updateBadgeText() {
    if (allData) {
        if (allData.length) {
            var badgeText = allData.length > 100 ? '99+' : '' + allData.length;

            chrome.action.setBadgeText({text: badgeText});
            chrome.action.setBadgeBackgroundColor({color: '#fb3'});
        }
        else if (allData.length === 0) {
            chrome.action.setBadgeText({text: ''});
            chrome.action.setBadgeBackgroundColor({color: '#fb3'});
        }
    }
}

function clearData () {
    chrome.storage.local.clear(function() {
        allData = [];
        updateBadgeText();
    });
}

function initAllData() {
    if (!initPromise) {
        initPromise = new Promise((resolve, reject) => {
            chrome.storage.local.get({whImageList: []}, function(data) {
                allData = data.whImageList;
                updateBadgeText();
                resolve();
            });
        });
    }
}

(function() {
    initAllData();
})();

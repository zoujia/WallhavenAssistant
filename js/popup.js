var timeHandler = null;

function getAllData (cb) {
    chrome.runtime.sendMessage({
        action: 'getdata'
    }, function(res) {
        if (res && res.payload && cb && typeof cb === 'function') {
            cb(res.payload);
        }
    });
}

function displayAllData() {
    getAllData(function (allData) {
        $('#txtTotal').text(allData.length);
        $('#imgList').empty();

        if (allData.length) {
            $('#nodataBox').hide();
            $('#imgList').show();
            
            let strArr = [];
            $.each(allData, function(index, item) {
                strArr.push('<li data-id="' + item.key + '">' + item.url + '</li>');
            });
            
            $('#imgList').html(strArr.join(''));

            strArr = [];
        }
        else {
            $('#nodataBox').show();
            $('#imgList').hide();
            $('.main-actions .btn').prop('disabled', true);
        }
    });
}

function clearStorage() {
    chrome.runtime.sendMessage({
        action: 'cleardata'
    }, function(res) {
        if (res && res.payload) {
            $('#imgList').empty();
            $('#nodataBox').show();
            $('#txtTotal').text('0');
            $('.main-actions .btn').prop('disabled', true);

            updateTip('数据已清空！');
        }
    });
}

function updateTip(msg) {
    if (timeHandler) {
        clearTimeout(timeHandler);
        timeHandler = null;
    }

    $('#txtTip').text(msg);

    timeHandler = setTimeout(function() {
        $('#txtTip').text('');
    }, 2000);
}

function copy(content) {
    var copyPH = document.createElement('textarea');
    copyPH.id = 'copiedContentPH';
    copyPH.style.position = 'absolute';
    copyPH.style.left = '-10000px';
    copyPH.style.top = '-10000px';
    copyPH.value = content;

    $('body').append(copyPH);

    try {
        var range = document.createRange();
        range.selectNode(copyPH);
        var selection = window.getSelection();
        if (selection.rangeCount > 0) {
            selection.removeAllRanges();
        }
        selection.addRange(range);
        document.execCommand('copy');
    }
    catch(e) {
    }

    $(copyPH).remove();
}

function copyAllData() {
    getAllData(function (allData) {
        if (allData && allData.length) {
            var allUrls = [];
            $.each(allData, function (idx, item) {
                allUrls.push(item.url);
            });
            
            copy(allUrls.join('\n'));

            updateTip('已复制！');
        }
    });
}

$(document).ready(function() {
    displayAllData();
    
    $('#btnClearStorage').on('click', function() {
        clearStorage();
    });

    $('#btnCopy').on('click', function() {
        copyAllData();
    });
});

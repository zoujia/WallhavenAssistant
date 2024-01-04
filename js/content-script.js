$(document).ready(function () {
    // 缩略图所在容器有几种场景:
    // - 普通
    // - tag 标签
    // - forum 的帖子, 而且一个帖子内容可能有多个 figure
    $(document).delegate('#thumbs .thumb-listing-page ul li figure.thumb[data-wallpaper-id], #tag-thumbs ul li figure.thumb[data-wallpaper-id], .forum-post .forum-post-body figure.thumb[data-wallpaper-id]', 'mouseenter', function () {
        var $this = $(this);

        if (!$this.data('hasPlusBtn')) {
            // wallpaper-id 的值可能是 数字, 而数字无法进行 substring 运算
            var key = $this.data('wallpaper-id') + '';

            if (key) {
                var isPng = $this.find('span.png').length > 0;
                var ext = isPng ? 'png' : 'jpg';
                var fullPath = 'https://w.wallhaven.cc/full/' + key.substring(0, 2) + '/wallhaven-' + key + '.' + ext;
                var itemData = {
                    key: key,
                    url: fullPath
                };
                
                var $plusBtn = $('<a class="thumb-btn wa-thumb-btn-add" href="#"><i class="fas fa-fw fa-plus"></i></a>');
                $plusBtn.on('click', function(e) {
                    e.preventDefault();
                    
                    chrome.runtime.sendMessage({
                        action: 'insert',
                        payload: itemData
                    }, function(response) {
                        if (!$this.data('hasCopied')) {
                            $this.append('<div class="wa-copied-box">COPY</div>');
                            $this.data('hasCopied', true);
                        }
                    });
                });

                $this.prepend($plusBtn);
                $this.data('hasPlusBtn', true);
            }
        }
    });
});

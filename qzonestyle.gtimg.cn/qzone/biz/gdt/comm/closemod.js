
define(function(require) {
    function closemod(admodlist, showClose, opt) {
        var negativehtml = '<a href="javascript:;" data-acttype="2001" class="_js_closelist _js_neg_for_mouse"><span class="_js_closelist _js_neg_for_mouse"  data-acttype="2001">对该广告不感兴趣</span></a>\
                        <a href="javascript:;" data-acttype="2002" class="_js_closelist _js_neg_for_mouse"><span class="_js_closelist _js_neg_for_mouse"  data-acttype="2002">广告含低俗、虚假信息</span></a>\
                        <a href="http://e.qq.com/wiki/%E5%A6%82%E4%BD%95%E5%90%91%E7%B3%BB%E7%BB%9F%E5%8F%8D%E9%A6%88%E6%88%96%E6%8A%95%E8%AF%89%E6%82%A8%E5%AF%B9%E5%B9%BF%E5%91%8A%E7%9A%84%E6%84%8F%E8%A7%81%EF%BC%9F" target="_blank" class="_js_neg_for_mouse"><span class="_js_neg_for_mouse">关于您的反馈</span></a>';
        for (var i = 0, len = admodlist.length; i < len; i++) {
            var _cid = '#' + admodlist[i];
            var _cnt = $e(_cid);
            var showCloseBtn = function(cnt, cid) {
                if (cnt.find('._js_negative').elements.length == 0) {
                    var d = document.createElement('a');
                    d.setAttribute('href', 'javascript:;');
                    if (cid != '#gdtpaipai') {
                        d.className = 'btn-close  _js_negative';
                        d.innerHTML = '<i class="ui-icon icon-close _js_negative"></i>';
                    } else {
                        d.className = 'btn-close btn-close-nh  _js_negative';
                        d.innerHTML = '×';
                    }
                    $e(d).appendTo(cnt.find('.main'));
                }
            };
            (function(cnt, cid) {
                showCloseBtn(cnt, cid);
                if (!showClose) {
                    cnt.find('._js_negative').setStyle('display', 'none');
                }
                cnt.bind('mouseover', function(evt) {
                    if (cnt.find('._js_shield').elements.length) {
                        return;
                    }
                    if (!showClose) {
                        cnt.find('._js_negative').setStyle('display', 'block');
                    }
                    closemod.neglisttimout && clearTimeout(closemod.neglisttimout);
                }).bind('mouseout', function(evt) {
                    if (cnt.find('._js_shield').elements.length) {
                        return;
                    }
                    if (!showClose) {
                        cnt.find('._js_negative').setStyle('display', 'none');
                    }
                    closemod.neglisttimout = setTimeout(function() {
                        cnt.find('._js_neglist').setStyle('display', 'none');
                    }, 200);
                }).bind('click', function(evt) {
                    evt = evt || window.event;
                    var t = evt.target || evt.srcElement;
                    if ($e(t).hasClass('_js_negative')) {
                        if (cnt.find('._js_neglist').elements.length == 0) {
                            var nd = document.createElement('div');
                            if (cid == '#gdtpaipai') {
                                nd.className = 'close-list close-list-nh _js_neglist _js_neg_for_mouse';
                            } else {
                                nd.className = 'close-list _js_neglist _js_neg_for_mouse';
                            }
                            nd.style.display = 'none';
                            nd.innerHTML = negativehtml;
                            $e(nd).appendTo(cnt.find('.main'));
                        }
                        var dis = cnt.find('._js_neglist').getStyle('display');
                        if (dis.indexOf('none') != -1) {
                            cnt.find('._js_neglist').setStyle('display', 'block');
                        } else {
                            cnt.find('._js_neglist').setStyle('display', 'none');
                        }
                    } else if ($e(t).hasClass('_js_closelist')) {
                        var acttype = t.getAttribute('data-acttype');
                        cnt.find('a').each(function(v, k) {
                            if (v.href && v.href.indexOf('http://c.gdt.qq.com/gdt_click.fcg?') != -1) {
                                var url = v.href;
                                url = url.split('?')[1];
                                var ps = url.split('&');
                                for (var i = 0, len = ps.length; i < len; i++) {
                                    var kv = ps[i];
                                    if (kv && (kv.toLowerCase().indexOf('viewid=') != -1)) {
                                        var reporturl = 'http://c.gdt.qq.com/gdt_report.fcg?' + kv + '&acttype=' + acttype;
                                        var img = new Image();
                                        img.src = reporturl;
                                    }
                                }
                                return false;
                            }
                        });
                        var tmpl = '<div class="main"><div class="shield _js_shield">广告已隐藏，感谢你的反馈！<a target="_blank" href="http://e.qq.com/wiki/%E5%A6%82%E4%BD%95%E5%90%91%E7%B3%BB%E7%BB%9F%E5%8F%8D%E9%A6%88%E6%88%96%E6%8A%95%E8%AF%89%E6%82%A8%E5%AF%B9%E5%B9%BF%E5%91%8A%E7%9A%84%E6%84%8F%E8%A7%81%EF%BC%9F">了解详情&gt;</a></div></div>';
                        if (cid == '#gdtdiscover') {
                            if (opt && opt.needShut) {
                                GDTMOD.Discover.setNeeded(false);
                            }
                            tmpl = '<h3>发现生活</h3>' + tmpl;
                        }
                        cnt.find('.main').getParent().setHtml(tmpl);
                        window.setTimeout((function(id) {
                            return function() {
                                if (id == '#gdtdiscover') {
                                    GDTMOD.Discover.unbindScoll();
                                }
                                cnt.remove();
                            }
                        })(cid), 5000);
                    }
                });
            })(_cnt, _cid);
        }
    }
    ;
    return {closemod: closemod};
});

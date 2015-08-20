
(function() {
    window.GDT = window.GDT || {};
    var GDTClick = {};
    GDTClick.event = {getEvent: function(evt) {
            var evt = window.event || evt || null, c, ct = 0;
            if (!evt) {
                c = arguments.callee;  //指向的是当前的函数的引用
                while (c && ct < 10) {
                    if (c.arguments && (evt = c.arguments[0]) && (typeof (evt.button) != "undefined" && typeof (evt.ctrlKey) != "undefined")) {  //c.arguments[0]当前函数实参的第一个值
                        break;
                    }
                    ++ct;
                    c = c.caller;
                }
            }
            return evt;
        }};
    //Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()这种方法能够得到obj的实际类型，如array、object、（string、number、null、undefined、boolean）后面五个是基本数据类型
    GDTClick.getType = function(obj) {
        return obj === null ? 'null' : (obj === undefined ? 'undefined' : Object.prototype.toString.call(obj).slice(8, -1).toLowerCase());
    };
    GDTClick.each = function(d, a, b) {
        if (typeof d.length == "number") {
            for (var f = 0, n = d.length; f < n; f++)
                a.call(b, d[f], f);
        } 
        else if (typeof d == "number") {
            for (f = 0; f < d; f++)
                a.call(b, f, f);
        } 
        else {
            for (f in d)
                a.call(b, d[f], f);
        }
    };
    //这里的JSONToString实现方法字符串拼接，
    GDTClick.JSONToString = function(obj) {
        if (typeof JSON != 'undefined' && JSON.stringify) {
            return JSON.stringify(obj);
        } else {
            var str = '', arr = [], type;
            var otype = GDTClick.getType(obj);
            var bstart = (otype == 'array') ? '[' : '{';
            var bend = (otype == 'array') ? ']' : '}';
            str += bstart;
            GDTClick.each(obj, function(v, k) {
                var substr = "";
                if (otype != 'array') {  //外层对象如果不是数组则是object对象，所以需要先拼上key，后面再拼上value
                    substr = "\"" + k + "\":";
                }
                type = GDTClick.getType(v);
                if (type == 'string') {
                    substr += "\"" + v + "\"";
                } else if (type == 'number') {
                    substr += v;
                } else if (type == 'undefined') {
                    substr += type;
                } else if (type == 'object') {  //当它的value是一个object时，继续调用自己，先拼好这个对象里的值，类似深度优先。
                    substr += GDTClick.JSONToString(v);
                }
                arr.push(substr);
            });
            str += arr.join(',');
            str += bend;
            return str; 
        }
    };
    GDTClick.getTime = function() {
        return +new Date();  //获取当前时间并转换成number类型，相当于Number(new Date());
    };
    GDTClick.dom = {get: function(e) {
            return (typeof (e) == "string") ? document.getElementById(e) : e;
        },getStyle: function(el, property) {
            el = GDTClick.dom.get(el);
            if (!el || el.nodeType == 9) {  //el.nodeType == 9代表整个文档（DOM 树的根节点）
                return null;
            }
            var w3cMode = document.defaultView && document.defaultView.getComputedStyle, computed = !w3cMode ? null : document.defaultView.getComputedStyle(el, ''), value = "";
            switch (property) {
                case "float":
                    property = w3cMode ? "cssFloat" : "styleFloat";
                    break;
                case "opacity":
                    if (!w3cMode) {
                        var val = 100;
                        try {
                            val = el.filters['DXImageTransform.Microsoft.Alpha'].opacity;
                        } catch (e) {
                            try {
                                val = el.filters('alpha').opacity;
                            } catch (e) {
                            }
                        }
                        return val / 100;
                    } else {
                        return parseFloat((computed || el.style)[property]);
                    }
                    break;
                case "backgroundPositionX":
                    if (w3cMode) {
                        property = "backgroundPosition";
                        return ((computed || el.style)[property]).split(" ")[0];
                    }
                    break;
                case "backgroundPositionY":
                    if (w3cMode) {
                        property = "backgroundPosition";
                        return ((computed || el.style)[property]).split(" ")[1];
                    }
                    break;
            }
            if (w3cMode) {
                return (computed || el.style)[property];
            } else {
                return (el.currentStyle[property] || el.style[property]);
            }
        },getScrollTop: function(doc) {
            var _doc = doc || document;
            return Math.max(_doc.documentElement.scrollTop, _doc.body.scrollTop);
        },getScrollLeft: function(doc) {
            var _doc = doc || document;
            return Math.max(_doc.documentElement.scrollLeft, _doc.body.scrollLeft);
        },searchChain: function(elem, prop, func) {
            prop = prop || 'parentNode';
            while (elem && elem.nodeType && elem.nodeType == 1) {
                if (!func || func.call(elem, elem)) {
                    return elem;
                }
                elem = elem[prop];
            }
            return null;
        },getAncestorBy: function(elem, method) {
            elem = GDTClick.dom.get(elem);
            return GDTClick.dom.searchChain(elem.parentNode, 'parentNode', function(el) {
                return el.nodeType == 1 && (!method || method(el));
            });
        },getSize: function(el) {
            var _fix = [0, 0], i, len, arr;
            if (el) {
                arr = ["Left", "Right", "Top", "Bottom"];
                for (i = 0, len = arr.length; i < len; i++) {
                    var v = arr[i];
                    _fix[v == "Left" || v == "Right" ? 0 : 1] += (parseInt(GDTClick.dom.getStyle(el, "border" + v + "Width"), 10) || 0) + (parseInt(GDTClick.dom.getStyle(el, "padding" + v), 10) || 0);
                }
                var _w = el.offsetWidth - _fix[0], _h = el.offsetHeight - _fix[1];
                return [_w, _h];
            }
            return [-1, -1];
        }};
    var ClickManage = (function() {
        var cm, da;
        cm = {possize: {},initdata: function() {
                da.mousedown = {x: da.none,y: da.none};
                da.mouseup = {x: da.none,y: da.none};
                da.mousedownTime = da.none;
                da.mouseupTime = da.none;
                da.clickTime = da.none;
            },getPosSize: function(obj, pid) {
                var possize, posel, size, dom = GDTClick.dom;
                possize = cm.possize[pid];
                if (!possize) {
                    possize = {};
                    posel = dom.getAncestorBy(obj, function(el) {
                        return (el.className == 'mod-snsmarketing-slot-external');
                    });
                    if (posel) {
                        size = dom.getSize(posel);
                        possize.width = size[0];
                        possize.height = size[1];
                    } else {
                        possize.width = da.none;
                        possize.height = da.none;
                    }
                    cm.possize[pid] = possize;
                }
                return possize;
            },combinedata: function(phrase, obj, pid, oid) {
                var data = {}, now = GDTClick.getTime(), dimension, size;
                data.aa = parseInt(da.mousedown.x, 10) || da.none;
                data.ab = parseInt(da.mousedown.y, 10) || da.none;
                data.ba = parseInt(da.mouseup.x, 10) || da.none;
                data.bb = parseInt(da.mouseup.y, 10) || da.none;
                data.g = (da.clickTime > 0 && da.mousedownTime > 0) ? (da.clickTime - da.mousedownTime) : da.none;
                data.e = (cm.entertime > 0) ? (now - cm.entertime) : da.none;
                data.r = 2;
                data.p = da.none;
                data.da = da.none;
                data.db = da.none;
                GDTClick.each(data, function(v, k) {
                    data[k] = v + '';
                });
                return data;
            },getTarget: function(obj) {
                return obj;
            },getX: function(evt) {
                return evt.clientX + GDTClick.dom.getScrollLeft();
            },getY: function(evt) {
                return evt.clientY + GDTClick.dom.getScrollTop();
            },getUrl: function(obj, data) {
                var originUrl, url;
                originUrl = obj.getAttribute('gdtoriurl');
                url = originUrl + '&s=' + GDTClick.JSONToString(data);
                return url;
            },setLink: function(obj, url) {
                var target = cm.getTarget(obj);
                target.setAttribute('href', url);
            },mouseover: function(pid, oid, opts) {
                cm.entertime = GDTClick.getTime();
            },mousedown: function(pid, oid, opts) {
                var data = {}, evt, el;
                opts = opts || {};
                el = opts.el;
                if (!el) {
                    return;
                }
                cm.initdata();
                da.mousedownTime = GDTClick.getTime();
                evt = GDTClick.event.getEvent();
                da.mousedown.x = cm.getX(evt);
                da.mousedown.y = cm.getY(evt);
                data = cm.combinedata(1, el, pid, oid);
                var url = cm.getUrl(el, data);
                !opts.callback && cm.setLink(el, url);
                opts.callback && (opts.callback({type: 'mousedown',url: url}));
            },mouseup: function(pid, oid, opts) {
                var data = {}, target, el, url, now = GDTClick.getTime();
                opts = opts || {};
                el = opts.el;
                if (!el) {
                    return;
                }
                da.mouseupTime = now;
                evt = GDTClick.event.getEvent();
                da.mouseup.x = cm.getX(evt);
                da.mouseup.y = cm.getY(evt);
                data = cm.combinedata(2, el, pid, oid);
                var url = cm.getUrl(el, data);
                !opts.callback && cm.setLink(el, url);
                opts.callback && (opts.callback({type: 'mouseup',url: url}));
            },click: function(pid, oid, opts) {
                var data = {}, now = GDTClick.getTime(), evt, el;
                opts = opts || {};
                el = opts.el;
                if (!el) {
                    return;
                }
                da.clickTime = now;
                evt = GDTClick.event.getEvent();
                data = cm.combinedata(3, el, pid, oid);
                var url = cm.getUrl(el, data);
                !opts.callback && cm.setLink(el, url);
                opts.callback && (opts.callback({type: 'click',url: url}));
            }};
        cm.data = {none: -999,entertime: 0};
        da = cm.data;
        return cm;
    })();
    GDTClick.bindEvent = function(anode, url, callback) {
        if (anode.getAttribute('gdtoriurl')) {
            return;
        }
        anode.onclick = function() {
            var el = this;
            ClickManage.click(null, null, {el: el,callback: callback});
        };
        anode.onmousedown = function() {
            var el = this;
            ClickManage.mousedown(null, null, {el: el,callback: callback});
        };
        anode.onmouseup = function() {
            var el = this;
            ClickManage.mouseup(null, null, {el: el,callback: callback});
        };
        anode.onmouseover = function() {
            var el = this;
            ClickManage.mouseover(null, null, {el: el,callback: callback});
        };
        anode.setAttribute('gdtoriurl', url);
    };
    GDT.anticheat = function(params) {
        var el = params.container, alist, href, anode, elements = params.elements;
        if (el) {
            alist = el.getElementsByTagName('a');
            for (var i = alist.length - 1; i >= 0; i--) {
                anode = alist[i];
                href = anode.getAttribute('href');
                if (href && href.indexOf('http://c.gdt.qq.com/gdt_click.fcg') == 0) {
                    GDTClick.bindEvent(anode, href);
                }
            }
        }
        if (elements) {
            GDTClick.each(elements, function(v, k) {
                var elist = (GDTClick.getType(v.element) != 'array') ? [v.element] : v;
                GDTClick.each(elist, function(el) {
                    GDTClick.bindEvent(el, v.url, v.callback);
                });
            });
        }
    };
})();

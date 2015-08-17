
(function(GDX) {
    var CONFIG = {STORAGE_KEY: 'GDX_CM_',GDT_CHECK_URL: 'http://m.e.qq.com/pixel.fcg?mod=check&gdt_f=json'};
    var storage = {};
    (function(ql) {
        var store = null, engine = null, searchOrder, engines;
        searchOrder = ['localStorage', 'userData'];
        engines = {localStorage: {test: function() {
                    return !!window.localStorage;
                },init: function() {
                    store = window.localStorage;
                },getItem: function(key) {
                    return store.getItem(key);
                },setItem: function(key, value) {
                    return store.setItem(key, value);
                },removeItem: function(key) {
                    return store.removeItem(key);
                }},userData: {test: function() {
                    return window.ActiveXObject ? true : false;
                },init: function() {
                    store = document.documentElement;
                    store.addBehavior('#default#userdata');
                },getItem: function(key) {
                    store.load(key);
                    return store.getAttribute(key);
                },setItem: function(key, value) {
                    store.load(key);
                    store.setAttribute(key, value);
                    return store.save(key);
                },removeItem: function(key) {
                    store.load(key);
                    store.expires = new Date(315532799000).toUTCString();
                    return store.save(key);
                }}};
        for (var i = 0, l = searchOrder.length, engine; i < l; i++) {
            engine = engines[searchOrder[i]];
            try {
                if (engine.test()) {
                    engine.init();
                    break;
                }
            } catch (ex) {
                engine = null;
            }
        }
        ql.set = function(key, value) {
            try {
                return engine.setItem(key, value);
            } catch (ex) {
                return false;
            }
        };
        ql.get = function(key) {
            try {
                return engine.getItem(key);
            } catch (ex) {
                return null;
            }
        };
        ql.remove = function(key) {
            try {
                return engine.removeItem(key);
            } catch (ex) {
                return false;
            }
        };
    })(storage);
    var getCookie = function(name) {
        var m, regx;
        regx = new RegExp('(?:^|;+|\\s+)' + name + '=([^;]*)');
        m = document.cookie.match(regx);
        return !m ? "" : m[1];
    };
    var getUin = function() {
        var uin = getCookie('uin') || getCookie('zzpaneluin');
        if (uin.length > 4) {
            uin = +uin.replace(/o(\d+)/g, '$1');
        } else {
            return;
        }
        return uin;
    };
    var genGTK = function(str) {
        var hash = 5381;
        str = str || getCookie('skey') || '';
        for (var i = 0, len = str.length; i < len; ++i) {
            hash += (hash << 5) + str.charAt(i).charCodeAt();
        }
        return hash & 0x7fffffff;
    };
    var updateMatchingResult = function(data) {
        var uin, time;
        if (data) {
            time = data.time;
            uin = getUin();
            if (uin && time) {
                GDX.storageNotify(CONFIG.STORAGE_KEY + uin, time * 1000);
            }
        }
    };
    GDX.init = function() {
        var uin, time, now = (new Date()).getTime();
        if (GDX.isMatched) {
            return;
        }
        GDX.isMatched = true;
        uin = getUin();
        if (!uin) {
            return;
        }
        if ((time = storage.get(CONFIG.STORAGE_KEY + uin)) && now < time) {
            return;
        }
        GDX.startCookieMatching();
    };
    GDX.storageNotify = function(key, val) {
        var ifr = document.createElement('iframe');
        ifr.frameBorder = '0';
        ifr.width = ifr.height = '1';
        ifr.style.cssText = 'position:absolute;left:0;top:0';
        ifr.src = 'http://qzs.qq.com/qzone/biz/comm/widget/cookiematching/cm_helper.html?reload#mod=store&g_tk=' + genGTK() + '&key=' + key + '&val=' + val;
        document.body.appendChild(ifr);
    };
    GDX.startCookieMatching = function() {
        var ifr = document.createElement('iframe'), url;
        url = [CONFIG.GDT_CHECK_URL, 'r=' + Math.random()].join('&');
        ifr.frameBorder = '0';
        ifr.width = ifr.height = '1';
        ifr.style.cssText = 'position:absolute;left:0;top:0';
        ifr.src = url;
        document.body.appendChild(ifr);
    };
    GDX.cookieMatching = function(d) {
        var time, uin;
        d = d || {};
        if (d.ret === 0) {
            var s, url = d.data.url;
            if (url) {
                s = document.createElement('script');
                s.type = 'text/javascript';
                document.body.appendChild(s);
                s.src = url;
            }
        }
        updateMatchingResult(d.data);
    };
    GDX.cookieMatchingCallback = function(d) {
        updateMatchingResult(d.data);
    };
    (function() {
        var hash = location.hash.slice(1).split('&'), params = {}, key, val;
        for (var i = 0, l = hash.length; i < l; i++) {
            var item = hash[i].split('=');
            params[item[0]] = item[1];
        }
        if (params.mod === 'cm') {
            GDX.init();
        } else if (params.mod === 'store') {
            key = params.key;
            val = parseInt(params.val, 10);
            if (params.g_tk != genGTK()) {
                return;
            }
            if (key && key.indexOf(CONFIG.STORAGE_KEY) >= 0 && (key.length - CONFIG.STORAGE_KEY.length) < 14) {
                storage.set(key, val);
            }
        } else {
        }
    })();
})(window.GDX = window.GDX || {}); /*  |xGv00|20639a9060ea71c23f1a7761c33ebcd1 */

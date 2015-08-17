
GDTDefine('gdt:mod/extrender.js', function(require, exports, module) {
    var helper = require('gdt:comm/helper.js');
    var comm = require('gdt:comm/comm.js');
    var snsmod = require('gdt:mod/sns.js');
    var datamanage = require('gdt:comm/data.js');
    var ExtRenderMod = {}, FP;
    var FP = (typeof (QZONE) != 'undefined') && (QZONE.FrontPage || QZONE.FP);
    ExtRenderMod.FP = FP;
    ExtRenderMod._renderExt = function(pid, oid, container, callback, opt) {
        var div, num = 0, arr = [], ret;
        var doc = (opt && opt.doc) || document;
        opt = opt || {};
        opt.dealfn = opt.dealfn || {};
        div = doc.createElement('div');
        var contcn = 'qz_interactive ';
        contcn += opt.textclass || '';
        div.className = contcn;
        ExtRenderMod._dealExtList(pid, oid, function(arr) {
            num = (arr && arr.length) || 0;
            if (num > 0) {
                div.innerHTML = arr.join('');
                container && container.appendChild(div);
                ExtRenderMod._loadAppFriendCss({'doc': doc});
                var lnks = div.getElementsByTagName('a');
                comm.each(lnks, function(v) {
                    if (v.getAttribute('appnick')) {
                        v.onclick = function() {
                            helper.pgvOrder('appnickname', pid);
                        };
                    }
                });
            }
            callback && callback({num: num});
        }, opt);
    };
    ExtRenderMod._dealExtList = function(pid, oid, callback, opt) {
        var oda, alist, aconf, ret, retnum = 0, dealarr = [], arrRet = [];
        oda = datamanage.getOrderData(pid, oid);
        alist = oda && oda.ext && oda.ext.alist;
        if (alist) {
            comm.each(alist, function(aconf, aid) {
                aid = parseInt(aid, 10);
                var fn = snsmod._extDealFn[aid];
                if (fn) {
                    dealarr.push([fn, aconf, aid]);
                }
            });
        } else {
            callback(arrRet);
            return;
        }
        var fncb = function(ret, dealconf) {
            var strRet = '';
            if (ret && (strRet = ret.text)) {
                if (dealconf[2] === 2017) {
                    arrRet.push('<div class="qz_interactive_focus">' + strRet + '<\/div>');
                } else {
                    arrRet.push('<div class="interactive_txt">' + strRet + '<\/div>');
                }
            }
            retnum++;
            if (dealarr.length == retnum) {
                callback(arrRet);
            }
        };
        comm.each(dealarr, function(dealconf, k) {
            var fopt = comm.mix({callback: function(ret) {
                    fncb(ret, dealconf);
                }}, opt);
            dealconf[0](dealconf[1], pid, oda, fopt);
        });
    };
    ExtRenderMod._getFriendApp = function(conf, pid, odata, opt) {
        opt = opt || {};
        conf = conf || {};
        var str = '', appname, fconf, flist, count, ret, isShowFriend, total;
        var expIsShowFriend = datamanage.getPosCfgByKey(pid, 30455);
        isShowFriend = expIsShowFriend != 1;
        fconf = conf.aid || {};
        flist = fconf.list || [];
        count = parseInt(fconf.count, 10) || 0;
        total = parseInt(fconf.total, 10) || 0;
        if (count <= 2) {
            count = flist.length;
        }
        count = (flist.length == 0) ? 0 : count;
        if (count > 0) {
            appname = odata.appname;
            if (appname) {
                var userlist = [];
                for (var i = 0; i < 2; i++) {
                    var user = flist[i];
                    if (user) {
                        var nick = snsmod._trimnickname(user.nickname, 8);
                        if (opt.platform && opt.platform != 'qzone') {
                            userlist.push(nick);
                        } else {
                            userlist.push(snsmod._wrapnickname(nick, user.uin, 'interactive_txt_a'));
                        }
                    }
                }
                str += userlist.join('、');
                var action = ExtRenderMod._getAppAction(conf, odata);
                if (isShowFriend) {
                    if (count <= 2) {
                        str += '最近' + action;
                    } else {
                        count = ExtRenderMod._formatFriendNum(count);
                        str += '等' + count + '个好友最近' + action;
                    }
                } else {
                    str = total + '人' + action;
                }
                var applen = (count <= 2 || flist.length < 2) ? 20 : 12;
                var tappname = snsmod._trimnickname(appname, applen);
                str += '<a class="ad_interactive_a" href="' + odata._l + '" onclick="return GDT._openlink(\'' + pid + '\', \'' + odata.cl + '\');" title="' + appname + '" target="_blank">' + tappname + '</a>';
            } else {
                str = '';
            }
        }
        ret = {'text': str};
        opt.callback && opt.callback(ret);
        return ret;
    };
    ExtRenderMod._getAppAction = function(anode, odata) {
        var action = {1: '在玩',2: '在用'}, type = 1;
        var cls = odata && parseInt(odata.ext.appclass, 10);
        type = (cls == 769) ? 1 : 2;
        return action[type];
    };
    ExtRenderMod._formatFriendNum = function(num) {
        num = parseInt(num, 10);
        var str = num;
        if (num > (1e8 - 1)) {
            str = ExtRenderMod._getnum(num / 1e8) + '亿';
        } else if (num > (1e4 - 1)) {
            str = ExtRenderMod._getnum(num / 1e4) + '万';
        }
        return str;
    };
    ExtRenderMod._getnum = function(num) {
        num = num + '';
        num = num.replace(/(\d*)(\.(\d)\d*)?/, function($all, $pre, $n, $fix) {
            var str = '';
            str = $pre ? $pre : str;
            str = $fix ? str + '.' + $fix : str;
            return str;
        });
        return num;
    };
    ExtRenderMod._getPageLike = function(conf, pid, odata, opt) {
        opt = opt || {};
        conf = conf || {};
        var arrStr = [], count, fcount, flist, fconf, pagename, pageuin, pnameCutLen, pnameLen = 0, fnick, fnickCutLen = 0, fnicklen = 0, likecount, ret;
        if (conf.aid) {
            fconf = conf.aid || {};
            flist = fconf.list || [];
            fcount = parseInt(fconf.count, 10) || 0;
            likecount = parseInt(fconf.total, 10) || 0;
            pnameCutLen = 12;
            pagename = fconf.pagename;
            pnameLen = comm.string.getRealLen(pagename);
            pageuin = fconf.uin;
            fnickCutLen = 12;
            arrStr.push('<div class="interactive_focus_txt">');
            if (fcount > 0) {
                if (fcount === 1) {
                    arrStr.push('好友');
                    if (pnameLen <= 8) {
                        fnickCutLen += 4;
                    } else if (pnameLen <= 10) {
                        fnickCutLen += 2;
                    }
                } else {
                    fnickCutLen += 9 - ((Math.min(pnameLen, pnameCutLen)) + (fcount + '').length);
                }
                var user = flist[0], userlist = [];
                if (user) {
                    fnick = user.nickname;
                    fnicklen = comm.string.getRealLen(fnick);
                    fnick = snsmod._trimnickname(fnick, fnickCutLen);
                    if (opt.platform && opt.platform != 'qzone') {
                        userlist.push(fnick);
                    } else {
                        userlist.push(snsmod._wrapnickname(fnick, user.uin));
                    }
                }
                arrStr.push(userlist.join('、'));
                if (fcount > 1) {
                    arrStr.push('等' + fcount + '位好友');
                }
            } else {
                if (likecount < 1e6) {
                    pnameCutLen += 4;
                }
                arrStr.push('共有' + likecount + '人');
            }
            pagename = snsmod._trimnickname(pagename, pnameCutLen);
            arrStr.push('关注了<a href="http://user.qzone.qq.com/' + pageuin + '" target="_blank">' + pagename + '</a>');
            arrStr.push('<\/div>');
            arrStr.push('<a class="bgr2 btn_interactive_focus _js_like" onclick="GDT.likeaction(' + pageuin + ', \'' + pid + '\', \'' + odata.cl + '\',  this);return false;" href="javascript:;">关注</a><span class="c_tx3 interactive_focused_txt _js_liked" style="display: none;" id="gdtlike_' + pid + '_' + odata.cl + '">已关注</span>');
        }
        ret = {'text': arrStr.join('')};
        opt.callback && opt.callback(ret);
        return ret;
    };
    var _appcssloaded;
    ExtRenderMod._loadAppFriendCss = function(opt) {
        if (!_appcssloaded) {
            comm.css.insertCSSLink('http://' + comm.siDomain + '/open_proj/sns_icenter_interactive.css?max_age=31536000&d=20120803', opt);
            _appcssloaded = true;
        }
    };
    ExtRenderMod._getBqqExt = function(conf, pid, odata, opt) {
        opt = opt || {};
        conf = conf || {};
        var arrStr = [];
        fconf = conf.aid || {};
        arrStr.push('<a href="' + odata.orirl + '" onclick="GDT._Bqqaction(\'' + pid + '\', \'' + odata.cl + '\')" target="_blank">' + fconf.txt + '</a>');
        ret = {'text': arrStr.join('')};
        opt.callback && opt.callback(ret);
        return ret;
    };
    ExtRenderMod._Bqqaction = function(pid, cl) {
        helper.pgvOrder(cl, 'bqqclick');
    };
    ExtRenderMod.likeaction = function(uin, pid, oid, el) {
        var odata = datamanage.getOrderData(pid, oid);
        snsmod.like(uin, pid, oid, function(o) {
            if (o && (o.ret == 0 || o.ret == -20)) {
                helper.pingreq(odata.rl);
                el.style.display = 'none';
                comm.dom.get('gdtlike_' + pid + '_' + oid).style.display = 'block';
            }
        });
    };
    ExtRenderMod._like = function(uin, pid, oid, cb, fb) {
        helper.pgvOrder(oid, 'like_' + pid);
        FP.addILike(uin, function(o) {
            likeCallback(o, pid, oid);
            if (cb) {
                cb(o);
            }
        }, fb, {'scene': 7});
    };
    function likeCallback(o, pid, oid) {
        if (o && (o.ret == 0)) {
            helper.pgvOrder(oid, 'like_succ_' + pid);
            FP.showMsgbox('关注成功', 0, 2000);
        }
        if (o && (o.ret != 0) && o.msg) {
            if (o.ret == -20) {
                FP.showMsgbox('你已经关注此空间,请勿重复操作.', 0, 2000);
            } else {
                FP.showMsgbox(o.msg, 0, 2000);
            }
        }
    }
    ExtRenderMod._share = function(desc, pid, oid, onSuccess) {
        var odata = datamanage.getOrderData(pid, oid);
        if (!odata) {
            return;
        }
        desc = desc || '';
        var viewId = odata.rl;
        var tpl = '{llimit}"spaceuin":{uin},"description":"{desc}","cgi":"http://c.gdt.qq.com/share.fcg","fields":{llimit}"title":"","type":90,"url":"","viewId":"{viewId}"{rlimit},"onSuccess":{_callback},"cgiType":"FormSender"{rlimit}';
        var uin = FP.getQzoneConfig('loginUin');
        var data = {'uin': uin,'desc': desc,'viewId': viewId,'_callback': 'top._gdtShareCallback','llimit': '{','rlimit': '}'};
        var str = comm.format(tpl, data);
        var param = encodeURIComponent(str);
        pingShare(oid, pid, 'share');
        top._gdtShareCallback = function() {
            shareCallback(pid, oid, onSuccess);
        };
        FP.popupDialog('转给我的好友', {'src': 'http://' + comm.imgcacheDomain + '/qzone/app/qzshare/popup.html?params=' + param + '#platform='}, 408, 300);
    };
    function pingShare(oid, pid, key) {
        helper.pgvOrder(oid, key + '_' + pid);
        if (a.TCISD) {
            var ecode;
            ecode = (key == 'share') ? 11 : 12;
            a.TCISD.valueStat(410193, 1, ecode, {'reportRate': 1,'duration': 1});
        }
    }
    function shareCallback(pid, oid, cb) {
        pingShare(oid, pid, 'share_succ');
        if (cb) {
            cb();
        }
    }
    ExtRenderMod.getSale = function(conf, pid, odata, opt) {
        var str;
        var num = conf.aid;
        str = '<div class="hot_number">此商品最近售出<span class="number_color">' + num + '</span>件</div>';
        ret = {'text': str};
        opt.callback && opt.callback(ret);
        return ret;
    };
    GDT.likeaction = ExtRenderMod.likeaction;
    GDT._Bqqaction = ExtRenderMod._Bqqaction;
    module.exports = ExtRenderMod;
});

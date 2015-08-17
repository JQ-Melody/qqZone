
GDTDefine('gdt:mod/sns.js', function(require, exports, module) {
    var comm = require('gdt:comm/comm.js');
    var datamanage = require('gdt:comm/data.js');
    var bizconfig = require('gdt:comm/config.js');
    var SnsMod = {};
    SnsMod.like = function(uin, pid, oid, cb, fb) {
        var args = Array.prototype.slice.call(arguments);
        SnsMod.loadExtrender(function(render) {
            render._like.apply(null, args);
        });
    };
    SnsMod.share = function(desc, pid, oid, onSuccess) {
        var args = Array.prototype.slice.call(arguments);
        SnsMod.loadExtrender(function(render) {
            render._share.apply(null, args);
        });
    };
    SnsMod.getPageLike = function(conf, pid, odata, opts) {
        var args = Array.prototype.slice.call(arguments);
        SnsMod.loadExtrender(function(render) {
            render._getPageLike.apply(null, args);
        });
    };
    SnsMod.getFriendApp = function(conf, pid, odata, opts) {
        var args = Array.prototype.slice.call(arguments);
        SnsMod.loadExtrender(function(render) {
            render._getFriendApp.apply(null, args);
        });
    };
    SnsMod.getBqqExt = function(conf, pid, odata, opts) {
        var args = Array.prototype.slice.call(arguments);
        SnsMod.loadExtrender(function(render) {
            render._getBqqExt.apply(null, args);
        });
    };
    var _inList = {2016: ['getAppStr', SnsMod.getFriendApp],2017: ['getLikeStr', SnsMod.getPageLike],2019: ['getBqqStr', SnsMod.getBqqExt],2030: ['getSaleStr', SnsMod.getSale]};
    SnsMod.dealExt = function(aid, pid, oid, cb, opts) {
    };
    SnsMod._extDealFn = {};
    comm.each(_inList, function(v, k) {
        var fn = v[1];
        SnsMod._extDealFn[k] = fn;
        SnsMod[v[0]] = (function(aid, fn) {
            return function(pid, oid, opts) {
                return SnsMod._dealExt(pid, oid, aid, fn, opts);
            };
        })(k, fn);
    });
    SnsMod._dealExt = function(pid, oid, aid, fn, opts) {
        var ret = {}, oda, alist, anode;
        oda = datamanage.getOrderData(pid, oid);
        alist = oda && oda.ext && oda.ext.alist;
        anode = alist && alist[aid];
        if (anode) {
            ret = fn(anode, pid, oda, opts);
        }
        return ret;
    };
    SnsMod.loadExtrender = function(cb) {
        require.async('gdt:mod/extrender.js', function(render) {
            cb(render);
        });
    };
    SnsMod.renderExt = function(pid, oid, container, callback, opts) {
        var args = Array.prototype.slice.call(arguments);
        SnsMod.loadExtrender(function(render) {
            render._renderExt.apply(null, args);
        });
    };
    SnsMod.bindPcpushhover = function(el, posid, orderid) {
        var row = $e(el), orderdata, cfg, type = 1;
        cfg = datamanage.getPosCfgByKey(posid, bizconfig.expconf.PCPUSHTPL, orderid);
        orderdata = datamanage.getOrderData(posid, orderid);
        type = (cfg == 3 || cfg == 4) ? 2 : type;
        if (type == 1) {
            row.find('.__pcpush_direct_push').show();
            row.find('._js_pcpush_hover:not(.__pcpush_qrcode)').remove();
        } else {
            row.find('.__pcpush_direct_push').remove();
        }
        if (orderdata && orderdata.pcpush && orderdata.pcpush.canhover) {
            row.onHover(function() {
                row.find('._js_pcpush_hover').show();
            }, function() {
                row.find('._js_pcpush_hover').hide();
            });
        }
    };
    SnsMod._wrapnickname = function(nick, uin, cn) {
        cn = cn || '';
        return '<a class="' + cn + '" appnick="1" href="http://user.qzone.qq.com/' + uin + '" target="_blank">' + nick + '</a>';
    };
    SnsMod._trimnickname = function(nick, length) {
        nick = nick || '';
        nick = comm.string.restHTML(nick);
        var len = comm.string.getRealLen(nick);
        if (length && (len > length)) {
            nick = comm.string.cut(nick, length - 2, '...');
        }
        nick = comm.string.escHTML(nick);
        return nick;
    };
    module.exports = SnsMod;
});

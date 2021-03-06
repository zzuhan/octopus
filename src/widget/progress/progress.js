/**
 * @file
 * @author oupeng-fe
 * @version 1.1
 * webapp通用组件
 * progress   -   图片预览
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/dom.js
 * @require lib/event.js
 * @require widget/widget.js
 */
;(function(o, undefined) {

    "use strict";

    /**
     * @class octopus.Widget.Progress
     * @parent octopus.Widget
     * @param options {Object}
     * @param options.duration {Number} loading动画的执行时间 在调用goTo等方法时可通过传入参数改变 默认2s
     * @type {*|Function|new}
     */
    o.Widget.Progress = o.define(o.Widget, {

        /**
         * @private
         * @property value
         * @type {Number}
         * @desc 记录的节点的translate值
         */
        value: 100,

        /**
         * @private
         * @const
         * @property speed
         * @type {Number}
         * @desc 自动加载状态下的常量参数 其实与速度无关
         */
        speed: 0.49,

        /**
         * @private
         * @const
         * @property minV
         * @type {Number}
         * @desc 自动加载状态下变化量的最小值
         */
        minV: 0.60009,

        /**
         * @private
         * @property duration
         * @type {Number}
         * @desc loading动画的执行时间
         */
        duration: 2,

        /**
         * @private
         * @property timer
         * @type {Number}
         * @desc 执行的定时器
         */
        timer: null,

        /**
         * @private
         * @const
         * @property tricker
         * @type {Number}
         * @desc 自动加载状态下的浮动变量
         */
        tricker: 100.0,

        /**
         * @private
         * @property isStop
         * @type {Boolean}
         * @desc 标志位标志当前是否处于自动加载状态
         */
        isStop: true,

        /**
         * @private
         * @property trickeTimer
         * @type {Number}
         * @desc 自动加载的定时器
         */
        trickeTimer: null,

        /**
         * @private
         * @constructor
         */
        initialize: function() {
            o.Widget.prototype.initialize.apply(this, arguments);
            o.dom.addClass(this.el, "octopusui-progress");
        },

        /**
         * @private
         * @method activate
         * @desc 将没有position属性的节点改为relative
         */
        activate: function() {
            o.Widget.prototype.activate.apply(this, arguments);
            if(o.dom.getStyle(this.container, "position") == "static") {
                this.container.style.position = "relative";
            }
        },

        /**
         * @public
         * @method octopus.Widget.Progress.goTo
         * @param opvs 参数
         * @param opvs.value {Number} 设置load的位置 取值范围为0-100
         * @param opvs.duration {Number} 设置loading动画的时间 默认为2
         * @param opvs.type {String} 设置load位置是否使用动画 默认不使用 若需要使用动画 请设置为 "animation"
         * @param opvs.func {Function} 设置完的回调函数 请注意不要再回调中使用goTo、passTrick等方法 否则回造成自引用
         * @desc 设置load行为
         */
        goTo: function(opvs) {
            if(!this.isStop) {
                this.stop();
            }
            this._goTo(opvs);
        },

        /**
         * @private
         * @method _goTo
         * @param opvs {Object}
         */
        _goTo: function(opvs) {
            var v = Math.max(Math.min(100 - Math.abs(opvs.value), 100), 0),
                d = opvs.duration || this.duration,
                t = opvs.type || "auto",
                value = "translate3d(-" + String(v) + "%, 0, 0)",
                func = opvs.func;
            if(t == "auto") {
                this.setStyle(value);
                func && func();
            } else {
                var t = " " + d + "s linear",
                    that = this;
                this.el.style.webkitTransition = "-webkit-transform" + t;
                this.el.style.transition = "transform" + t;
                window.setTimeout(function() {
                    that.setStyle(value);
                    if(that.timer) {
                        window.clearTimeout(that.timer);
                        that.timer = null;
                    }
                    var self = that;
                    that.timer = window.setTimeout(function() {
                        self.el.style.webkitTransition = "";
                        self.el.style.transition = "";
                        func && func();
                    }, d * 1000 + 150);
                }, 100);    //当页面动画非常多的时候 这个时候给一个0ms的延时对于控件自身的动画显得杯水车薪
            }
            this.setV(v);
        },

        /**
         * @private
         * @method setStyle
         * @param v {String}
         * @desc 设置el的transform值
         */
        setStyle: function(v) {
            o.dom.setStyles(this.el, {
                "-webkit-transform": v,
                "transform": v
            });
        },

        /**
         * @public
         * @method octopus.Widget.Progress.stop
         * @desc 停止自动加载方法
         */
        stop: function() {
            if(this.trickeTimer) {
                window.clearTimeout(this.trickeTimer);
                this.trickeTimer = null;
            }
        },

        /**
         * @private
         * @method setV
         * @param v
         * @desc 设置当前的value值
         */
        setV: function(v) {
            if(this.value == v) return;
            this.value = v;
        },

        /**
         * @public
         * @method octopus.Widget.Progress.passAll
         * @desc 用偷懒的方法无限接近于加载成功
         */
        passTrick: function() {
            this.isStop = false;
            if(!arguments[0]) {
                this.tricker = 100 * this.speed;
                this.value = 100;
                this.el.style.webkitTransition = "";
                this.el.style.transition = "";
                this.setStyle("translate3d(-100%, 0, 0)");
                var that = this;
                window.setTimeout(function() {
                    that._goTo({
                        value: that.tricker,
                        type: "animation"
                    });
                }, 0);
            }
            this.stop();
            this.trickeTimer = window.setTimeout(o.util.bind(this.executeTricker, this), this.duration * 1000 + 100);
        },

        /**
         * @private
         * @method executeTricker
         * @desc 具体执行自动加载的方法
         */
        executeTricker: function() {
            this.tricker = this.tricker * this.speed;
            if(this.tricker < this.minV) {
                this.isStop = true;
                this.stop();
                return;
            }
            this._goTo({
                value: 100 - this.value + this.tricker,
                type: "animation"
            });
            this.passTrick(true);
        },

        CLASS_NAME: "octopus.Widget.Progress"
    });

})(octopus);

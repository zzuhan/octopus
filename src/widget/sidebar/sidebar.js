/**
 * @file
 * @author oupeng-fe
 * @version 1.1
 * webapp通用组件
 * sidebar   -   四侧隐藏的面板
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/dom.js
 * @require lib/event.js
 * @require lib/tween.js
 * @require lib/animate.js
 * @require widget/widget.js
 */
;(function(o, undefined) {

    "use strict";

    /**
     * @class octopus.Widget.Sidebar
     * @parent octopus.Widget
     * @desc 用于在指定容器四侧的面板
     * @param options {Object} 传入的参数
     * @param options.type {String} 默认的展现的类型 可选值包括 cover | push | reveal | rotate 其中rotate在低版本系统上work的不好
     * @param options.nextDom {DOMElement} 与之并列的节点 即可视区域显示的区域节点 如果类型为reveal则此参数不可空缺
     * @param options.position {String} 控件贴边的位置 可选值包括 left | right | top | bottom 默认为left 一经设置不可更改
     * @param options.width {Number} 控件的宽度 可传数字 单位像素 亦可传字符串形式的可替代宽度的表达 如100% 默认为100%
     * @param options.height {Number} 同高度
     * @param options.innerHTML {String} 可以传入的控件的html内容
     */
    o.Widget.Sidebar = o.define(o.Widget, {

        /**
         * @private
         * @property type
         * @type {String}
         * @desc 展现的类型
         */
        type: "cover",

        /**
         * @private
         * @property nextDom
         * @type {DOMElement}
         * @desc 某些类型需要传入并列显示的节点
         */
        nextDom: null,

        /**
         * @private
         * @property position
         * @type {String}
         * @desc 控件贴边的方位
         */
        position: "left",

        /**
         * @private
         * @property width
         * @type {String}
         * @desc 容器的宽度 不建议修改
         */
        width: "100%",

        /**
         * @private
         * @property height
         * @type {String}
         * @desc 容器的高度
         */
        height: "100%",

        /**
         * @private
         * @property styles
         * @type {Object}
         * @desc 用来存取一些初始样式的键值对
         */
        styles: null,

        /**
         * @private
         * @property innerHTML
         * @type {String}
         * @desc 控件的内容 当控件构成简单时可以直接传入 复杂时建议继承此控件开发
         */
        innerHTML: null,

        /**
         * @private
         * @property isResize
         * @type {Boolean}
         * @desc 标志位 用以resize
         */
        isResize: false,

        /**
         * @private
         * @property locked
         * @type {Boolean}
         */
        locked: false,

        /**
         * @private
         * @constructor
         */
        initialize: function() {
            o.Widget.prototype.initialize.apply(this, arguments);
            if(this.innerHTML) {
                this.el.innerHTML = this.innerHTML;
            }
            this.styles = {
                cssText: {
                    left: "left: 0px; top: 0px;",
                    right: "right: 0px; top: 0px;",
                    top: "left: 0px; top: 0px;",
                    bottom: "left: 0px; bottom: 0px;"
                },
                transform: {
                    left: "translate3d(-100%, 0, 0)",
                    right: "translate3d(100%, 0, 0)",
                    top: "translate3d(0, -100%, 0)",
                    bottom: "translate3d(0, 100%, 0)"
                }
            };
            if(o.util.isNumeric(this.width)) {
                this.width += "px";
            }
            if(o.util.isNumeric(this.height)) {
                this.height += "px";
            }
            this.el.style.cssText = this.styles.cssText[this.position] + " width: " + this.width + "; height: " + this.height +
                "; -webkit-transform-style: preserve-3d; transform-style: preserve-3d;";
            o.dom.addClass(this.el, "octopusui-sidebar");
            var that = this;
            o.event.on(window, "ortchange", function() {
                if(!that.isResize) {
                    o.util.requestAnimation(o.util.bind(that.checkSize, that));
                    that.isResize = true;
                }
            }, false);

        },

        /**
         * @private
         * @method checkSize
         * @desc 用以监听resize事件的处理
         */
        checkSize: function() {
            this.calcSelfSize();
            this.isResize = false;
        },

        /**
         * @public
         * @method octopus.Widget.Sidebar.show
         * @param type {String} 可以选择何种模式让控件显示出来
         */
        show: function(type) {
            if(this.isShow) return;
            if(this.type != type) {
                this.type = type;
                this.serialCSS();
            }
            this.el.style.display = "block";
            this.calcSelfSize();
            this["animate" + this.type.charAt(0).toUpperCase() + this.type.substring(1)](true);
        },

        /**
         * @public
         * @method octopus.Widget.Sidebar.hidden
         * @desc 隐藏控件
         */
        hidden: function() {
            if(!this.isShow)    return;
            this["animate" + this.type.charAt(0).toUpperCase() + this.type.substring(1)](false);
        },


        /**
         * @private
         * @method animate
         * @desc 几个简单动画的共有部分
         * @param svs {String} 动画的开始值
         * @param evs {String} 动画的结束值
         * @param t {Boolean} 标志着此动画是显示/隐藏时调用
         * @param el {DOMElement} 执行动画的节点
         * @returns {o.Tween}
         */
        animate: function(svs, evs, t, el) {
            var that = this;
            var pn = this.container.parentNode || this.container;
            pn.style.overflow = "hidden";
            this.locked = true;
            return new o.Tween(el, ["-webkit-transform"], [svs], [evs], .3, function() {
                that.isShow = t;
                if(t && (that.position == "right" || that.position == "bottom")) {
                    var dom = o.dom.createDom("div");
                    that.container.appendChild(dom);
                    var me = that;
                    setTimeout(function() {
                        me.container.removeChild(dom);
                        dom = null;
                    }, 0);
                } else if(!t) {
                    that.el.style.display = "none";
                }
                pn.style.overflow = "";
                that.locked = false;
            });
        },

        /**
         * @private
         * @method animateRotate
         * @param t
         */
        animateRotate: function(t) {
            var svoptions = {
                    "left": "translate3d(-100%, 0, 0) rotateY(-90deg)",
                    "right": "translate3d(100%, 0, 0) rotateY(90deg)",
                    "top": "translate3d(0, -100%, 0) rotateX(120deg)",
                    "bottom": "translate3d(0, 100%, 0) rotateX(-120deg)"
                },
                evs = "translate3d(0, 0, 0) rotateY(0deg) rotateX(0deg)",
                svs = t ? svoptions[this.position] : evs;
            if(!t) {
                evs = svoptions[this.position];
            }
            var or = {
                left: "100% 50%",
                right: "0% 50%",
                top: "50% 100%",
                bottom: "50% 0%"
            }
            this.el.style.webkitTransformOrigin = or[this.position];
            this.animateReveal(t);
            this.animate(svs, evs, t, this.el);
        },

        /**
         * @private
         * @method animateCover
         * @desc type为cover时的动画
         * @param t {Boolean} 标志位 标志显示或隐藏
         */
        animateCover: function(t) {
            var svoptions = {
                    "left": "translate3d(-100%, 0, 0)",
                    "right": "translate3d(100%, 0, 0)",
                    "top": "translate3d(0, -100%, 0)",
                    "bottom": "translate3d(0, 100%, 0)"
                },
                evs = "translate3d(0, 0, 0)",
                svs = t ? svoptions[this.position] : evs;
            if(!t) {
                evs = svoptions[this.position];
            }
            this.animate(svs, evs, t, this.el);
        },

        /**
         * @private
         * @method animatePush
         * @param t
         */
        animatePush: function(t) {
            var svoptions = {
                    "left": "translate3d(" + this.width + ", 0, 0)",
                    "right": "translate3d(-" + this.width + ", 0, 0)",
                    "top": "translate3d(0, " + this.height + ", 0)",
                    "bottom": "translate3d(0, -" + this.height + ", 0)"
                },
                svs = "translate3d(0, 0, 0)",
                evs = t ? svoptions[this.position] : svs;
            if(!t) {
                svs = svoptions[this.position];
            }
            this.animate(svs, evs, t, this.container);
        },

        /**
         * @private
         * @method animateReveal
         * @param t
         */
        animateReveal: function(t) {
            this.nextDom = o.g(this.nextDom);
            if(!this.nextDom)   throw new Error("require nextDom to reveal!");
            var svoptions = {
                    "left": "translate3d(" + this.width + ", 0, 0)",
                    "right": "translate3d(-" + this.width + ", 0, 0)",
                    "top": "translate3d(0, " + this.height + ", 0)",
                    "bottom": "translate3d(0, -" + this.height + ", 0)"
                },
                svs = "translate3d(0, 0, 0)",
                evs = t ? svoptions[this.position] : svs;
            if(!t) {
                svs = svoptions[this.position];
            }
            this.animate(svs, evs, t, this.nextDom);
        },

        /**
         * @private
         * @method serialCSS
         * @desc 用来切换不同模式下节点应包括的样式
         */
        serialCSS: function() {
            if(this.type == "cover" || this.type == "push") {
                this.el.style.webkitTransform = this.styles.transform[this.position];
                this.el.style.zIndex = 9999;
            } else {
                this.el.style.webkitTransform = "";
                this.el.style.zIndex = -1;
            }
        },

        /**
         * @private
         * @method activate
         * @desc 复写了父类的激活方法
         */
        activate: function(type) {
            o.Widget.prototype.activate.apply(this, arguments);
            var pos = o.dom.getStyle(this.container, "position");
            if(pos == "static") {
                this.container.style.position = "relative";
            }
            this.type = type || this.type;
            this.serialCSS();
        },

        /**
         * @public
         * @method octopus.Widget.Sidebar.render
         * @desc 复写了父类的render方法
         */
        render: function() {
            var len = arguments.length;
            if(len == 0) {
                this.container = this.container || document.body;
            } else {
                this.container = o.g(arguments[0]);
            }
            o.dom.addClass(this.container, "octopusui-sidebar-container");
            if(this.container.appendChild === undefined) {
                throw new Error("Illegal Dom!")
            } else {
                if(!!arguments[1]) {
                    var clonenode = o.dom.cloneNode(this.container, true);
                    this.appendChild(this.el, clonenode);
                    this.container.parentNode.replaceChild(clonenode, this.container);
                    this.container = clonenode;
                } else {
                    this.appendChild(this.el, this.container);
                }
            }
            if(!this.active) {
                this.activate(arguments[2]);
            }
            if(!this.isShow) {
                this.show(arguments[2]);
            }
        },

        /**
         * @private
         * @method calcSelfSize
         * @desc 为那些没有个具体数值宽高的控件做某些动画时获取具体的数值
         */
        calcSelfSize: function() {
            var pos = this.position,
                pro = (pos == "left" || pos == "right") ? "width" : "height";
            this[pro] = o.dom["get" + pro.charAt(0).toLocaleUpperCase() + pro.substring(1)](this.el) + "px";
        },

        CLASS_NAME: "octopus.Widget.Sidebar"
    });

})(octopus);
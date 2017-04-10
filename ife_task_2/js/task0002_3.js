function Slider(sliderID, order, isLoop, duration) {
    //参数
    this.slider = document.getElementById(sliderID) ; //轮播节点
    this.order = order; //顺序：正序true|1 还是反序false|0
    this.duration = duration; //间隔动画时长
    this.isLoop = isLoop; //是否循环 true | false
    this.isLoopEnd = false; //不循环的轮播单次播放是否结束

    // 内部变量
    this.animation = null; //动画函数
    this.timer = null; //定时器
    this.index = 0; //运动的当前item
    this.lastIndex = 0; //记录上一个，初始化为0也无所谓

    this.sliderWidth = parseFloat(getStyle(this.slider, 'width'));
    this.sliderHeight = parseFloat(getStyle(this.slider, 'height'));

    // 下面两个分别是轮播的列表和指示器
    this.sliderList = this.slider.getElementsByTagName('ul')[0];
    this.list = this.sliderList.getElementsByTagName('li'); //ie下直接通过children获取的会有注释节点

    this.sliderIndicator = this.installSliderIndicator();
    this.indicator = this.sliderIndicator.children;
    
    this.switchNext = this.switchPrev = null;
    this.installSwitcher();

    this.initEvent();
}

Slider.prototype = {
    consotructor: Slider,
    // 设置参数函数
    setOrder: function(order) {
        this.order = order;
    },
    setIsLoop: function(isLoop) {
        this.isLoop = isLoop;
    },
    setDuration: function(duration) {
        this.duration = duration;
    },

    initEvent: function() {
        // 为事件处理函数保存临时this引用
        var _this = this;

        // 鼠标进入和离开轮播画面的时候要停止和切换动画事件
        addEvent(this.sliderList, 'mouseenter', function(e) {
            if (!_this.isLoopEnd) {
                //mouseenter的定时器和mouseleave中的定时器会相互扼制
                clearTimeout(this.timer_leave);
                // 该定时器是为了防止鼠标快速经过轮播区域导致无谓的停止
                this.timer_enter = setTimeout(function() {
                    _this.stop();
                }, 500);
            }
        });
        addEvent(this.sliderList, 'mouseleave', function(e) {
            if (!_this.isLoopEnd) {
                clearTimeout(this.timer_enter);
                // 该定时器是为了给鼠标离开留下一点缓冲时间，而不是马上切换，也为了防止鼠标再次进入
                this.timer_leave = setTimeout(function() {
                    _this.updateIndex();
                    _this.start();
                }, _this.duration);
            }
        });

        // mouseover的事件交互是鼠标移入，轮播停止，并且切换为当前鼠标移入的点对应的图片
        // 用轮播事件间隔开定时器，时间到达后恢复原轮播
        addEvent(this.sliderIndicator, 'mouseover', function(e) {
            var e = e || window.event,
                target = e.target || e.srcElement;
            if (target.nodeName !== 'LI') { return; }

            _this.stop(); //停止正在进行的轮播
            clearTimeout(this.timer); //停止轮播指示器上的定时器

            // 鼠标移入的动作
            var curr = +target.getAttribute('data-index');
            _this.updateIndex(curr, _this.index);
            _this.start();
        });

        addEvent(this.switchPrev, 'click', function(e) {
            _this.stop();
            _this.updateIndex(_this.index-1);
            _this.start();
        });
        addEvent(this.switchNext, 'click', function(e) {
            _this.stop();
            _this.updateIndex(_this.index+1);
            _this.start();
        });
        addEvent(this.slider, 'contextmenu', function(e) {
            var e = e || window.event;
            preventDefault(e);
        });
    },
    
    //======== 动画函数 ========
    // 淡入淡出
    fadeIn: function(range) {
        range = range || {from: 60, to: 100};
        var indexLi = this.list[this.index], 
            lastIndexLi = this.list[this.lastIndex];

        lastIndexLi.style.visibility = 'hidden';
        indexLi.style.visibility = 'visible';

        indexLi.style['opacity'] = range.from/100; //opacity设置值是0~1
        indexLi.style['filter']  = 'alpha(opacity='+range.from+')'; //for ie
        
        startMove(indexLi, {'opacity': range.to});
    },

    leftToRight: function() {
        var indexLi = this.list[this.index],
            lastIndexLi = this.list[this.lastIndex];

        if (this.index > this.lastIndex) { //大于和小于的出现顺序不一样
            // 移出上一个
            lastIndexLi.style.left = 0;
            startMove(lastIndexLi, {'left': -this.sliderWidth}, function() {
                lastIndexLi.style.visibility = 'hidden';
                lastIndexLi.style.left = 0;
            });

            // 移入下一个
            indexLi.style.left = this.sliderWidth+'px';
            indexLi.style.visibility = 'visible';
            startMove(indexLi, {'left': 0});

            // 注意 上面startMove函数虽然调用两次，但是是同步进行的(近似)

        } else if (this.index < this.lastIndex) {
            lastIndexLi.style.left = 0;
            startMove(lastIndexLi, {'left': this.sliderWidth}, function() {
                lastIndexLi.style.visibility = 'hidden';
                lastIndexLi.style.left = 0;
            });

            indexLi.style.left = -this.sliderWidth+'px';
            indexLi.style.visibility = 'visible';
            startMove(indexLi, {'left': 0});
        }
    },

    topToBottom: function() {
        var indexLi = this.list[this.index],
            lastIndexLi = this.list[this.lastIndex];

        if (this.index > this.lastIndex) { //大于和小于的出现顺序不一样
            // 移出上一个
            lastIndexLi.style.top = 0;
            startMove(lastIndexLi, {'top': -this.sliderHeight}, function() {
                lastIndexLi.style.visibility = 'hidden';
                lastIndexLi.style.top = 0;
            });

            // 移入下一个
            indexLi.style.top = this.sliderHeight+'px';
            indexLi.style.visibility = 'visible';
            startMove(indexLi, {'top': 0});

            // 注意 上面startMove函数虽然调用两次，但是是同步进行的(近似)

        } else if (this.index < this.lastIndex) {
            lastIndexLi.style.top = 0;
            startMove(lastIndexLi, {'top': this.sliderHeight}, function() {
                lastIndexLi.style.visibility = 'hidden';
                lastIndexLi.style.top = 0;
            });

            indexLi.style.top = -this.sliderHeight+'px';
            indexLi.style.visibility = 'visible';
            startMove(indexLi, {'top': 0});
        } 
    },

    start: function(animation) {
        animation = animation || this.animation || 'fadeIn';
        this.animation = animation;

        // 清除定时器
        this.stop();
        this.toggleIndicator();
        this[animation]();
        // console.log(Date.now()/1000);
        
        // 如果是非循环轮播且轮播已经结束了才会为真，此时应该退出
        if (this.isLoopEnd) { return; }
        
        // 一次运动结束，设置下一个定时器
        var _this = this;
        this.timer = setTimeout(function() {
            // important！因为这些值在对象内是全局有效的，如果还没等轮播结束就修改参数，会影响事件
            _this.updateIndex();

            // 如果不循环，并且在index为0时，就修改标识
            // 注意，不管正序还是逆序(order=true|false)的情况都是检测0
            if (!_this.isLoop && _this.index === 0) {
                _this.isLoopEnd = true;
                
                //NOTE：设置了标记后并不直接退出，而是继续执行start，使其start到第一个再退出
            }

            // 不管单轮循环是否结束都会执行start，执行时会检查单轮循环是否结束
            _this.start();

        }, this.duration);
    },

    stop: function() {
        clearTimeout(this.timer);
    },

     // 反转轮播指示器的样式
    toggleIndicator: function(index, lastIndex) {
        removeClass(this.indicator[!isNaN(lastIndex) ? lastIndex : this.lastIndex], 'active');
        addClass(this.indicator[!isNaN(index) ? index : this.index], 'active');
    },

    updateIndex: function(index, lastIndex) {
        if (!isNaN(index)) { //如果传入了index参数
            // 并且还传入了lastIndex参数，否则就用当前index更新
            this.lastIndex = !isNaN(lastIndex) ? lastIndex : this.index;
            this.index = index; //无论如何都更新index
        } else { //默认递增或者递减
            this.lastIndex = this.index;
            this.index += this.order ? +1 : -1;
        }
        this.index = (this.index  + this.list.length) % this.list.length;
        // console.log(this.index);
    },

    /*
     parent是父元素，创建的列表最后会添加到它最后
     len是列表元素的个数
     */
    installSliderIndicator: function(className) {

        var liItem, i, len,
            ul = document.createElement('ul');
        for (i = 0, len = this.list.length; i < len; i++) {
            liItem = document.createElement('li');
            liItem.setAttribute('data-index', i);
            ul.appendChild(liItem);
        }

        var sliderIndicatorWrapper = document.createElement('div');
        sliderIndicatorWrapper.className = className || 'slider-indicator';
        sliderIndicatorWrapper.appendChild(ul);
        this.slider.appendChild(sliderIndicatorWrapper);

        return ul; //返回给对象使用
    },

    // 上下一个切换按钮
    installSwitcher: function() {
        var a = document.createElement('a');
        a.className = 'switch prev';
        a.title = '上一张';
        a.href = 'javascript:';
        a.innerHTML = '&lt;';
        this.switchPrev = a;
        a = null;

        a = document.createElement('a');
        a.className = 'switch next';
        a.title = '下一张';
        a.href = 'javascript:';
        a.innerHTML = '&gt;';
        this.switchNext = a;
        a = null;

        this.slider.appendChild(this.switchPrev);
        this.slider.appendChild(this.switchNext);
    }
} //Slider Prototype
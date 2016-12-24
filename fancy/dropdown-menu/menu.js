window.onload = function () {

    // 菜单2
    var nav2 = document.getElementById('nav-2');
    nav2._active = [];
    // nav2.onclick = function (e) {
    //     var e = e || window.event,
    //         target = e.target || e.srcElement;
    //     if (target.nodeName === 'A') {
    //         target = target.parentNode;
    //     } //ensure target is li element

    //     // 清理已展开菜单
    //     var i, 
    //         last = null;
    //     for (i = this._active.length-1; i >= 0; i--) {
    //         last = this._active[i];

    //         // 对比当前激活菜单项和上一次激活的菜单项之间的关系
    //         // 是自己或父子就退出循环
    //         if (last === target || last === target.parentNode.parentNode) {
    //             break;
    //         }
    //         //兄弟关系 和 子祖关系或者其他关系按照如下处理
    //         last._statu = null; //收起状态 隐藏 缩小间隔
    //         startMove(last.children[1], {opacity: 0, left: last.children[1]._width});
    //         startMove(last, {marginBottom: 0});
    //     }
    //     this._active.length = i+1; //always

    //     var menu = target.children[1];
    //     if (!menu) { return; }
    //     menu._height = menu._height ? menu._height : parseFloat(getStyle(menu, 'height'));
    //     menu._width  = menu._width ? menu._width : parseFloat(getStyle(menu, 'width'));

    //     var i, curr,
    //         sum = 0;

    //     if (!target._statu) { //还没有展开则展开使其激活
    //         this._active.push(target);
    //         target._statu = 'active'; //只要不为空就行
    //         setOpacity(menu, 'opacity', 0);
    //         startMove(menu, {left: 0, opacity: 100});

    //         for (i = this._active.length-1; i >= 0; i--) {
    //             curr = this._active[i];
    //             sum += curr.children[1]._height;

    //             startMove(curr, {marginBottom: sum});
    //         }
           
    //     } else { //已经展开了，现在需要隐藏
    //         target._statu = null;
    //         startMove(menu, {left: menu._width, opacity: 0});
            
    //         for (i = this._active.length-1; i >= 0; i--) {
    //             // 这里关键思路在于，在不知道总高度的情况下设置marginBottom，不能用层层减法的思路来做
    //             // 每一个菜单项的marginBottom都 = 已经展开的子菜单项的高度 + 子菜单项的marginBottom
                
    //             curr = this._active[i];
    //             startMove(curr, {marginBottom: sum});
    //             // 顺序！！！
    //             sum += curr.parentNode._height ? curr.parentNode._height : 0; 
    //         }
    //         this._active.length--;
    //     }        
    // }

    // 菜单3的效果
    var nav3 = document.getElementById('nav-3');
    if (!nav3) { 
        return;
    }
    nav3._activeMenus = []; //保存激活菜单

    nav3.onmouseover = function (e) {
        var e = e || window.event,
            target = e.target || e.srcElement;
        if (target.nodeName === 'A' && target.parentNode.nodeName === 'LI') {
            target = target.parentNode;
        }
        if (target.nodeName !== 'LI') {
            return;
        }
        var activeMenus = nav3._activeMenus,
            lastMenu = activeMenus[activeMenus.length-1];
        if (lastMenu) {
            //如果是子->父则不需要处理
            if (lastMenu.parentNode === target) {
                return ;
            }

            //通过查看当前菜单处于历史访问的位置，隐藏当前才菜单位置后的所有菜单
            var pos = activeMenus.indexOf(target.parentNode); 
            
            //位置修正，没找到当前目标菜单，则全部隐藏起来，否则要隐藏到当前目标菜单位置之后的菜单
            if (pos === -1) {
                pos = 0;
            } else { //注意是删除pos位置之后的，所以不包括pos
                pos += 1;
            }
            // 重置并删除pos位置之后的菜单
            resetAfterPosMenu(activeMenus, pos);
        }
        
        var menu = target.children[1]; // 获取子菜单，没有则退出
        if (!menu) {
            return; 
        }
        activeMenus.push(menu); //保存起来

        menu._height = menu._height || parseFloat(getStyle(menu, 'height')); //获取menu高
        setJsonStyle(target.parentNode, {overflow: 'visible'}); //当前超出当前菜单的子菜单可见
        setJsonStyle(menu, {display: 'block', overflow: 'hidden', height: 0}); //重置需要展示的菜单样式
        
        // 子菜单动画显示
        startMove(menu, {height: menu._height});
    };
    nav3.onmouseleave = function() {
        resetAfterPosMenu(nav3._activeMenus, 0);
    }

    // 隐藏在pos位置后的菜单
    function resetAfterPosMenu(menuArr, pos, op) {
        for (var i = menuArr.length - 1; i >= pos; i--) {
            setJsonStyle(menuArr[i], {display: 'none', height: menuArr[i]._height+'px'});
        }
        //清除已隐藏菜单
        menuArr.length = pos;
    }

    // 如果会设置很多样式属性的话，这个方法就比较实用
    function setJsonStyle(element, json) {
        if (Object.prototype.toString.call(json) === '[object Object]') {
            for (item in json) {
                if (json.hasOwnProperty(item)) {
                    element.style[item] = json[item];
                }
            }
        }
    }
} //onload
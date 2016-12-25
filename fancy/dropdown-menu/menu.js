window.onload = function () {

    // 菜单2的效果
    var nav2 = document.getElementById('nav-2');
    nav2._activeMenus = [];
    nav2.onclick = function (e) {
        var target = getLiTarget(e);
        if (!target) {
            return;
        }
        var activeMenus = nav2._activeMenus,
            lastMenu = activeMenus[activeMenus.length-1];
        if (lastMenu) {
            //通过查看当前菜单处于历史访问的位置，隐藏当前才菜单位置后的所有菜单
            var pos = activeMenus.indexOf(target.parentNode); 

            //位置修正，没找到当前目标菜单，则全部隐藏起来，否则要隐藏到当前目标菜单位置之后的菜单
            pos = pos < 0 ? 0 : pos+1;
            lastMenu = activeMenus[pos];

            setAfterPosMenu(activeMenus, pos, function (currMenu) {
                setJsonStyle(currMenu, {left: currMenu._width+'px'});
                startMove(currMenu.parentNode, {marginBottom: 0});
            });

            // 这里要判断lastMenu和target的关系，父子关系需要调整剩余父菜单的margin，然后退出
            // lastMenu && lastMenu.parentNode === target
            // 目前放在下面判断减少重复代码
        }

        // 点击的不是上一个已经展开过的菜单父节点，就要保存并展开菜单项
        if (!(lastMenu && lastMenu.parentNode === target)) {
            var menu = target.children[1];
            if (!menu) {
                return;
            }
            activeMenus.push(menu);

            // 保存宽高
            menu._height = menu._height || parseFloat(getStyle(menu, 'height'));
            menu._width  = menu._width  || parseFloat(getStyle(menu, 'width'));

            // 展开菜单的一些动画
            setJsonStyle(menu, {opacity: 0});
            startMove(menu, {left: 0, opacity: 100});
        }

        // 不管是展开菜单还是收起了菜单，都要重新调整所有保存的父菜单的margin距离
        var mgBtSum = 0;
        for (var i = activeMenus.length - 1; i >= 0; i--) {
            mgBtSum += activeMenus[i]._height;
            startMove(activeMenus[i].parentNode, {marginBottom: mgBtSum});
        }
    }

    // 菜单3的效果
    var nav3 = document.getElementById('nav-3');
    nav3._activeMenus = []; //保存激活菜单
    nav3.onmouseover = function (e) {
        var target = getLiTarget(e);
        if (!target) {
            return ;
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
            pos = pos < 0 ? 0 : pos+1;

            // 重置并删除pos位置之后的菜单
            setAfterPosMenu(activeMenus, pos, function(currMenu) {
                setJsonStyle(currMenu, {display: 'none'});
            });
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
        setAfterPosMenu(nav3._activeMenus, 0, function(currMenu) {
            setJsonStyle(currMenu, {display: 'none'});
        });
    }


    // 隐藏在pos位置后的菜单 并清除已隐藏菜单
    function setAfterPosMenu(menuArr, pos, callback) {
        for (var i = menuArr.length - 1; i >= pos; i--) {
            callback(menuArr[i], i, menuArr);
        }
        //清除已隐藏菜单
        menuArr.length = pos;
    }

    // 获取修正后的菜单项
    function getLiTarget(event) {
        var e = event || window.event,
            target = e.target || e.srcElement;
        if (target.nodeName === 'A') {
            target = target.parentNode;
        }
        if (target.nodeName === 'LI') {
            return target;
        }
    }
} //onload
var todo = (function (store, tpl) {
    'use strict';

    // Category 类
    function Category(pid, level, title) {
        this.addTime = Date.now();
        this.cid = 'cid_' + this.addTime;
        this.pid =  pid || null;
        this.level = level || 0; // 记录目录层级
        this.title = title || '';
        this.childCatList = [];
        this.childTodoList = [];
    }

    // Todo 类
    function Todo(cid, title, content, expire) {
        this.addTime = Date.now();
        this.tid = 'tid_' + this.addTime;
        this.cid = cid;
        this.level = 0; // 紧急程度
        this.title = title;
        this.content = content;
        this.isFinish = false;
        this.expireTime = expire;
    }

    // 分类模块
    var CategoryModule = (function() {

        // 层级对齐距离
        var _startPadding = 0;
        var _incrPadding = 20;
        var _wrapperId = null;    // 包含分类列表的容器

        var _topKey = 'topCatId'; // 顶级分类id
        var _topCatId = store.data(_topKey); //获取顶级分类id

        if (!_topCatId) {
            // 如果还没有分类

            // 首先新建顶级分类
            var topCat = new Category(null, 0, '顶级分类');
            //将时间戳-1是为了防止程序运行太快导致默认分类和顶级分类id重复了(都是时间戳取的)
            topCat.addTime = topCat.addTime-1;
            topCat.cid = 'cid_' + topCat.addTime;

            _topCatId = topCat.cid;
            store.data(_topKey, _topCatId);

            // 再新建一个默认分类并保存
            var firstCat = new Category(_topCatId, topCat.level+1, '默认分类');
            store.data(firstCat.cid, firstCat);

            // 将默认分类添加到顶级分类中
            topCat.childCatList.push(firstCat.cid);
            store.data(_topCatId, topCat);

            topCat = null;
            firstCat = null;

        }


        // 遍历分类表
        var walkCategory = function(cid, callback) {
            var item = store.data(cid);
            if (!item) {
                return;
            }

            // 由回调函数处理或者收集数据
            callback(item);

            // 遍历子分类列表
            var childIds = item.childCatList;
            for (var i = 0, len = childIds.length; i < len; i += 1) {
                //下面这样做的缺点就是每次都要传callback，之所以不在外面包一层IIFE是为了简洁
                walkCategory(childIds[i], callback);
            }
        };

        // 获取所有子孙分类id
        var getCateListIds = function(cid) {
            var ids = [];

            walkCategory(cid, function(item) {
                ids = ids.concat(item.childCatList);
            });

            return ids;
        };

        // 遍历分类获取子todo
        var getTodoListIds = function(cid) {
            var ids = [];

            walkCategory(cid, function(item) {
                ids = ids.concat(item.childTodoList);
            });

            return ids;
        };

        var getAllTodoList = function() {
            return getTodoListIds(_topCatId);
        };

        // 模板：单条分类
        var getCategoryItemTemplate = function(cate) {
            cate.paddingLeft = _startPadding + _incrPadding*cate.level;

            return tpl('category-item-tpl', cate);
        };

        // 模板：分类列表
        var getCategoryTemplate = function(catItem) {
            if (!catItem) {
                return '';
            }

            var childIds = catItem.childCatList;

            // 顶级分类列表默认显示，而下级隐藏
            var template = (!catItem.pid) ? '<ul>' : '<ul class="hidden">';

            for (var i = 0, len = childIds.length; i < len; i += 1) {

                var currItem = store.data(childIds[i]);
                if (!currItem) {
                    continue;
                }

                // 加载模板
                template += '<li>';
                template += getCategoryItemTemplate(currItem);

                if (currItem.childCatList.length > 0) { // 如果有子分类
                    template += getCategoryTemplate(currItem); // 获取子分类列表
                }

                template += '</li>';
            }
            template += '</ul>';

            return template;
        };

        // 添加新分类项的DOM元素
        var addItemTemplate = function(parentNode, cate) {

            var itemTemplate =  '<li>' + (getCategoryItemTemplate(cate)) + '</li>';

            var child = $('ul', parentNode);
            if (child) {
                child.innerHTML += itemTemplate;
            } else {
                //用创建元素而不是innerHMTL的方式是为了阻止文档重新渲染parent下以前的元素导致引用失效
                var ul = document.createElement('ul');
                ul.innerHTML = itemTemplate;
                parentNode.appendChild(ul);
                // 老方法
                // parentNode.innerHTML += '<ul>' + itemTemplate + '</ul>';
            }
        };

        //添加分类
        var addItem = function(pid, title) {
            var parent = store.data(pid);
            var cate = new Category(pid, parent.level+1, title);
            store.data(cate.cid, cate);

            parent.childCatList.push(cate.cid);
            store.data(parent.cid, parent);

            return cate;
        };

        // 删除分类条目
        var deleteItem = function(cid) {
            store.remove(cid);
        };

        // 删除该分类以及所有子孙分类
        var deleteCategory = function(cid) {
            // 从父分类移出该分类
            var cate = store.data(cid);
            var parent = store.data(cate.pid);
            var brothers = parent.childCatList;
            brothers.splice(brothers.indexOf(cid), 1);
            store.data(parent.cid, parent);

            // 删除该分类和子孙分类
            var childIds = getCateListIds(cid);
            childIds.push(cid);
            for (var i = 0, len = childIds.length; i < len; i += 1) {
                deleteItem(childIds[i]);
            }
        };

        // 移除分类
        var removeCategory = function(cid) {
            deleteCategory(cid);
            updateAllTodoCount();
        };

        // 更新todo条数
        var updateTodoCount = function(cid, n) {
            var ele = $('.td-count', $('#' + cid));
            if (ele) {
                ele.innerHTML = '(' + (isNumber(n) ? n : store.data(cid).childTodoList.length) + ')';
            }
        };

        // 更新界面：所有todo数量
        var updateAllTodoCount = function() {
            updateTodoCount('#show-all-todo', getAllTodoList().length);
        };

        // 更新todo数量
        var updateCount = function(cid, n) {
            updateTodoCount(cid, n);
            updateAllTodoCount();
        };

        // 添加任务到分类
        var addChildTodo = function(cid, tid) {
            var cate = store.data(cid);
            var childTodo = cate.childTodoList;

            childTodo.push(tid);
            store.data(cid, cate);

            updateCount(cid, cate.childTodoList.length);
        };

        // 从分类移出任务
        var removeChildTodo = function(cid, tid) {
            var cate = store.data(cid);
            var childTodo = cate.childTodoList;

            childTodo.splice(childTodo.indexOf(tid), 1);
            store.data(cid, cate);

            updateCount(cid, cate.childTodoList.length);
        };

        var getItem = function(cid) {
            return store.data(cid);
        };

        // 查看同级分类下是否有同名
        var hasSameName = function(pid, name) {
            var childIds = store.data(pid).childCatList;

            for (var i = 0, len = childIds.length; i < len; i += 1) {
                if (store.data(childIds[i]).title === name) {
                    return true;
                }
            }
            return false;
        };

        // 获取一个有效分类名
        var getValidName = function(pid) {
            var namePrefix = '未命名分类';

            var parent = store.data(pid);
            if (!parent) {
                return namePrefix;
            }

            var tmp = '';
            var childIds = parent.childCatList;
            for (var i = 0, len = childIds.length; i < len; i += 1) {
                tmp = namePrefix + (i+1);
                if (!hasSameName(pid, tmp)) {
                    return tmp;
                }
            }
            tmp = namePrefix + (i+1);
            return tmp;
        };

        var getTopCatId = function() {
            return _topCatId;
        };

        var getWrapperId = function() {
            return _wrapperId;
        };

        return {
            init: function(wrapperId) {
                _wrapperId = wrapperId || _wrapperId;
                var wrapper = $('#' + _wrapperId);
                if (wrapper) {
                    wrapper.innerHTML = getCategoryTemplate(store.data(_topCatId));
                }
                updateAllTodoCount();
            },

            addItem: addItem,
            getItem: getItem,
            addItemTemplate: addItemTemplate,
            addChildTodo: addChildTodo,
            removeChildTodo: removeChildTodo,
            removeCategory: removeCategory,
            hasSameName: hasSameName,
            getValidName: getValidName,
            getTodoListIds: getTodoListIds,
            getAllTodoList: getAllTodoList,
            getTopCatId: getTopCatId,
            getWrapperId: getWrapperId,
        };
    })();
    // 任务模块
    var TodoModule = (function() {

        var _wrapperId = null;

        // 加载todo列表
        function getTodoList(todoIds, statu) {
            // 获取todo列表
            // 不过todo是单条数据存储的，所以要循环遍历getItem
            // 按照日期进行聚类成列表的形式
            var todoList = [];
            for (var i = 0; i < todoIds.length; i += 1) {
                var item = getItem(todoIds[i]);
                if (!item) {
                    continue;
                }
                // 过滤符合状态的
                // 不是bool值就获取全部，否则就直接对比
                if (!isBool(statu) || statu === item.isFinish) {
                    todoList.push(item);
                }
            }

            return todoList;
        }

        // 按照日期归档
        function archiveByDate(todoList) {
            var obj = {};
            for (var i = 0, len = todoList.length; i < len; i += 1) {
                var date = getFormatDate(todoList[i].expireTime);
                if (!obj[date]) {
                    obj[date] = [];
                }
                obj[date].push(todoList[i]);
            }

            return obj;
        }

        // todo 列表模板
        function getTodoListTemplate(todoIds, statu) {
            var list = getTodoList(todoIds, statu);
            if (!list || list.length <= 0) {
                return '';
            }
            list = archiveByDate(list);

            // 返回后的数据应该排序使用
            var keys = Object.keys(list);
            keys.sort(function(a, b) {
                if (a > b) {
                    return -1;
                } else if (a < b) {
                    return 1;
                } else {
                    return 0;
                }
            });

            // 创建模板
            var template = '<ul>';
            var tmp = null;
            for (var i = 0, len = keys.length; i < len; i += 1) {
                tmp = {time: keys[i], list: list[keys[i]]};
                template += tpl('todo-group-tpl', tmp);
            }
            template += '</ul>';

            return template;
        }

        // 获取任务
        function getItem(tid) {
            return store.data(tid);
        }

        // 保存任务
        function setItem(item) {
            store.data(item.tid, item);
        }

        // 新增任务
        function addItem(cid, title, content, expire) {
            var todo = new Todo(cid, title, content, expire);
            setItem(todo);
            return todo;
        }

        // 删除任务
        function deleteItem(tid) {
            store.remove(tid);
        }

        // 删除任务列表
        function deleteItemList(todoIds) {
            todoIds.forEach(function(id) {
                deleteItem(id);
            });
        }

        // 标记完成
        function toggleMark(tid) {
            var todo = getItem(tid);
            todo.isFinish = !todo.isFinish;
            setItem(todo);
        }

        var getWrapperId = function() {
            return _wrapperId;
        };

        return {
            init: function(wrapperId) {
                _wrapperId = wrapperId || _wrapperId;
            },
            reload: function(todoIds, statu) {
                var wrapper = $('#' + _wrapperId);
                if (wrapper) {
                    wrapper.innerHTML = getTodoListTemplate(todoIds, statu);
                }
            },

            getItem: getItem,
            setItem: setItem,
            addItem: addItem,
            getWrapperId: getWrapperId,
            deleteItem: deleteItem,
            deleteItemList: deleteItemList,
            toggleMark: toggleMark,
        };
    })();

    // 任务详情
    var TodoDetail = (function() {
        var _wrapperId = null;

        // 注册一个格式化函数供模板使用
        tpl.helper('dateFormat', function(time) {
            return getFormatDate(time);
        });

        var getShowTemplate = function(todo) {
            todo = todo || { title: '', expireTime: '', content: ''};

            return tpl('show-item-tpl', todo);
        };

        var getEditTemplate = function(todo) {
            todo = todo || { title: '未命名任务', expireTime: Date.now(), content: ''};

            return tpl('edit-item-tpl', todo);
        };

        var showItem = function(todo) {
            var wrapper = $('#' + _wrapperId);
            wrapper.innerHTML = getShowTemplate(todo);

            var parent = wrapper.parentNode;

            hiddenEle($('#' + 'save-btns'), parent);
            showEle($('#' + 'edit-btns', parent));
        };

        var editItem = function(todo) {
            var wrapper = $('#' + _wrapperId);
            wrapper.innerHTML = getEditTemplate(todo);

            var parent = wrapper.parentNode;
            showEle($('#' + 'save-btns'), parent);
            hiddenEle($('#' + 'edit-btns', parent));
        };

        return {
            init: function(wrapperId) {
                _wrapperId = wrapperId || _wrapperId;
            },
            showItem: showItem,
            editItem: editItem,
        };
    })();

    var _UI = {
        prompt: function(title, placeholder) {
            return window.prompt(title, placeholder);
        },
        alert: function(msg) {
            return window.alert(msg);
        },
        confirm: function(msg) {
            return window.confirm(msg);
        },
        showInfo: function(msg) {
            window.alert(msg);
        },

        need: function(name, msg, placeholder) {
            switch(name) {
                case 'add-category':
                    msg = msg || '请输入分类名称';
                    return this.prompt(msg, placeholder || '');
                case 'delete-category':
                case 'delete-todo':
                    msg = msg || '你确定删除选中项和相关数据吗？';
                    return this.confirm(msg);
                default:
                    break;
            }
        }
    };

    // Controller

    // 别名
    var _CL = CategoryModule;
    var _TL = TodoModule;
    var _TD = TodoDetail;

    var _currentCatEle  = null; // 选中的分类元素
    var _currentTodoEle = null; // 选中的todo元素
    var _currentStatuEle = null; //选中的状态元素

    var _saveAction = null; //保存行为是添加还是编辑

    // 用于手机端的翻页动画，按照先后顺序存放的页面id
    var _pages = ["#menu", "#list", "#detail"];
    var _pageIndex = 0;

    //关键事件处理函数，负责整个应用的调度
    function eventHandler(event) {
        event = getEvent(event);
        cancelBubble(event);

        var target = getEventTarget(event);
        var action = (target.dataset && target.dataset.action) || target.getAttribute('data-action');

        // 纠正目标 并 判断是否为item
        var isItem = true;
        if (hasClass(target.parentNode, 'item')) {
            target = target.parentNode;
        }
        if (!hasClass(target, 'item')) {
            isItem = false;
        }

        var msg = null;
        var cid = null;
        var todo = null;
        switch(action) {
            case 'add-category':
                // 输入分类名称
                // 检测名称有效性
                // 创建分类
                // 添加分类到分类列表
                // 添加到分类列表容器
                // 选中新添加的分类并更新数据

                var pid = _currentCatEle.id;

                if (pid === 'show-all-todo') { // 如果当前选中的是所有任务项，那就不能创建分类
                    _UI.showInfo('请先选中一个父分类！');
                    return;
                }

                if (pid === 'show-all-cat') {
                    pid = _CL.getTopCatId();
                }

                var name = _CL.getValidName(pid);
                msg = '请输入在 <' + _CL.getItem(pid).title + '> 下创建的子分类名称：';
                var isValid = true;
                do {
                    name = _UI.need(action, msg, name);
                    name = name && name.replace(/[\s]+/, ' ');

                    if (name === null) { //用户点击取消按钮后返回null
                        isValid = false;
                        break;

                    } else if (name === '') { //空白字符串
                        isValid = false;
                        msg = '注意：名称不能为空！';

                        // _UI.showInfo('分类名称不能为空！');

                    } else if (/[^\w\u4E00-\u9FA5]+/g.test(name)) { //不允许非数字字母下环线汉字
                        isValid = false;
                        msg = '注意：名称只能包含汉字、字母、数字、下划线！';
                        // _UI.showInfo('名称只能包含字母、数字、下划线');

                    } else if (_CL.hasSameName(pid, name)) {
                        isValid = false;
                        msg = '注意：该分类下已使用过相同名称！';
                        // _UI.showInfo('同分类下已经使用过相同名称！');
                    }

                } while (!isValid); // 反复尝试直到用户输入有效数据 或者取消

                if (isValid) {
                    var category = _CL.addItem(pid, name);
                    _CL.addItemTemplate(_currentCatEle.parentNode, category);

                    // 新的子分类创建后，无论父分类是否是展开状态，都要展开
                    openChildCategory(_currentCatEle);
                    // 选中新创建的子分类，使其处于激活状态
                    // selectCategory($('#' + category.cid));
                }

                break;
            case 'delete-category':
                // 确认删除
                // 删除分类
                // 删除todo列表
                // 删除dom
                cid = target.id;

                msg = '你确定删除 <'+ _CL.getItem(cid).title +'> 以及该分类下的子分类和任务吗？';
                if (!_UI.need(action, msg)) {
                    return;
                }

                var todoList = _CL.getTodoListIds(cid);
                _TL.deleteItemList(todoList); //删除分类下的任务
                _CL.removeCategory(cid); //删除分类

                var li = target.parentNode; //li
                var ul = li.parentNode; //ul
                ul.removeChild(li); //ul.removeChild
                if (cid === _currentCatEle.id) { //如果刚才选中的项被删除了，要重新选中同级下的第一个，或父元素
                    selectFirstCatItem($('li', ul.parentNode) || ul.parentNode);
                }

                break;
            case 'add-todo':
                // 显示编辑界面获取用户输入
                // 创建todo
                // 保存todo
                // 保存todo id 到该分类的childCatList列表中
                // 更新todo列表

                cid = _currentCatEle.id;
                if (cid.indexOf('cid_') < 0) {
                    _UI.showInfo('请选中分类列表中的一个分类！');
                    return;
                }
                _saveAction = action;
                _TD.editItem();

                slidePageNext(); //Mobile:翻到编辑页

                break;
            case 'edit-todo':
                // 如果正在编辑，则不操作

                if (_currentTodoEle) {
                    _saveAction = action;
                    _TD.editItem(_TL.getItem(_currentTodoEle.id));
                } else {
                    _UI.showInfo('请先选择任务列表中的一个任务！');
                }

                break;
            case 'save-edit':
                if (!_saveAction) {
                    return;
                }

                var title   = $('#' + 'todo-title').value;
                var expire  = $('#' + 'todo-expire').value;
                var content = $('#' + 'todo-content').value;

                if (!title.length || title.length > 30 ) {
                    _UI.showInfo('任务名称不能为空，也不能超过30字！');
                    return;
                }
                if (!expire.length) {
                    _UI.showInfo('过期时间不能为空！');
                    return;
                }
                if (!content.length) {
                    _UI.showInfo('任务内容不能为空！');
                    return;
                }
                title = stripTag(title);
                content = stripTag(content);
                expire = (new Date(expire)).getTime();

                // 通过行为状态判断是添加还是删除
                if (_saveAction === 'add-todo') {
                    todo = _TL.addItem(_currentCatEle.id, title, content, expire);
                    _CL.addChildTodo(todo.cid, todo.tid);

                } else if (_saveAction === 'edit-todo') {

                    todo = _TL.getItem(_currentTodoEle.id);
                    todo.title = title;
                    todo.expireTime = expire;
                    todo.content = content;
                    _TL.setItem(todo);

                }

                selectStatu(_currentStatuEle);
                selectTodo($('#' + todo.tid));
                _saveAction = null;

                break;
            case 'cancel-edit':

                //Mobile:如果正在添加任务时取消，则返回上一页
                if (_saveAction === 'add-todo') {
                    slidePagePrev();
                }

                showCurrItem();
                _saveAction = null;

                break;
            case 'delete-todo':

                if (!_UI.need(action, '你确定删除该任务吗？')) {
                    return ;
                }

                todo = _TL.getItem(target.id);
                _TL.deleteItem(todo.tid);
                _CL.removeChildTodo(todo.cid, todo.tid);

                var parent = target.parentNode;
                parent.parentNode.removeChild(parent);

                break;
            case 'mark-todo':

                _TL.toggleMark(target.id); //数据更新
                loadTodoInCurrentCat(); //重新加载列表
                //也可以dom局部更新，但不会及时刷新界面
                // toggleClass(target, 'done-item');

                break;
            case 'switch-statu':
                selectStatu(target);
                break;
            case 'act-back':
                //Mobile:客户端翻页的返回行为
                slidePagePrev();
                break;
            default:
                //选中条目
                if (!isItem) {
                    return;
                }
                // 有item class 再判断类型
                if (hasClass(target, 'item-cat')) { // 分类条目
                    selectCategory(target);
                    slidePageNext(); //Mobile:翻页
                } else if (hasClass(target, 'item-todo')) { //todo条目
                    selectTodo(target);
                    slidePageNext(); //Mobile:翻页
                } else if (target.id === 'show-all-cat') {
                    showAllCat(target);
                } else if (target.id === 'show-all-todo') {
                    showAllTodo(target);
                    slidePageNext(); //Mobile:翻页
                }

                break;
        } // end switch

    } // end handler

    // 初始化事件
    function initEvents() {
        addEvent(document.body, 'click', eventHandler);
        // 给touch事件空处理程序在ipad上能获得更流畅的体验
        addEvent(document.body, 'touchstart', function() {});
        addEvent(document.body, 'touchend', function() {});
    }

    // 翻到上一页
    function slidePagePrev() {
        // 当前页归位
        addClass($(_pages[_pageIndex]), 'page-next');
        // removeClass($(_pages[_pageIndex]), 'page-active');

        _pageIndex = (_pageIndex - 1) < 0 ? 0 : _pageIndex - 1;

        //上一页回来
        // addClass($(_pages[_pageIndex]), 'page-active');
        removeClass($(_pages[_pageIndex]), 'page-prev');

        showBack(_pageIndex);
    }

    // 翻到下一页
    function slidePageNext() {
        addClass($(_pages[_pageIndex]), 'page-prev');
        // removeClass($(_pages[_pageIndex]), 'page-active');

        _pageIndex = (_pageIndex + 1) >= _pages.length ? _pageIndex : _pageIndex + 1;

        // addClass($(_pages[_pageIndex]), 'page-active');
        removeClass($(_pages[_pageIndex]), 'page-next');

        showBack(_pageIndex);
    }

    // 根据当前页判断是否显示back按钮
    function showBack(index) {
        if (index > 0) {
            showEle($('#page-back'));
        } else {
            hiddenEle($('#page-back'));
        }
    }

    // 去除html标签
    function stripTag(str) {
        return str.replace(/<\/?([^>]+)>/g, ''); //$1
    }

    // 交换类名
    function switchClass(oldEle, newEle, className) {
        removeClass(oldEle, className);
        addClass(newEle, className);
    }
    // 交换选择类名
    function switchSelect(oldEle, newEle) {
        switchClass(oldEle, newEle, 'selected');
    }

    // 和新分类交换选择
    function switchSelectLastCat(newEle) {
        switchSelect(_currentCatEle, newEle);
        _currentCatEle = newEle || _currentCatEle;

        loadTodoInCurrentCat();
    }

    // 分类相关

    // 选中显示所有任务
    function showAllTodo(target) {
        switchSelectLastCat(target);
    }
    // 选中顶级分类
    function showAllCat(target) {
        switchSelectLastCat(target);
    }

    // 选中分类项
    function selectCategory(target) {
        var child = $('ul', target.parentNode); //展开子节点
        if (child) {
            toggleClass(child, 'hidden');
        }
        if (hasClass(target, 'icon-folder')) {
            toggleClass(target, 'folder-opened');
        }

        switchSelectLastCat(target);
    }
    // 选中分类列表中的第一项
    function selectFirstCatItem(wrapper) {
        wrapper = wrapper || $('#' + _CL.getWrapperId());
        var ele = $('.item-cat',  wrapper) || $('.item',  wrapper);
        switchSelectLastCat(ele);
    }

    // 强制展开父节点
    function openChildCategory(target) {
        if (!hasClass(target, 'item-cat')) {
            return;
        }
        var child = $('ul', target.parentNode); //展开子节点
        if (child) {
            removeClass(child, 'hidden');
            addClass(target, 'folder-opened');
        }
    }

    // todo相关

    // 和新todo交换选择
    function switchSelectLastTodo(newEle) {
        switchSelect(_currentTodoEle, newEle);
        _currentTodoEle = newEle;

        showCurrItem();
    }

    // 选中todo
    function selectTodo(target) {
        switchSelectLastTodo(target);
    }

    // 选中todo列表中的第一项
    function selectFirstTodoItem(wrapper) {
        wrapper = wrapper || $('#' + _TL.getWrapperId());
        var ele = $('.item-todo',  wrapper) || $('.item',  wrapper);
        switchSelectLastTodo(ele);
    }

    // 显示当前元素 没有则显示空
    function showCurrItem() {
        if (_currentTodoEle) {
            _TD.showItem(_TL.getItem(_currentTodoEle.id));
        } else {
            _TD.showItem();
        }
    }


    // 切换状态相关

    // 和新状态交换
    function switchSelectLastStatu(newEle) {
        switchSelect(_currentStatuEle, newEle);
        _currentStatuEle = newEle || _currentStatuEle;

        // 加载todo列表
        loadTodoInCurrentCat();
    }

    // 切换状态
    function selectStatu(target) {
        target = target || $('#statu-all');
        switchSelectLastStatu(target);
    }

    // 根据分类id和状态码来加载todo列表
    function loadTodoInCurrentCat() {
        if (_currentCatEle) {
            var todoList = [];
            switch(_currentCatEle.id) {
                case 'show-all-cat':
                    break;
                case 'show-all-todo':
                    todoList = _CL.getAllTodoList();
                    break;
                default:
                    var category = _CL.getItem(_currentCatEle.id);
                    todoList = category.childTodoList;
            }

            var statu = null;
            switch(_currentStatuEle.id) {
                case 'statu-not':
                    statu = false;
                    break;
                case 'statu-done':
                    statu = true;
                    break;
            }

            _TL.reload(todoList, statu);
            selectFirstTodoItem();
        }
    }

    // 格式化日期
    function getFormatDate(timestamp, spliter) {
        if (!timestamp) {
            return '';
        }
        spliter = spliter || '-';
        var date = new Date(timestamp);
        var y = date.getFullYear(), m = date.getMonth()+1, d = date.getDate();
        return [ y,
                 m < 10 ? '0'+m : m,
                 d < 10 ? '0'+d : d
                ].join(spliter);
    }

    function hiddenEle(ele) {
        // ele.style.display = "none";
        addClass(ele, 'hidden');
    }

    function showEle(ele) {
        // ele.style.display = "";
        removeClass(ele, 'hidden');
    }

    return {
        init: function() {
            _CL.init('category-list');
            _TL.init('todo-list');
            _TD.init('detail-wrap');
            selectStatu($('#statu-all'));
            selectFirstCatItem($('#' + 'category-list'));

            initEvents();
        }
    };
})(store, template);
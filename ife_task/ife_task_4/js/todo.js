// 'use strict';
var clog = console.log;

window.onload = function() {
    if (!window.localStorage) {
        alert('你的浏览器不支持本地存储技术');
        return;
    }
    
    // 要用单例延迟加载
    todoModule.init();
}

var STATU_FINISH = 1;
var STATU_NOT_FINISH = -1;

// Category 类
function Category(title, pid) {
    this.addTime = Date.now();
    this.cid = 'cid_' + this.addTime;
    this.pid =  pid || null;
    this.title = title;
    this.childCatList = [];
    this.childTodoList = [];
};

// Todo 类
function Todo(cid, title, content, expire) {
    this.addTime = Date.now();
    this.tid = 'tid_' + this.addTime;
    this.cid = cid;
    this.emergency = 0; // 紧急程度
    this.title = title;
    this.content = content;
    this.statu = STATU_NOT_FINISH;
    this.expireTime = expire;
}

var store = (function(db) {
    return {
        get: function(key) {
            return JSON.parse(db.getItem(key));
        },
        set: function(key, value) {
            db.setItem(key, JSON.stringify(value));
        },
        remove: function(key) {
            db.removeItem(key);
        }
    };
})(window.localStorage);

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
    addClass(ele, 'hidden');
}

function showEle(ele) {
    removeClass(ele, 'hidden');
}

var CategoryListModule = (function() {
    var _topCatId = 'cid_0000000000001'; // 顶级分类id
    // var _defCatId = 'cid_0000000000002'; // default默认分类id，不能删除，不能增加子分类，我没做是觉得这个需求不合理
    var _storeKey = 'category_list';     // 本地存储的key

    var _wrapperId = null;    // 包含分类列表的容器
    var _sourceList = null;   // 获取数据源
    
    var _startPadding = 20; // 层级对齐距离
    var _incrPadding = 20;

    var getSource = function() {
        // return loadCategory();
        return store.get(_storeKey);
    };
    var resetSource = function(list) {
        list = list || _sourceList;
        if (list) {
            store.set(_storeKey, list);
        }
    }

    // 模板：分类列表
    var getCategoryTemplate = function(catItem, startPadding) { // 参数是一个分类元素
        // 如果catItem未定义则使用顶级分类，尤其是第一次调用
        startPadding = startPadding || _startPadding;
        catItem = catItem || _sourceList && _sourceList[_topCatId];
        if (!catItem) {
            return '';
        }
        
        var childIds = catItem.childCatList;
        
        // 顶级分类列表默认显示，而下级隐藏
        var template = (!catItem.pid) ? '<ul>' : '<ul class="hidden">';

        for (var i = 0, len = childIds.length; i < len; i++) {

            var currItem = _sourceList[childIds[i]];
            if (!currItem) {
                continue;
            }
            
            // 加载模板
            template += '<li>';
            template += getCategoryItemTemplate(currItem, startPadding);

            if (currItem.childCatList.length > 0) { // 如果有子分类
                template += arguments.callee(currItem, startPadding + _incrPadding); // 获取子分类列表
            }

            template += '</li>';
        }
        template += '</ul>';

        return template;
    };

    // 模板：单条分类
    var getCategoryItemTemplate = function(catItem, startPadding) {
        return  ''
                + '<a id="' + catItem.cid + '"'
                // +   ' data-id="' + catItem.cid + '"'
                +   ' class="item item-cat icon-folder"'
                +   ' style="padding-left:' + startPadding + 'px">'
                +     '<span>' + catItem.title + '</span>'
                +     '<span class="td-count">(' + catItem.childTodoList.length + ')</span>'
                +     '<span class="act-del" data-action="delete-category"></span>'
                + '</a>';
    };

    var calcStartPadding = function(pid) {
        var start = _startPadding;
        while (pid && pid !== _topCatId) {
            start += _incrPadding;
            pid = _sourceList[pid].pid
        }
        return start;
    }

    var appendItemTemplate = function(parent, category) {
        var itemTemplate =    '<li>' 
                            + getCategoryItemTemplate(category, calcStartPadding(category.pid)) 
                            + '</li>';
        var child = $('ul', parent);
        if (child) {
            child.innerHTML += itemTemplate;
        } else {
            //用创建元素而不是innerHMTL的方式是为了阻止文档重新渲染parent下以前的元素导致引用失效
            var ul = document.createElement('ul');
            ul.innerHTML = itemTemplate;
            parent.appendChild(ul);
            // old way
            // parent.innerHTML += '<ul>' + itemTemplate + '</ul>';
        }
    }

    var addItem = function(category) {
        _sourceList[category.cid] = category;
        var parent = _sourceList[category.pid];
        // 由于删除元素时是使用的置空而不是直接从数组中删除的方式，所以会导致数组中空隙增多
        // 这里把非空的元素过滤出来组成新的数组
        parent.childCatList = parent.childCatList.filter(function(item) {
            return !!item;
        });

        parent.childCatList.push(category.cid);
        resetSource();
    };

    // 删除分类条目
    var deleteItem = function(category) {
        delete _sourceList[category.cid];
    };
    // 删除该分类以及所有子孙分类
    var removeCategory = function(cid) {
        // 从父分类移出该分类
        var parent = _sourceList[_sourceList[cid].pid];
        var brothers = parent.childCatList;
        brothers.splice(brothers.indexOf(cid), 1);
        
        // 删除该分类和子孙分类
        var childIds = getChildIds(cid);
        for (var i = 0, len = childIds.length; i < len; i++) {
            deleteItem(_sourceList[childIds[i]]);
        }

        // 更新
        resetSource();
    };
    // 获取所有子孙分类id
    var getChildIds = function(cid) {
        var ids = [];
        (function(cidIn) {
            var item = _sourceList[cidIn];
            if (!item) {
                return;
            }
            ids.push(cidIn);

            // 遍历子分类列表
            var childIds = item.childCatList;
            for (var i = 0, len = childIds.length; i < len; i++) {
                arguments.callee(childIds[i]);
            }
        })(cid);

        return ids;
    };
    // 遍历分类获取子todo
    var getTodoListInCat = function(cid) {
        var ids = [];
        (function(cidIn) {
            var item = _sourceList[cidIn];
            if (!item) {
                return;
            }
            ids = ids.concat(item.childTodoList);

            // 递归遍历子分类
            var childIds = item.childCatList;
            for (var i = 0, len = childIds.length; i < len; i++) {
                arguments.callee(childIds[i]); //还有子分类的的todo
            }
        })(cid);

        return ids;
    }

    var getAllTodoList = function() {
        return getTodoListInCat(_topCatId);
    }
    
    // 更新todo条数
    var updateTodoCount = function(cid, n) {
        var ele = $('.td-count', $('#' + cid));
        if (ele) {
            ele.innerHTML = '(' + (isNumber(n) ? n : _sourceList[cid].childTodoList.length) + ')';
        }
    };
    // 更新界面：所有todo数量
    var updateAllTodoCount = function() {
        updateTodoCount('#show-all-todo', getAllTodoList().length);
    };

    var updateViewCount = function(cid) {
        updateTodoCount(cid);
        updateAllTodoCount();
    };

    return {
        init: function(wrapperId) {
            // 初始化数据
            var list = store.get(_storeKey);
            if (!list) {
                list = {};
                
                //创建一个顶级分类和一个初始化的默认分类
                var topCat = new Category('顶级分类');
                var aCat = new Category('默认分类', _topCatId);
                topCat.childCatList.push(aCat.cid);

                list[_topCatId] = topCat;
                list[aCat.cid] = aCat;

                store.set(_storeKey, list);
            }
            _sourceList = list;

            _wrapperId = wrapperId || _wrapperId;
            var wrapper = $('#' + _wrapperId);
            if (wrapper) {
                wrapper.innerHTML = getCategoryTemplate();
            }
            updateAllTodoCount();
        },
        hasSameName: function(pid, name) {
            var childIds = _sourceList[pid].childCatList;
            for (var i = 0, len = childIds.length; i < len; i++) {
                if (childIds[i] && _sourceList[childIds[i]].title === name) {
                    return true;
                }
            }
            return false;
        },
        getValidName: function(pid) {
            var namePrefix = '未命名分类';
            if (!_sourceList[pid]) {
                pid = _topCatId;
            }
            var parent = _sourceList[pid];
            if (!parent) {
                return namePrefix;
            }
            
            var tmp = '';
            var childIds = parent.childCatList;
            for (var i = 0, len = childIds.length; i < len; i++) {
                tmp = namePrefix + (i+1);
                if (!this.hasSameName(pid, tmp)) {
                    return tmp;
                }
            }
            tmp = namePrefix + (i+1);
            return tmp;
        },
        
        addItem: addItem,
        removeCategory: function(cid) {
            removeCategory(cid);
            updateAllTodoCount();
        },
        addItemTemplate: appendItemTemplate,
        addChildTodo: function(cid, tid) {
            if (!_sourceList[cid].childTodoList) {
                _sourceList[cid].childTodoList = [];
            }
            _sourceList[cid].childTodoList.push(tid);
            resetSource();
            updateViewCount(cid);
        },
        removeChildTodo: function(cid, tid) {
            var childTodo = _sourceList[cid].childTodoList;
            childTodo.splice(childTodo.indexOf(tid), 1);
            resetSource();
            updateViewCount(cid);
        },

        getTodoListInCat: getTodoListInCat,
        getAllTodoList: getAllTodoList,
        getTopCatId: function() {
            return _topCatId;
        },
        getList: function() {
            return _sourceList;
        },
        getItem: function(cid) {
            return _sourceList[cid];
        },
        getWrapperId: function() {
            return _wrapperId;
        },
    };
})();

var TodoListModule = (function() {

    var _wrapperId = null;
    // var _sourceList = null;

    // 从localStorage加载todo列表
    function getTodoList(todoIds, statu) {
        // 获取todo列表
        // 不过todo是单条数据存储的，所以要循环遍历getItem
        // 按照日期进行聚类成列表的形式
        var todoList = [];
        for (var i = 0; i < todoIds.length; i++) {
            var item = getItem(todoIds[i]);
            if (!item) {
                continue;
            }
            // 过滤符合状态的
            // clog(statu, item.statu, item.title);
            if (statu && statu !== item.statu) {
                continue;
            }
            todoList.push(item);
        }

        return todoList;
    }

    function archiveByDate(todoList) {
        var obj = {};
        for (var i = 0, len = todoList.length; i < len; i++) {
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

        for (var i = 0, len = keys.length; i < len; i++) {
            template += getTodoGroupTemplate(keys[i], list[keys[i]]);
        }

        template += '</ul>';

        return template;
    }

    // 创建按照日期聚类的一组todo模板
    function getTodoGroupTemplate(time, list) {
        var template = '';

        template += '<li>';
        template += '<time>' + time + '</time>';
        template += '<ul>';
        
        for (var k = 0, len = list.length; k < len; k++) {
            template += getTodoItemTemplate(list[k]);
        }

        template += '</ul>'
        template += '</li>';

        return template;
    }

    // todo项模板
    function getTodoItemTemplate(item) {
        return  ''
                + '<li>'
                +   '<a id="' + item.tid + '" class="item item-todo '+ (item.statu === STATU_FINISH ? 'done-item' : '') +'">'
                +       '<span>'+ item.title +'</span>'
                +       '<span class="act-done" data-action="mark-todo"></span>'
                +       '<span class="act-del" data-action="delete-todo"></span>'
                +   '</a>'
                + '</li>';
    }

    function getItem(tid) {
        return store.get(tid);
    }

    function setItem(item) {
        store.set(item.tid, item);
    }

    function deleteItem(tid) {
        store.remove(tid);
    }

    return {
        getWrapperId: function() {
            return _wrapperId;
        },
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
        addItem: setItem,
        deleteItem: deleteItem,
        deleteItemList: function(todoIds) {
            todoIds.forEach(function(id) {
                deleteItem(id);
            });
        },
        toggleMark: function(tid) {
            var todo = getItem(tid);
            todo.statu = -todo.statu;
            setItem(todo);
        },
    };
})();

var todoDetail = (function() {
    var _wrapperId = null;

    var getShowTemplate = function(todo) {
        todo = todo || { title: '', expireTime: '', content: ''};

        return ''
                + '<header class="td-head">'
                +    '<label>标题：</label>'
                +    '<span class="title">' + todo.title + '</span>'
                + '</header>'
                + '<div class="td-date">'
                +    '<label>日期：</label>'
                +    '<time>'+ getFormatDate(todo.expireTime) +'</time>'
                + '</div>'
                + '<div class="td-desc">'
                +    '<label>描述：</label>'
                +    '<div class="content">'+ todo.content +'</div>'
                + '</div>';
    }

    var getEditTemplate = function(todo) {
        todo = todo || { title: '未命名任务', expireTime: Date.now(), content: ''};

        return ''
                + '<header class="td-head">'
                +    '<label for="todo-title">标题：</label>'
                +    '<input type="text" id="todo-title" maxlength="30" value="'+ todo.title +'" placeholder="请输入标题">'
                +    '<span class="warning">&lt; 30</span>'
                + '</header>'
                + '<div class="td-date">'
                +    '<label for="todo-expire">日期：</label>'
                +    '<input type="date" id="todo-expire" value="'+ getFormatDate(todo.expireTime) +'" placeholder="请输入日期如 2017-01-02">'

                +    '<span class="warning">2000-01-02</span>'
                + '</div>'
                + '<div class="td-desc">'
                +    '<label for="todo-content">描述：</label>'
                +    '<textarea id="todo-content" placeholder="请输入任务内容">'+ todo.content +'</textarea>'
                + '</div>';
    }

    return {
        init: function(wrapperId) {
            _wrapperId = wrapperId || _wrapperId;
        },
        showItem: function(todo) {
            var wrapper = $('#' + _wrapperId);
            wrapper.innerHTML = getShowTemplate(todo);

            var parent = wrapper.parentNode;

            hiddenEle($('#' + 'save-btns'), parent);
            showEle($('#' + 'edit-btns', parent));
        },
        editItem: function(todo) {
            var wrapper = $('#' + _wrapperId);
            wrapper.innerHTML = getEditTemplate(todo);

            var parent = wrapper.parentNode;
            showEle($('#' + 'save-btns'), parent);
            hiddenEle($('#' + 'edit-btns', parent));
        }
    }
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

// 用于将模块立即表达式绑定到事件
// function library(module) {
//     if (module.init) {
//         window.onload = module.init();
//     }
//     return module;
// }

// 模块模式
var todoModule = (function(_CL, _TL, _TD) {
    var _appName = 'GTD Tools';

    var _topCatId = _CL.getTopCatId();

    var _currentCatEle  = null; // 选中的分类元素
    var _currentTodoEle = null; // 选中的todo元素
    var _currentStatuEle = null; //选中的状态元素
    var _currentStatu = 0; //状态

    var _saveAction = null; //保存行为是添加还是编辑

    // 用于手机端的翻页动画
    var _pages = ["#menu", "#list", "#detail"];
    var _pageIndex = 0;
    
    // 事件处理函数
    function eventHandler(event) {
        event = getEvent(event);
        cancelBubble(event);
        // preventDefault(event);

        var target = getEventTarget(event);
        var action = target.dataset.action || target.getAttribute('data-action');

        // 纠正目标 并 判断是否为item
        var isItem = true;
        if (hasClass(target.parentNode, 'item')) {
            target = target.parentNode;
        }
        if (!hasClass(target, 'item')) {
            isItem = false;
        }

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
                    _UI.alert('请选中一个父分类！');
                    return;
                }
                
                if (pid.indexOf('cid_') < 0) { //!/^cid_\d+/.test(pid)
                    pid = _topCatId;
                }

                var name = _CL.getValidName(pid) || '';
                var msg = '请输入在 <' + _CL.getItem(pid).title + '> 下创建的子分类名称：';
                do {
                    var isValid = true;
                    name = _UI.need(action, msg, name);
                    
                    name = name && name.replace(/[\s]+/, ' ');
                    
                    if (name === null) { //用户点击取消按钮后返回null
                        isValid = false;
                        break;

                    } else if (name === '') { //空白字符串
                        isValid = false;
                        if (!_UI.confirm('名称不能为空！\n\n是否返回继续？\n')) {
                            break;
                        };
                        
                    } else if (/[\/|:*?"<>.()、,]+/g.test(name)) {
                        isValid = false;
                        if (!_UI.confirm('名称只能包含字母、数字、下划线！\n\n是否返回继续？\n')) {
                            break;
                        };

                    } else if (_CL.hasSameName(pid, name)) {
                        isValid = false;
                        if (!_UI.confirm('该分类下已经使用过该名称! \n\n是否返回继续？\n')) {
                            break;
                        }
                    }

                } while (!isValid); // 反复尝试直到用户输入有效数据 或者取消
                
                if (isValid) {
                    var category = new Category(name, pid);
                    _CL.addItem(category);
                    _CL.addItemTemplate(_currentCatEle.parentNode, category);

                    // 新的子分类创建后，无论父分类是否是展开状态，都要展开
                    openParentCategory(_currentCatEle);
                    // 选中新创建的子分类，使其处于激活状态
                    // selectCategory($('#' + category.cid));
                }

                break;
            case 'delete-category':
                // 确认删除
                // 删除分类
                // 删除todo列表
                // 删除dom
                var cid = target.id;
                
                var msg = '你确定删除 <'+ _CL.getItem(cid).title +'> 以及该分类下的子分类和任务吗？';
                if (!_UI.need(action, msg)) {
                    return;
                }

                // TODO：删除分类后，会返回所有需要删除的todo列表，也需要删除
                var todoList = _CL.getTodoListInCat(cid);
                // clog(todoList);
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

                var cid = _currentCatEle.id;
                if (cid.indexOf('cid_') < 0) {
                    _UI.alert('请选中一个具体分类再添加任务！');
                    return;
                }
                _saveAction = action;
                _TD.editItem();

                slidePageNext(); //Mobile:翻到编辑页
                
                break;
            case 'edit-todo':
                // 如果正在编辑，则不操作
                /*if (_saveAction == 'edit-todo') {
                    return;
                }*/
                if (_currentTodoEle) {
                    _saveAction = action;
                    _TD.editItem(_TL.getItem(_currentTodoEle.id));
                }

                break;
            case 'save-edit':
                if (!_saveAction) {
                    return;
                }
                
                var title   = $('#' + 'todo-title').value;
                var expire  = $('#' + 'todo-expire').value;
                var content = $('#' + 'todo-content').value;

                if (!title.length || title.length > 30 || !expire.length || !content.length) {
                    return;
                }
                title = stripTag(title);
                content = stripTag(content);
                
                expire = (new Date(expire)).getTime();
                var todo;

                // 通过行为状态判断是添加还是删除
                if (_saveAction === 'add-todo') {

                    todo = new Todo(_currentCatEle.id, title, content, expire);
                    // todo.statu = _currentStatu; //在某个状态下添加的任务，保存为某个状态
                    _TL.addItem(todo);
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
                var item = _TL.getItem(target.id);
                _TL.deleteItem(item.tid);
                _CL.removeChildTodo(item.cid, item.tid);

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

    }; // end handler

    // 初始化事件
    function initEvents() {
        addEvent(document.body, 'click', eventHandler);
        addEvent(document.body, 'contextmenu', function(event) {
            event = getEvent(event);
            var target = getEventTarget(event);
            preventDefault(event);
        });
        addEvent(document.body, 'touchstart', function(event) {
            // alert(event.target);
        });
        addEvent(document.body, 'touchend', function(event) {
            // alert(event);
            // event = getEvent(event);
            // cancelBubble(event);
        });
    };

    // 翻到上一页
    function slidePagePrev() {

        // 当前页归位
        addClass($(_pages[_pageIndex]), 'page-next');
        // removeClass($(_pages[_pageIndex]), 'page-active');
        
        _pageIndex = --_pageIndex < 0 ? 0 : _pageIndex;


        //上一页回来
        // addClass($(_pages[_pageIndex]), 'page-active');
        removeClass($(_pages[_pageIndex]), 'page-prev');

        showBack(_pageIndex);
    }

    // 翻到下一页
    function slidePageNext() {

        addClass($(_pages[_pageIndex]), 'page-prev');
        // removeClass($(_pages[_pageIndex]), 'page-active');

        _pageIndex = ++_pageIndex >= _pages.length ? 0 : _pageIndex;

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
        return str.replace(/\<\/?([^>]+)\>/g, ''); //$1
    }

    // 交换类名
    function switchClass(oldEle, newEle, className) {
        oldEle && removeClass(oldEle, className);
        newEle && addClass(newEle, className);
    };
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

            _TL.reload(todoList, _currentStatu);
            selectFirstTodoItem();  
        }
    }

    // 和新todo交换选择
    function switchSelectLastTodo(newEle) {
        switchSelect(_currentTodoEle, newEle);
        _currentTodoEle = newEle;

        showCurrItem();
    }
    
    // 显示当前元素 没有则显示空
    function showCurrItem() {
        if (_currentTodoEle) {
            _TD.showItem(_TL.getItem(_currentTodoEle.id));
        } else {
            _TD.showItem();
        }
    }

    // 选中显示所有任务
    function showAllTodo(target) {
        switchSelectLastCat(target);
    }
    // 选中顶级分类
    function showAllCat(target) {
        switchSelectLastCat(target);
    }
    // 强制展开父节点
    function openParentCategory(target) {
        if (!hasClass(target, 'item-cat')) {
            return;
        }
        var child = $('ul', target.parentNode); //展开子节点
        if (child) {
            removeClass(child, 'hidden');
            addClass(target, 'folder-opened');
        }
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
    // 选中todo项
    function selectTodo(target) {
        switchSelectLastTodo(target);
    }
    // 选中todo列表中的第一项
    function selectFirstTodoItem(wrapper) {
        wrapper = wrapper || $('#' + _TL.getWrapperId());
        var ele = $('.item-todo',  wrapper) || $('.item',  wrapper);
        switchSelectLastTodo(ele);
    }

    // 切换状态
    function selectStatu(target) {
        target = target || $('#statu-all');

        switchSelect(_currentStatuEle, target);
        _currentStatuEle = target || _currentStatuEle;

        switch(target.id) {
            case 'statu-not':
                _currentStatu = STATU_NOT_FINISH;
                break;
            case 'statu-done':
                _currentStatu = STATU_FINISH;
                break;
            default:
                _currentStatu = 0;
        }

        // 加载todo列表
        loadTodoInCurrentCat();
    }

    return {
        init: function(catListId, todoListId, todoDetailId) {
            _CL.init('category-list');
            _TL.init('todo-list');
            _TD.init('detail-wrap');
            selectStatu($('#statu-all'));
            selectFirstCatItem($('#' + 'category-list'));
            
            initEvents();
        }
    };
})(CategoryListModule, TodoListModule, todoDetail); // 引入模块


// Module/单例
// 观察者/发布订阅 模式
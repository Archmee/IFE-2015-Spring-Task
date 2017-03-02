var model = {}
model.todo = {}
model.category = {}

model.todoList = {}
model.categoryList = {}


// Category 类
function Category(title, pid) {
    this.addTime = Date.now();
    this.cid = 'cid_' + this.addTime;
    this.pid =  pid || null;
    this.title = title;
    this.todoCount = 0;
    this.childCatList = [];
    this.childTodoList = [];
};

// Todo 类
function Todo(title, content, cid) {
    this.addTime = Date.now();
    this.tid = 'tid_' + this.addTime;
    this.cid = cid;
    this.emergency = 0; // 紧急程度
    this.title = title;
    this.content = content;
}
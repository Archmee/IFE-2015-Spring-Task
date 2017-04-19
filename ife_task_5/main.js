requirejs.config({
    // baseUrl: 'src/js',
    paths: {
        app: './dist/js/todo',
        util: './dist/js/util',
        store: './dist/js/store',
        template: './lib/template'
    }
});

require(['app'],
function(app) {
    if (!window.localStorage) {
        alert('该应用不支持低版本浏览器！');
    } else {
        app.init();
    }
});


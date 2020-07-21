
// mvvm原理分为三部分：数据劫持、模板编译、发布订阅模式

// Vue的特点如下：
// Vue 的属性：$options,_data
// Vue的实例可以代理_data
// 深度响应
function Vue(options = {}) {
    this.$options = options;
    // 将所有属性挂载到$options 模拟vue
    var data = this._data = this.$options.data;
    // 劫持data
    observe(data);

    // 数据代理
    for (let key in data) {
        Object.defineProperty(this, key, {
            enumerable: true,
            get() {
                return this._data[key];//this.a = this._data.a
            },
            set(newVal) {
                this._data[key] = newVal
            }
        })
    }

    new Compile(options.el, this);

}

function Compile(el, vm) {//模板编译
    // el表示替换的范围
    vm.$el = document.querySelector(el);
    let fragment = document.createDocumentFragment();
    while (child = vm.$el.firstChild) { //将内容移入到内存中
        fragment.appendChild(child);
    }
    replace(fragment)
    function replace(fragment) {
        Array.from(fragment.childNodes).forEach(function (node) {
            let text = node.textContent;
            let reg = /\{\{(.*)\}\}/;
            if (node.nodeType === 3 && reg.test(text)) {//文本节点 匹配{{}}
                console.log(RegExp.$1) //a.a b  
                let arr = RegExp.$1.split('.');
                let val = vm;
                arr.forEach(function (k) {
                    val = val[k];
                })
                new Watcher(vm,RegExp.$1,function (newVal) {//值更改，执行替换，函数接收新值
                    node.textContent = text.replace(/\{\{(.*)\}\}/, newVal);
                })
                // 替换的逻辑
                node.textContent = text.replace(/\{\{(.*)\}\}/, val);
            }
            if(node.nodeType === 1){
                let nodeAttrs = node.attributes;
                Array.from(nodeAttrs).forEach(attr=>{
                    let name = attr.name;
                    let val = attr.value;
                    if(name==='v-model'){
                      node.value = vm[val];
                    }
                    new Watcher(vm,RegExp.$1,function(newVal){
                        node.value = newVal;
                    });
                    node.addEventListener('input',function(e){
                        let newVal = e.target.value;
                        vm[val] = newVal;
                    })
                })
        
            }
            if (node.childNodes) {
                replace(node);
            }
        })
    }
    vm.$el.appendChild(fragment);
}
// 观察对象，给对象增加Object.defineProperty
function Observe(data) {
    let dep = new Dep();
    for (let key in data) {
        let val = data[key];
        observe(val)
        Object.defineProperty(data, key, {
            enumerable: true,
            get() {
                Dep.target && dep.addSub(Dep.target);
                return val;
            },
            set(newVal) {
                if (newVal === val) {
                    return
                }
                val = newVal;//如果以后再获取值的时候，将刚才设置的值再丢回去
                observe(newVal);
                dep.notify();
            }
        })
    }
}


function observe(data) {
    if (typeof data !== 'object') return;
    return new Observe(data);
}
// 发布订阅
function Dep() {
    this.subs = [];
}
Dep.prototype.addSub = function(sub) {//订阅
    console.log("添加订阅")
    this.subs.push(sub)
}

Dep.prototype.notify = function() {
    this.subs.forEach(sub => sub.update())
}

function Watcher(vm,exp,fn) {
    this.vm = vm;
    this.exp = exp;
    this.fn = fn;
    Dep.target = this;
    let val = vm;
    let arr = exp.split('.');
    arr.forEach(function(k){
        val = val[k];
    })
    Dep.target = null;
}
Watcher.prototype.update = function() {
    let val = this.vm;
    let arr = this.exp.split('.');
    arr.forEach(function(k){
        val = val[k];
    })
    this.fn(val);
}


var vm = new Vue({
    el: '#mvvm',
    data: {
        a: { a: 1 }, b: 2
    },
});
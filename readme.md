1、vue原理主要包含三块：

（1）数据劫持
    
    将data中所有的数据，通过Object.defineProperty劫持
    Object.defineProperty(obj,key,{
        enumerabel:true,
        get(){
        return val;
    },
    set(newVal){
        if(newVal === val) return;
        val = newVal; //使得get的时候返回新的值
    }
    })

（2）模板编译

将页面中的双大括号的文本节点的内容和通过v-model绑定的内容，查找并替换。
这里使用虚拟dom的方法，先把内容存到内存中，再去查找和替换，最终结果再挂回去。

    function compile(){
        
    }

（3）发布订阅模式

订阅：将要发布的方法统一放在一个数组中，将要发布的方法统一有一个update方法

    function Dep(){
        this.subs=[];
    }
    Dep.prototype.addSub = function(sub){
        this.subs.push(sub)
    }
    Dep.prototype.notify = function(){
        this.subs.forEach(sub=>sub.update());
    }

发布：所有的发布方法有一个update方法

    function Watcher(fn){
        this.fn = fn
    }
    Watcher.prototype.update(){
        this.fn();
    }

2、使用发布订阅模式将数据劫持和模板编译结合，实现双向绑定

数据在get的时候对数据添加订阅和发布（响应）的方法，

数据在set的时候，触发订阅的方法，去执行方法（dep.notify()）

这个逻辑有点绕，需要多整理几遍
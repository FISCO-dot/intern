

 export class eventCenter {
    bindFuncList = [];// 
    
    /**
     * bindFuncList结构如下
     * [
     * 'event1':[func1,func2],
     * 'event2',[func3,func4]
     * ]
     */
    /**
     * 当暂时没有监听，或者场景没有初始化的时候，会将提前收到的消息和数据，
     * 保存到emitList中，结构如下：
     * [
     * 'event1':[args1,args2],
     * 'event2':[args3,args4];
     * ]
     */
    emitList = [];
    /**
     * 设置监听
     * @param {监听的事件的名字} key 
     * @param {监听的回调方法} cbFunc 
     */
    // 设置事件监听
    on(key,cbFunc){
        if (this.bindFuncList[key]){
            this.bindFuncList[key].push(cbFunc);
        }else {
            var ary = new Array();
            ary.push(cbFunc);
            this.bindFuncList[key] = ary;
        }
    }
    /**
     * 触发事件监听函数
     * @param {监听的事件的名字} key 
     * @param {调用时传的参数} args 
     */
    // emit事件，发送消息
    emit(key,args){
        var ary = this.bindFuncList[key];
        if(ary){// 如果已经注册了事件，就直接发送消息
            for (var i in ary) {
                if (ary.hasOwnProperty(i)) {
                    try {
                        ary[i].call(this,args);
                    } catch (error) {
                        
                    }
                }
            }
        }else {// 没有注册，先将要发送的消息保存，然后等待事件注册后，再一起emit
            if (this.emitList[key]){
                this.emitList[key].push(args);
            }else {
                ary = [];
                ary.push(args);
                this.emitList[key] = ary;
            }
        }
    }
    // emitAll，将所有消息都emit
    emitAll(){
        for (var key in this.emitList) {
            if (this.emitList.hasOwnProperty(key)) {
                var emitAry = this.emitList[key];
                for (var j in emitAry) {
                    if (emitAry.hasOwnProperty(j)) {
                        var args = emitAry[j];// 去除参数
                        var ary = this.bindFuncList[key];// 去除监听的方法
                        // 开始执行事件
                        for (var iterator in ary) {
                            if (ary.hasOwnProperty(iterator)) {
                                try {
                                    ary[iterator].call(this,args);
                                } catch (error) {
    
                                }
                            }
                        }
                        
                    }
                }
            }
        }
        this.emitList = [];
    }
    
    // 清空全部的事件监听
    popAll(){
        this.bindFuncList = [];
    }
}
    

    

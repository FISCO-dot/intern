

 export class eventCenter extends cc.Component{
    bindFuncList = [];              // 以事件名称作为数组索引，二维数组保存回调函数
    emitList = [];                  // 当没有监听的时候保存事件及传入参数
    /**
     * bindFuncList结构如下：
     * [
     * 'event1':[func1,func2],
     * 'event2':[func3,func4]
     * ]
     */
    /**
     * emitList结构如下：
     * [
     * 'event1':[args1,args2],
     * 'event2':[args3,args4];
     * ]
     */
    
    // 设置事件监听
    on(key,cbFunc){                     //key -> 监听的事件的名字  cbFunc -> 监听的回调方法
        if (this.bindFuncList[key]){
            this.bindFuncList[key].push(cbFunc);
        }else {
            var ary = new Array();
            ary.push(cbFunc);
            this.bindFuncList[key] = ary;
        }
    }

    // emit事件，发送消息
    emit(key:string,...args){                      //key->监听的事件的名字   args->调用时传的参数
        var ary = this.bindFuncList[key];   //取得回调函数
        if(ary){// 如果已经注册了事件，就直接发送消息
            for (var i in ary) {
                if (ary[i]) {
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
                ary = [];         //取得传入参数
                ary.push(args);
                this.emitList[key] = ary;
            }
        }
    }
    // emitAll，将所有消息都emit
    emitAll(){
        for (var key in this.emitList) {
            if (this.emitList[key]) {
                var emitAry = this.emitList[key];
                for (var j in emitAry) {
                    if (emitAry[j] ){
                        var args = emitAry[j];// 去除参数
                        var ary = this.bindFuncList[key];// 去除监听的方法
                        // 开始执行事件
                        for (var iterator in ary) {
                            if (ary[iterator]) {
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
    

    

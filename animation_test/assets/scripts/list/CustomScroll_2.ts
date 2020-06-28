const {ccclass, executionOrder,property} = cc._decorator;
import * as EventCenter from '../EventCenter/eventCenter'
let eventCenter = new EventCenter.eventCenter
export {eventCenter}
enum TemplateType {
    NODE = 1,
    PREFAB = 2,
}
@ccclass
@executionOrder(0)

// @requireComponent(cc.ScrollView)
export default class List extends cc.Component {

    @property({
        type:cc.Enum(TemplateType),
        tooltip:"模板类型"
    })
    templateType = 2
    @property({
        type : cc.Prefab,
        tooltip:'要使用的所有预制资源',
        visible(){
            return this.templateType == 2
        }
    })
    prefabSet : cc.Prefab[] = []
    @property({
        type:cc.Node,
        tooltip:"要使用的所有节点资源",
        visible(){
            return this.templateType == 1
        }
    })
    nodeSet : cc.Node[] = []
    @property
    singlePick : boolean = true
    @property(cc.SpriteFrame)
    viewBg :cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    barBg :cc.SpriteFrame = null;
    @property({
        displayName:'Page',
        tooltip:'翻页模式',
        visible(){
            if(this.adaptiveSize) this.pageMode = false
            return !this.adaptiveSize
        }
    })
    pageMode = false
    @property({
        displayName:'cycle',
        tooltip:'是否为循环列表',
        visible(){
            if(this.adaptiveSize) this.cycle = false
            return !this.adaptiveSize
        }
    })
    cycle = false
    @property({
        displayName:'Vertical',
        visible(){
            if(((this.cycle||this.adaptiveSize)&&this.scrollVertical)||this.messageMode) this.scrollHorizontal = false;
            if(this.messageMode) this.scrollVertical = true
            return !(this.cycle && this.scrollHorizontal)
        }
    })
    scrollVertical = true
    @property({
        displayName:'Horizontal',
        visible(){
            if((this.cycle||this.adaptiveSize)&&this.scrollHorizontal) this.scrollVertical = false;
            return !(this.cycle && this.scrollVertical) && !this.messageMode
        }
    })
    scrollHorizontal = false
    @property({
        type:cc.Integer,
        displayName:'View Width X',
        tooltip:'X方向列表长度',
    })
    viewWidth:number = 300
    @property({
        type:cc.Integer,
        displayName:'View Height Y',
        tooltip:'Y方向列表长度',
    })
    viewHeight:number = 300
    @property({
        type:cc.Integer,
        min: 0,
        displayName:'Item Numbers Y',
        tooltip:'Y方向单元个数',
        visible(){
            return this.scrollVertical && !this.cycle && !this.messageMode
        }
    })
    itemNumY:number = 1;
    @property({
        type:cc.Integer,
        min: 0,
        displayName:'Item Numbers X',
        tooltip:'X方向单元个数',
        visible(){
            return this.scrollHorizontal && !this.cycle && !this.messageMode
        }
    })
    itemNumX:number = 1;
    @property
    adaptiveSize:boolean = false
    @property({
        type:cc.Integer,
        min: 0,
        displayName:'Item Height Y',
        tooltip:'单元Y方向高度',
        visible(){
            return !this.messageMode
        }
    })
    height:number = 80;
    @property({
        type:cc.Integer,
        min: 0,
        displayName:'Item Width X',
        tooltip:'单元X方向宽度',
        visible(){
            return !this.messageMode
        }
    })
    width:number = 80;
    @property({
        displayName:'Align Center',
        tooltip:"是否居中显示",
        visible(){
            if(this.adaptiveSize) this.alignCenter = true
            return !(this.scrollVertical && this.scrollHorizontal)
        }
    })
    alignCenter : boolean = false
    @property(cc.Integer)
    interval:number = 0
    @property(cc.Integer)
    fontSize : number = 30;
    @property({
        type:cc.Integer,
        displayName:'Bar Width'
    })
    barWidth:number = 12
    @property({
        displayName:'messageMode',
        visible(){
            if(this.messageMode) this.singlePick = true
            if(!this.adaptiveSize) this.messageMode = false
            return this.adaptiveSize
        }
    })
    messageMode : boolean = false
    @property({
        displayName:'Max Width',
        tooltip:'对话框的最大宽度',
        visible(){
            if(this.messageMode) this.itemNumY = 1;
            return this.messageMode
        }
    })
    maxWidth : number = 200
    view:cc.Node = new cc.Node('view');
    content :cc.Node = new cc.Node('content');
    pageNumX = 0;
    pageNumY = 0;
    pageNum = 0;
    oriY : number = 0;
    oriX : number = 0;

    //输入数据
    private _data:string[] = [];
    //操作后都要update一下
    public loadData(data:any[] = [],transverse:boolean = false, autoFill:boolean = false){
        if(data.length == 0) {cc.error('input is empty');return}
        if(autoFill && this.cycle) cc.warn('there maybe an interput in cyclic mode and autoFill')
        data.forEach(element => {
            this._data.push(String(element))
        });
        if(transverse) this._data.reverse()
        if(autoFill){
            while(this._data.length < this.itemNumX*this.itemNumY){
                this._data.push('')
            } 
        }
    }
    public addData(data:any[] | any ,position?: number){ //在指定位置追加数据
        let index = []
        if(position < 0) {
            cc.error('your position is not available')
            return index
        }
        if(position >= this._data.length || position == undefined){
            cc.log('data = '+data)
            if(position >=this._data.length) cc.warn('your position is too big')
            if(typeof data == 'object'){
                data.forEach(element => {
                    this._data.push(String(element))
                    index.push(this._data.length-1)
                });
            }
            else {this._data.push(String(data));index.push(this._data.length - 1) }
        }
        else{
            if(typeof data == 'object'){
                for(var i = 0 ; i<data.length;i++){   
                    this._data.splice(position+i,0,String(data[i]))
                    index.push(position+i)
                }
            }
            else{
                this._data.splice(position,0,String(data))
                index.push(position)
            }
        }
        if(this.messageMode) this._sendMessage()
        return index
    }
    public onSizeChange(index:number,transverse:boolean,extent:number=20){ //当又item的size变化时重新计算各项位置
        cc.log('index = '+index)
        let i = this._findItemByname(this._itemDisplayingPool,String(index))
        if(transverse == false){
            this._itemDisplayingPool[i].height  += extent;
            this._itemDisplayingPool[i].setSiblingIndex(1000)
            for(var j = 0 ;j < this._itemPosition.length;j++){
                if(j<i) this._itemPosition[String(j)].y += extent/2
                if(j>i) this._itemPosition[String(j)].y -= extent/2
            }
        }
        else{
            this._itemDisplayingPool[i].height -=extent
            for(var j = 0 ;j < this._itemPosition.length;j++){
                if(j<i) this._itemPosition[String(j)].y -= extent/2
                if(j>i) this._itemPosition[String(j)].y += extent/2
            }
        }
        this.updateView()
    }
    private _Shrinkanimation(ob:any,callback?:Function){
        let scaleX = ob.scaleX
        let scaleY = ob.scaleY
        cc.tween(ob)
            .to(.3, {scaleX: .1,scaleY:.1})      
            .call(() => {                     
                ob.color = cc.Color.GRAY
                this._pool.put(ob) 
                ob.scaleX = scaleX
                ob.scaleY = scaleY
                if(callback != undefined) callback()
            })    
            .start()
    }
    private _deleteList = []
    public deleteItem(){
        var length = this.pick.length;
        if(length == 0) return;
        this.pick.sort((a,b)=>{return Number(b)-Number(a)})
        cc.log('pick =',this.pick)
        for(var i = 0;i < this.pick.length;i++) {
            let name = this.pick[i];
            if(this.cycle){
                for(var j = 0; j< this._itemDisplayingPool.length;j++){
                    if((Number(this._itemDisplayingPool[j].name)-Number(this.pick[i]))%this._data.length == 0) {
                        if(this._itemDisplayingPool.length < this._data.length) {                            
                            this._Shrinkanimation(this._itemDisplayingPool[j],()=>{
                                this._deleteList.push(this.pick[i]);
                            })
                            break
                        }
                        else{
                            while(j < this._itemDisplayingPool.length){                                
                                this._Shrinkanimation(this._itemDisplayingPool[j],()=>{
                                    this._deleteList.push(this._itemDisplayingPool[j].name);
                                    j += this._data.length
                                })                                
                            }
                        }
                    }
                }
                var index = this._cycleIndexProcess(Number(name))
                cc.log('删除数据'+index)
                this._data.splice(index,1)
                this.updateView();
            }
            else{
                let pickIndex = this._findItemByname(this._itemDisplayingPool,this.pick[i])
                this._deleteList.push(this.pick[i]);
                if(pickIndex != null){
                    this._Shrinkanimation(this._itemDisplayingPool[pickIndex])
                }
                this._data.splice(Number(name),1)
                if(this.messageMode) this._updateMessageView()
            }
        };
        this.pick = []
    }
    public clearData(){  //清空数据
        this._data = [];
        this.pick = [];
    }
    public updateView(){   //操作后更新视图
        if(this.cycle) var min = Number(this._itemDisplayingPool[0].name)
        else var min = this._deleteList.length > 0?Number(this._deleteList[this._deleteList.length-1]):0     
            for(var i = 0;i<this._itemDisplayingPool.length;i++){
                if(min <= Number(this._itemDisplayingPool[i].name) ){
                    // cc.log('谁大了'+this._itemDisplayingPool[i].name)
                    if(this.cycle){
                        // cc.log('how much ='+this._data)
                        let index = this._cycleIndexProcess(Number(this._itemDisplayingPool[i].name))
                        // cc.log('删除数据'+index)
                        this._itemDisplayingPool[i].getComponentInChildren(cc.RichText).string = this._data[index]
                        this._itemDisplayingPool[i].setPosition(this._calculatePosition(this._itemDisplayingPool[i]))
                    }
                    else{
                        if(this._data[Number(this._itemDisplayingPool[i].name)])
                            {
                                this._itemDisplayingPool[i].getComponentInChildren(cc.RichText).string = this._data[Number(this._itemDisplayingPool[i].name)]
                                this._itemDisplayingPool[i].setPosition(this._calculatePosition(this._itemDisplayingPool[i]))
                            }
                        else
                            this._itemDisplayingPool[i].getComponentInChildren(cc.RichText).string = ''
                    }
                }
            }
            for(var num = 0;num < this._deleteList.length;num++) {
                if(this._pool.size() > 0) this.content.addChild(this._pool.get())  
            }
        this._deleteList = []
    }
    public returnPick(){
        let itemList = []
        for(var i = 0;i < this.pick.length;i++){
            itemList.push(this._itemDisplayingPool[this._findItemByname(this._itemDisplayingPool,this.pick[i])])
        }
        return itemList
    }
    private _sendMessage(){  
        if(this.itemNumY >= this._data.length) return
        this.itemNumY++;
        this._poolGet(this._itemDisplayingPool.length,true)
        this.updateView()
        let lastItem = this._itemDisplayingPool[this._itemDisplayingPool.length-1]
        // if(-this._itemPosition[String(this._itemDisplayingPool.length-1)].y-(this.content.y-this.viewHeight/2) > this.viewWidth)
        //     this.scrollTo(this._itemDisplayingPool.length-1)
    }
    private _updateMessageView(){
        let delMsg = cc.instantiate(this.prefabSet[1])
        delMsg.getComponent(cc.RichText).string = `you have delete a message`
        delMsg.setPosition(0,this._itemDisplayingPool[Number(this.pick[0])].position.y)
        this._itemDisplayingPool[Number(this.pick[0])] = delMsg
        this.content.addChild(delMsg)
        for(var i = Number(this.pick[0]);i < this._itemDisplayingPool.length;i++){
            if(i == 0) this._itemDisplayingPool[i].y = this.content.height/2-this._itemDisplayingPool[0].height/2-20
            else this._itemDisplayingPool[i].y = this._itemDisplayingPool[i-1].y-this._itemDisplayingPool[i-1].height/2-this._itemDisplayingPool[i].height/2-20
        }

    }
    public scrollTo(index : number){
        if(!this.adaptiveSize){
            let column = index / this.itemNumX
            let row = index % this.itemNumX
            this.content.setPosition(this.oriX+row*this.width-this.width/2,this.oriY-column*this.height+this.height/2)
        }
        else{
            cc.log('scroll to '+index)
            this.content.y = this.oriY
            if(index == 0 ) return
            else {
                for(index = index -1;index >=0;index --){
                    this.content.y += this._itemDisplayingPool[index].height+20
                }
                cc.log('content y = '+ this.content.y)
            }
        }
    }
    onLoad () {
        //setparams
        if(!this.scrollHorizontal) {
            this.itemNumX = 1;
            if(this.cycle) this.itemNumY = this._data.length+1
        }
        if(!this.scrollVertical) {
            this.itemNumY =1
            if(this.cycle) this.itemNumX = this._data.length+1 
        };
        if(this.scrollVertical && this.scrollHorizontal) this.alignCenter = false

        //创建scroll view
        this._setScrollView();

        //direction
    }
    start(){
        this.pageNumX = this.scrollHorizontal? Math.floor(this.view.width/this.width):1;
        this.pageNumY = this.scrollVertical? Math.floor(this.view.height/this.height):1;
        this.pageNum = this.pageNumX*this.pageNumY;
        this._freshItem();
        //创建scrollbar
        this._setBar();  
        this._listen();
    }
    public pick = [];  //用于储存选中的item的 name
    public listen(callback:Function){
        eventCenter.on('select'+this.node.name,(node)=>{
            callback(node)
        },this.node)
    }
    private _listen(){
        eventCenter.on('select'+this.node.name,(node)=>{
            node.forEach(element => {
                if(element.name == 'label') element = element.parent
                cc.log('jiaoyan  ' + this.node.name)
                // if(this.node != element.parent.parent.parent) return
                cc.log(element.position)
                var flag = true;
                if(this.cycle){
                    for(var i = 0;i < this.pick.length;i++){
                        if((Number(this.pick[i]) - Number(element.name))%this._data.length == 0) {flag = false
                        break;}
                    }
                }
                else{
                    for(var i = 0;i < this.pick.length;i++){
                        if(this.pick[i] == element.name) {flag = false
                        break;}
                    }
                }
                if(!flag){   //反选
                    if(this.cycle){
                        if(this._itemDisplayingPool.length < this._data.length){
                            element.color = cc.Color.BLUE
                            cc.log('unpick  '+this.pick[i])
                            this.pick.splice(i,1)
                        }
                        else{
                            for(var j=0;j < this._itemDisplayingPool.length;j++){
                                if((Number(this._itemDisplayingPool[j].name) - Number(element.name))%this._data.length == 0) break;
                            }
                            while(j < this._itemDisplayingPool.length){
                                this._itemDisplayingPool[j].color = cc.Color.BLUE
                                j += this._data.length
                            }
                            cc.log('unpick  '+this.pick[i].name)
                            this.pick.splice(i,1)
                        }
                        eventCenter.dispatch('unpick',element,0,false)
                    }
                    else{
                        element.color = cc.Color.BLUE;
                        this.pick.splice(i,1)
                        // this.onSizeChange(Number(element.name),true)
                        cc.log('unpick  '+element.name)
                        eventCenter.dispatch('unpick',element,0,false,element)
                    }
                }
                else{   //正选
                    if(this.cycle){
                        if(this._itemDisplayingPool.length < this._data.length){
                            element.color = cc.Color.RED
                            let index = this._cycleIndexProcess(Number(element.name))
                            this.pick.push(String(index))
                            cc.log('pick '+index)
                        }
                        else{
                            cc.log('2')
                            for(var i=0;i < this._itemDisplayingPool.length;i++){
                                if((Number(this._itemDisplayingPool[i].name) - Number(element.name))%this._data.length == 0) break;
                            }
                            while(i < this._itemDisplayingPool.length){
                                this._itemDisplayingPool[i].color = cc.Color.RED
                                i += this._data.length
                            }
                            i -= this._data.length
                            let index = this._cycleIndexProcess(Number(this._itemDisplayingPool[i].name))
                            this.pick.push(String(index))
                            cc.log('pick '+index)
                        }
                        eventCenter.dispatch('pick',element,0,false,element)
                    }
                    else{
                        if(this.singlePick){            
                            element.color = cc.Color.RED
                            if(this.pick.length == 0) {
                                this.pick.push(element.name)
                            }
                            else{
                                this._itemDisplayingPool[Number(this.pick[0])].color = cc.Color.GRAY
                                eventCenter.dispatch('unpick',this._itemDisplayingPool[Number(this.pick[0])],0,false,this._itemDisplayingPool[Number(this.pick[0])])
                                // this.onSizeChange(Number(this.pick[0]),true)
                                this.pick[0] = element.name
                            }
                            
                        }
                        else{
                            element.color = cc.Color.RED
                            this.pick.push(element.name)
                        }
                        eventCenter.dispatch('pick',element,0,false,element)
                        // this.onSizeChange(Number(element.name),false)
                        cc.log('pick'+element.name)
                    }
                }
            });
        },this.node)
    }
    private _cycleIndexProcess(index:number){
        while(index >= this._data.length) index -= this._data.length
        while(index < 0) index += this._data.length
        return index
    }
    private _creatrSingleItem(){
        var labelNode = new cc.Node('label');
        var item = this.templateType == 2?cc.instantiate(this.prefabSet[0]):cc.instantiate(this.nodeSet[0])
        item.color = cc.Color.GRAY
        item.addChild(labelNode)
        labelNode.addComponent(cc.RichText)
        let itemCompo = item.addComponent('ListItem')
        itemCompo.setFontSize(this.fontSize)
        return item;
    }
    private _createItem(){
        var item = [];
        var length = this._itemNumRenderByFrame       
        for(var i = 0;i<length;i++){
            item.push(this._creatrSingleItem());
        }
        return item
    }
    private _index:number = 0;  //本list中item的代号
    private _itemPosition = []; //存储item底边或右边的位置
    /* _itemPosition结构：
    ** [
    **    'item_1.name':cc.v2(x,y)
    **    'item_2.name':cc.v2(x,y)
    ** ]
    **
    */
    private _calculatePosition(item:any){
        if(this._itemPosition[item.name]){
            if(!this.adaptiveSize) return this._itemPosition[item.name]
            else{
                if(this.scrollHorizontal) return cc.v2(this._itemPosition[item.name].x-item.width/2,0)
                else return cc.v2(0,this._itemPosition[item.name].y+item.height/2)
            }
        }
        else{
            if(!this.adaptiveSize){
                let column = Math.floor(Number(item.name) / this.itemNumX)
                let row = Number(item.name) % this.itemNumX
                this._itemPosition[item.name] = cc.v2(-this.content.width/2 +this.width/2+row*(this.width+this.interval),this.content.height/2-(this.height/2+column*(this.height+this.interval)))
                return this._itemPosition[item.name]
            }
            else{
                if(this.scrollHorizontal){
                    this.content.width += item.width+this.interval
                    this.content.x += (item.width+this.interval)/2
                    this.oriX += (item.width+this.interval)/2
                    for(var index in this._itemPosition){
                        if(Number(index) < Number(item.name)) this._itemPosition[index].x -= (item.width+this.interval)/2
                    }
                    if(item.name == '0') this._itemPosition['0'] = cc.v2(-this.content.width/2+item.width,0)
                    else this._itemPosition[item.name] = cc.v2(this._itemPosition[Number(item.name)-1].x+item.width+this.interval,0)
                    return cc.v2(this._itemPosition[item.name].x-item.width/2,0)
                }
                else{
                    this.content.height += item.height+this.interval
                    this.content.y -= (item.height+this.interval)/2
                    this.oriY -= (item.height+this.interval)/2
                    for(var index in this._itemPosition){
                        if(Number(index) < Number(item.name)) this._itemPosition[index].y += (item.height+this.interval)/2
                    }
                    if(item.name == '0') this._itemPosition['0'] = cc.v2(0,this.content.height/2-item.height)
                    else {
                        this._itemPosition[item.name] = cc.v2(0,this._itemPosition[Number(item.name)-1].y - item.height-this.interval)
                        
                    }
                    cc.log('itemheight = '+this._itemPosition)
                    return cc.v2(0,this._itemPosition[item.name].y+item.height/2)
                }
            }
        }
    }
    private _calculateIndex(x:number,y:number):number
    {
        if(!this.adaptiveSize) return Math.floor((y - this.oriY) / (this.height+this.interval)) * this.itemNumX + Math.floor((- x + this.oriX) / (this.width+this.interval))
        else{
            let index = 0
            if(this.scrollHorizontal){
                while(this._itemPosition[index].x+this.content.width/2 < this.oriX - x ) {index++}
                return index
            }
            else{
                while(this.content.height/2-this._itemPosition[index].y < y-this.oriY) index ++
                return index 
            }
        }
    }
    private onceControl = true;
    private _isViewFull(){   
        if(!this.pageMode)
       { //-1:上边行不够   -2：下边行不够   -3：左边列不够    -4：右边列不够 
            if(this.adaptiveSize){
                if(this.scrollVertical){
                    if((Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name) < this.itemNumY-1 ) && -this._itemDisplayingPool[this._itemDisplayingPool.length-1].y + this._itemPosition[String(this._index)].y < this.viewHeight) return -2
                    else if((Number(this._itemDisplayingPool[0].name) > 0 ) && this._itemDisplayingPool[0].y - this._itemPosition[String(this._index)].y < this.viewHeight) return -1
                    else return 1
                }
                else{
                    if((Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name) < this.itemNumX-1 ) && this._itemDisplayingPool[this._itemDisplayingPool.length-1].x - this._itemPosition[String(this._index)].x < this.viewWidth) return -4
                    else if((Number(this._itemDisplayingPool[0].name) > 0 ) && this._itemPosition[String(this._index)].x - this._itemDisplayingPool[0].x < this.viewWidth) return -3;
                    else return 1
                }
            }
            else{
                if((this.scrollHorizontal) &&  (this._index >=0 &&Number(this._itemDisplayingPool[0].name) % this.itemNumX>0) && //不是第一列
                this._findItemByname(this._itemDisplayingPool,String(this._index-1)) == null ) //需要显示的列序数小于已经加载的列序数
                {cc.log('-3 ');cc.log('index-1='+String(this._index-1));return -3;}
                else if((this.scrollHorizontal)&&this.itemNumX - 1 - this._index % this.itemNumX >= this.pageNumX &&  //不是最后几列
                Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name)%this.itemNumX - this._index%this.itemNumX  < Math.min(this.itemNumX,this.pageNumX)) //加载出来的item与现在的item列数之差过小
                {cc.log('-4');return -4;}
                else if((this.scrollVertical)&& (Number(this._itemDisplayingPool[0].name) >= this.itemNumX || this.cycle)  && //不是第一行
                Math.floor(this._index/this.itemNumX-Number(this._itemDisplayingPool[0].name)/this.itemNumX) < 0) //需要显示的行序数小于已经加载的行序数
                    {cc.log('-1==='+this._index);return -1;}   
                else if( (this.scrollVertical) && 
                (((this.itemNumY*this.itemNumX - 1-this._index)/this.itemNumX >= this.pageNumY)||this.messageMode)  //不是最后几行
                && Math.floor(Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name)/this.itemNumX-this._index / this.itemNumX) < Math.min(this.itemNumY,this.pageNumY)) //加载出来的item与现在显示的item行数之差国小
                {cc.log('-2==',this.content.x,'==',this.oriX,'==',this.content.y,'==',this.oriY);return -2}
                else {
                    return 1;
                }
            }
        }
        else{ //-4：往左滑 -3：往右滑 -2：往上滑 -1：往下滑
            if(this.onceControl&&this.scrollHorizontal&& Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name) % this.itemNumX < this.itemNumX-1 && //不是最后一篇
                this.content.x < -this.viewWidth*1/4){
                {cc.log('-4');this.onceControl = false;return -4}
            }
            else if(this.onceControl&&this.scrollHorizontal && Number(this._itemDisplayingPool[0].name) % this.itemNumX > 0 &&
                this.content.x > this.viewWidth/4)
               { cc.log('-3');this.onceControl = false;return -3}
            else if(this.onceControl&&this.scrollVertical && Math.floor(Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name) /this.itemNumX) < this.itemNumY-1 &&
                this.content.y > this.viewHeight/4)
                {cc.log('-2');this.onceControl = false;return -2}
            else if(this.onceControl&&this.scrollVertical && Math.floor(Number(this._itemDisplayingPool[0].name) /this.itemNumX) > 0 &&
                this.content.y < -this.viewHeight/4)
               { cc.log('-1 ');this.onceControl = false;return -1}
            else{
                if(Math.abs(this.content.x) < 0.01) {this.onceControl = true;}
                return 1
            }
        }
    }
    private _loadScrollRecord(){
        this._index = this._calculateIndex(this.content.x,this.content.y)
        this.node.emit(`roll schedule ${this._index}`)   //抛出滚动进度事件
        var flag = this._isViewFull()
        if(this.pageMode){  
            if(flag < 0){
                var index = Number(this._itemDisplayingPool[0].name)
                while(this._itemDisplayingPool.length !=0) this._poolPut(0)
                this._itemDisplayingPool = []
                if(flag == -4) {
                    this._initializePage(index+this.pageNumX)
                }
                else if(flag == -3) this._initializePage(index-this.pageNumX)
                else if(flag == -2) this._initializePage(index+this.pageNumY*this.itemNumX)
                else if(flag == -1) this._initializePage(index -this.pageNumY*this.itemNumX)
                this.content.setPosition(0,0)
            }
        }
        else{
            while(flag < 0  )//
            {
                
                this._itemDisplayingPool.sort((a,b)=>{
                    return Number(a.name) - Number(b.name)
                })
                var idLast = Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name)
                var idStart= Number(this._itemDisplayingPool[0].name)
                var columnNum = Math.floor(idLast/this.itemNumX - idStart /this.itemNumX)
                var rowNum = idLast%this.itemNumX - idStart % this.itemNumX
                if(flag == -1){

                    for(var i = rowNum; i>=0;i--){
                        if(columnNum > this.pageNumY && rowNum >this.pageNumX ){
                            this._poolPut(this._itemDisplayingPool.length-1)
                        }
                        this._poolGet(idStart-this.itemNumX+i,false)
                        if(this.cycle){
                            this.content.height += this.height*2
                            this.itemNumY ++
                        }
                    }  
                }
                    if(flag == -2){
    
                        for(var i = rowNum;i>=0;i--){
                            if(columnNum > this.pageNumY && rowNum >this.pageNumX ){
                                this._poolPut(0)
                            }
                            this._poolGet(idLast+this.itemNumX-i,true)
                            if(this.cycle){
                                this.content.height += this.height*2
                                this.itemNumY ++
                            }   
                        }
                    }                
                    if(flag == -3){

                        for(var i = columnNum;i >=0;i--){
                            this._poolGet(idStart-1+i*this.itemNumX,false)
                        }
                        if(this.cycle){
                            this.content.width += 2*this.width
                            this.itemNumX++
                        }
                        if(columnNum > this.pageNumY || rowNum > this.pageNumX)
                        {
                            for(var i = 0;i < this._itemDisplayingPool.length;i++){
                            if(((Number(this._itemDisplayingPool[i].name) - idLast) % this.itemNumX) == 1 ){

                                this._poolPut(i)
                                i--;
                            }
                        }} 
                    }
                    if(flag == -4){

                        for(var i = columnNum;i>=0;i--){
                            this._poolGet(idLast+1-i*this.itemNumX,true)
                        }
                        if(this.cycle) {
                            this.content.width += 2*this.width
                            this.itemNumX++
                        }
                        if(columnNum > this.pageNumY || rowNum > this.pageNumX)
                        {for(var i = 0;i < this._itemDisplayingPool.length;i++){
                            if(((Number(this._itemDisplayingPool[i].name) - idStart) % this.itemNumX) == 0 ){

                                this._poolPut(i);
                                i--;
                            }
                        }}       
                    }
                    flag = this._isViewFull();
            }
        }
    }

    private _freshItem(){
        cc.log('fresh')
        //初始化单元
        this.content.destroyAllChildren();
        this._pool.clear();
        this._itemDisplayingPool = [];
        this.pick = [];
        this._itemPosition = []
        if(this.pageMode) {
            this.content.width = this.viewWidth
            this.content.height =this.viewHeight
            this.content.setPosition(0,0)
        }
        else if(this.adaptiveSize) {
            if(this.scrollVertical){
                this.content.width =this.viewWidth
                this.content.height = 0
                this.content.setPosition(0,this.viewHeight/2)
            }
            else{
                this.content.height = this.viewHeight
                this.content.width = 0
                this.content.setPosition(-this.viewWidth/2,0)
            }
        }
        else {
            this.content.width = this.itemNumX*this.width + this.interval*(this.itemNumX-1)
            this.content.height = this.itemNumY*this.height + this.interval*(this.itemNumY-1)
            if(this.alignCenter){
                if(this.scrollVertical) this.content.setPosition(0,-(this.content.height/2-this.viewHeight/2))
                else this.content.setPosition(this.content.width/2-this.viewWidth/2,0)
            }
            else this.content.setPosition(this.content.width/2-this.viewWidth/2,-(this.content.height/2-this.viewHeight/2))
        }        
        //设置参考位置
        this.oriX = this.content.x
        this.oriY = this.content.y
        this._initializePage(0);
    }
    private _initializePage(num:number){ //输入要生成page的第一个item序号
        for(var i = 0;i < Math.min(this.itemNumX,this.pageNumX);i++){
            for(var j = 0; j < Math.min(this.itemNumY,this.pageNumY);j++){
                if(!this.alignCenter) this._poolGet(num+i+j*this.itemNumX,true)
                else{
                    if(this.scrollVertical) this._poolGet(num+i+j*this.itemNumX,true)
                    if(this.scrollHorizontal) this._poolGet(num+i+j*this.itemNumX,true)
                }
            }
        }
    }
    private _findItemByname(list : any[],name : string){
        for(var i = 0;i< list.length;i++){
            if(list[i].name == name) return i;
        }
        return null;
    }
    private _poolPut(index:number){
        cc.log("delete "+index)
        this._pool.put(this._itemDisplayingPool[index]);
        this._itemDisplayingPool.splice(index,1)
    }
    private _poolGet(index:number,flag:boolean){
        if(this._findItemByname(this._itemDisplayingPool,String(index))!=null) return;
        if(this._pool.size()>0) {var item = this._pool.get();item.color = cc.Color.GRAY}
        else{
            var item = this._creatrSingleItem();
        }
        
        let itemLabel = item.getComponentInChildren(cc.RichText)
        let listItem = item.getComponent('ListItem')
        item.name = String(index)
        cc.log('create index='+item.name)
        if(this.cycle){
            if(index >= 0) itemLabel.string = this._data[index%this._data.length]
            else {
                while(index < 0) index +=this._data.length
                itemLabel.string = this._data[index] + '<on click="handler"> click me! </on>'
            }
            this.pick.forEach(element => {
               if((Number(item.name)-Number(element))%this._data.length == 0) {
                   item.color = cc.Color.RED}
            });
        }
        else{
            if(Number(item.name) < this._data.length) itemLabel.string = this._data[index]
            else{
                    itemLabel.string = ''
            } 
            this.pick.forEach(element => {
                if(element == item.name) {item.color = cc.Color.RED;}
            });
        }
        this.content.addChild(item);
        item.targetOff(cc.Node.EventType.TOUCH_END)
        listItem.itemOnLoad()
        item.setPosition(this._calculatePosition(item))
        if(flag) this._itemDisplayingPool.push(item)
        else this._itemDisplayingPool.unshift(item)
        if(this.adaptiveSize) this.updateView()        
    }
    private _itemNumRenderByFrame = 12;
    private _pool = new cc.NodePool();
    private _itemDisplayingPool = [];
    private _createDone : boolean = false;
    update (dt) {
        if(this._pool.size() >= this.pageNumX*this.pageNumY*3) this._createDone = true;
        if(!this._createDone) {
            let item = this._createItem().reverse()
            item.forEach(element => {
                this._pool.put(element);
            });
        }
        if(!this.messageMode) this._loadScrollRecord();
        if(!this.cycle && !this.messageMode){
            if((-this.content.x+this.oriX) < -50 ||(-this.oriY+this.content.y) < -50) this._freshItem(); //上拉或左拉刷新
        }
        // cc.log('content='+this.view.width+'content='+this.view.height)
    }
    private _setBar(){
        //bar params
        if(this.itemNumX > 1)
        {
            let ScrollbarX = new cc.Node;
            let bar = new cc.Node;
            this.node.addChild(ScrollbarX)
            let barComponent= ScrollbarX.addComponent(cc.Scrollbar)
            barComponent.direction = 0
            this.node.getComponent(cc.ScrollView).horizontalScrollBar = barComponent
            ScrollbarX.addChild(bar);
            let barSprite = bar.addComponent(cc.Sprite)
            barSprite.spriteFrame = this.barBg;
            barComponent.handle = barSprite
            ScrollbarX.x = 0
            ScrollbarX.y = this.itemNumY>1? -this.view.height/2:this.content.y - this._itemDisplayingPool[0].height/2
            cc.log('viewheight'+this.view.height)
            ScrollbarX.height = this.barWidth
            ScrollbarX.width = this.view.width;
        }
        if(this.itemNumY > 1){
            let ScrollbarY = new cc.Node;
            let bar = new cc.Node;
            this.node.addChild(ScrollbarY);
            let barComponent= ScrollbarY.addComponent(cc.Scrollbar)
            barComponent.direction = 1
            this.node.getComponent(cc.ScrollView).verticalScrollBar = barComponent
            ScrollbarY.addChild(bar);
            let barSprite = bar.addComponent(cc.Sprite)
            barSprite.spriteFrame = this.barBg;
            barComponent.handle = barSprite
            ScrollbarY.x = this.itemNumX>1? this.view.width/2:this.content.x+this._itemDisplayingPool[0].width/2
            ScrollbarY.y = 0
            ScrollbarY.height = this.view.height
            ScrollbarY.width = this.barWidth
       }
    }
    private _setScrollView(){
        let scrollView = this.node.addComponent(cc.ScrollView);
        scrollView.bounceDuration = 0.1
        this.node.addChild(this.view)
        this.view.addComponent(cc.Sprite).spriteFrame = this.viewBg
        this.view.addChild(this.content)
        this.view.addComponent(cc.Mask)
        this.view.width = this.viewWidth
        this.view.height = this.viewHeight
        this.view.setPosition(0,0)
        scrollView.content = this.content;
        scrollView.vertical = this.scrollVertical;
        scrollView.horizontal = this.scrollHorizontal;
        scrollView.inertia = this.pageMode?false:true;
        scrollView.elastic = true;
    }
   
}

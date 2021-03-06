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
    @property(cc.Integer)
    contentOffset : number = 0
    @property(cc.Integer)
    topWidget : number = 0
    @property(cc.Integer)
    leftWidget: number = 0
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
    itemColor :cc.Color = cc.color(255,255,255,255);
    //输入数据
    private _data:any[] = [];
    private _imgBg:cc.SpriteFrame[] = [];
    //操作后都要update一下
    public setItemColor(color:cc.Color){
        this.itemColor = color
    }
    public loadData(data:any[] = [],transverse:boolean = false){
        if(data.length == 0) {cc.error('input is empty');return}
        
        data.forEach(element => {
            if(element instanceof cc.SpriteFrame) this._data.push(element)
            else this._data.push(String(element))
        });
        if(transverse) this._data.reverse()
    }
    public addData(data:any[] | any ,position?: number){ //在指定位置追加数据
        let index = []
        if(position < 0) {
            cc.error('your position is not available')
            return index
        }
        let dat = []
        data instanceof Array ? dat = data : dat.push(data)
        if(position >= this._data.length || position == undefined){
            if(position >=this._data.length) cc.warn('your position is too big')
            dat.forEach(element => {
                if(element instanceof cc.SpriteFrame) this._data.push(element)
                else this._data.push(String(element))
                    index.push(this._data.length-1)
            });
        }
        else{
            for(var i = 0 ; i<dat.length;i++){ 
                if(dat[i] instanceof cc.SpriteFrame) this._data.splice(position+i,0,dat[i])
                else this._data.splice(position+i,0,String(dat[i]))
                index.push(position+i)
            }
        }
        return index
    }
    public loadItemBackground(data : cc.SpriteFrame[] ){ //node上的sprite
        if(data.length == 0) return
        data.forEach(element => {
            this._imgBg.push(element)
        });
    }
    public getItemByIndex(index:number){
        return this._itemDisplayingPool[this._findItemByname(this._itemDisplayingPool,String(index))]
    }
    public getItem(){
        return this._itemDisplayingPool
    }
    public getItempositionByIndex(index : number){
        return this._itemPosition[String(index)]
    }
    public getItemposition(){  //改变后要updateview
        return this._itemPosition
    }
    private _Shrinkanimation(ob:any,callback?:Function){
        let scaleX = ob.scaleX
        let scaleY = ob.scaleY
        cc.tween(ob)
            .to(.3, {scaleX: .1,scaleY:.1})      
            .call(() => {                     
                ob.color = this.itemColor
                // ob.removeFromParent()
                ob.scaleX = scaleX
                ob.scaleY = scaleY
                if(callback != undefined) callback()
            })    
            .start()
    }
    private _deleteList = []
    public deleteItem(onCompleteCallback?:any){
        var length = this.pick.length;
        if(length == 0) return;
        this.pick.sort((a,b)=>{return Number(b)-Number(a)})
        cc.log('pick =',this.pick)
        for(var i = 0;i < this.pick.length;i++) {
            let name = this.pick[i];
            let pickIndex = this.cycle?this._cycleIndexProcess(this._findItemByname(this._itemDisplayingPool,name)):this._findItemByname(this._itemDisplayingPool,name)
            this._data.splice(Number(this._itemDisplayingPool[pickIndex].name),1)    
            let pickList = [];
            pickList.push(pickIndex)
            if(this.cycle) while (pickIndex < this._itemDisplayingPool.length) {
                pickIndex += this._data.length
                pickList.push(pickIndex)
            }
            pickList.forEach(element => {
                this._Shrinkanimation(this._itemDisplayingPool[element],()=>{
                    this._deleteList.push(this._itemDisplayingPool[element]);
                    eventCenter.emit('delete',this._itemDisplayingPool[element])
                    this._pool.put(this._itemDisplayingPool[element])
                    if(onCompleteCallback != undefined) onCompleteCallback(this._itemDisplayingPool[element]);
                })
            })
        }
        this.pick = []
    }

    public ChangeDataByIndex(index:number,data:any){
        this._data[index] = data
    }   
    public clearData(){  //清空数据
        this._data = [];
        this.pick = [];
    }
    public updateView(index?:number){   //操作后更新视图 
        for(var num = 0;num < this._deleteList.length;num++) {
            if(this._pool.size() > 0) {
                let getNode = this._pool.get()
                try{this.content.addChild(this._itemDisplayingPool[this._findItemByname(this._itemDisplayingPool,getNode.name)])}
                catch{}  //在产生delmsg之后已经加入了content
            }
        }
        if(this.cycle) var min = Number(this._itemDisplayingPool[0].name)
        else if(index != undefined) var min = index
        else var min = this._deleteList.length > 0?Number(this._deleteList[this._deleteList.length-1].name):0     
            for(var i = 0;i<this._itemDisplayingPool.length;i++){
                let str = this._itemDisplayingPool[i].getComponentInChildren(cc.RichText)
                let spf = this._itemDisplayingPool[i].getChildByName('imgMsg')?this._itemDisplayingPool[i].getChildByName('imgMsg').getComponent(cc.Sprite):null
                if(min <= Number(this._itemDisplayingPool[i].name) ){                    
                    // cc.log('update ',this._itemDisplayingPool[i])
                    let index = this.cycle? this._cycleIndexProcess(Number(this._itemDisplayingPool[i].name)):Number(this._itemDisplayingPool[i].name)
                    try{
                        str.string = (!this._data[index])||(this._data[index] instanceof cc.SpriteFrame) ? '':this._data[index]
                        spf.spriteFrame = (!this._data[index])|| typeof(this._data[index]) == 'string'? null:this._data[index]
                    }catch{}
                    this._itemDisplayingPool[i].setPosition(this._calculatePosition(this._itemDisplayingPool[i]))
                    // if(this._itemDisplayingPool[i].getComponent('ListItem') == null) this._itemDisplayingPool[i].addComponent('ListItem')
                    // this._itemDisplayingPool[i].getComponent('ListItem').itemOnLoad()
                }
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
    public sendMessage(){  
        if(this.itemNumY >= this._data.length) return
        this.itemNumY++;
        this._poolGet(this._itemDisplayingPool.length,true)
        let lastItemPos = this._itemPosition[this._itemDisplayingPool[this._itemDisplayingPool.length-1].name]
        if(this.content.convertToWorldSpaceAR(lastItemPos).sub(cc.v2(0,320)).y < -this.viewHeight/2){
            this.content.y += this.viewHeight - this._itemDisplayingPool[this._itemDisplayingPool.length-1].height
        }
        return String(this.itemNumY-1)
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
    itemTemplate : cc.Node = null

    onLoad () {
        //setparams
        if(!this.scrollHorizontal) {
            this.itemNumX = 1;
            if(this.cycle) this.itemNumY = Math.ceil(this.viewHeight/this.height)+1
        }
        if(!this.scrollVertical) {
            this.itemNumY =1
            if(this.cycle) this.itemNumX = Math.ceil(this.viewWidth/this.width) +1
        };
        if(this.scrollVertical && this.scrollHorizontal) this.alignCenter = false
        if(this.messageMode) this.itemNumY = 0
        //创建scroll view
        this._setScrollView();
    }
    start(){
        this.itemTemplate = this.templateType == 2?cc.instantiate(this.prefabSet[0]):cc.instantiate(this.nodeSet[0])
        this.pageNumX = this.scrollHorizontal? Math.floor(this.view.width/this.width):1;
        this.pageNumY = this.scrollVertical? Math.floor(this.view.height/this.height):1;
        this.pageNum = this.pageNumX*this.pageNumY;
        this._freshItem();
        //创建scrollbar
        this._setBar();  
        this._listen();
    }
    public pick = [];  //用于储存选中的item的 name
    private _listen(){
        eventCenter.on('select'+this.node.name,(node)=>{
            node.forEach(element => {
                cc.log('jiaoyan  ' + this.node.name)
                var flag = true;
                for(var i = 0;i < this.pick.length;i++){
                    if((this.cycle && (Number(this.pick[i]) - Number(element.name))%this._data.length == 0)||this.pick[i] == element.name){
                        flag = false;
                        break;
                    }
                }
                let index = this._cycleIndexProcess(element.name)
                flag ? this.pick.push(String(index)):this.pick.splice(i,1)
                cc.log(flag?'pick ':'unpick ', index)
                if(this.cycle && this._itemDisplayingPool.length >= this._data.length){
                    let q = this._findItemByname(this._itemDisplayingPool,String(index))
                    while(q < this._itemDisplayingPool.length){
                        this._itemDisplayingPool[q].color = flag?cc.Color.RED:cc.Color.BLUE
                        q = q + this._data.length
                    }
                }
                else element.color = flag?cc.Color.RED:cc.Color.BLUE
                if(this.singlePick && flag && index != this.pick[0]){
                    let p = this._findItemByname(this._itemDisplayingPool,this.pick[0])
                    while(p < this._itemDisplayingPool.length){
                        this._itemDisplayingPool[p].color = this.itemColor
                        eventCenter.dispatch('unpick'+this.node.name,this._itemDisplayingPool[p],2,this._itemDisplayingPool[p])
                        p += this._data.length
                    }
                    cc.log('unpick'+this.pick[0])
                    this.pick.splice(0,1)
                }
                eventCenter.dispatch((flag?'pick':'unpick')+this.node.name,element,2,element)
            });
        },this.node)
    }
    private _cycleIndexProcess(index:number){
        while(index >= this._data.length) index -= this._data.length
        while(index < 0) index += this._data.length
        return index
    }
    public SetItemTemplate(index?:number){
        if(index == undefined) return this.itemTemplate
        if(this.templateType == 2) this.itemTemplate = cc.instantiate(this.prefabSet[index]);
        else this.itemTemplate = cc.instantiate(this.nodeSet[index])
        return this.itemTemplate
    }
    private _creatrSingleItem(){
        var labelNode = new cc.Node('label');
        var ImgNode = new cc.Node('imgMsg')
        var item = cc.instantiate(this.itemTemplate)
        if(item.getComponent(cc.Sprite) == null && this._imgBg.length != 0) item.addComponent(cc.Sprite) 
        item.color = this.itemColor
        item.addChild(labelNode)
        labelNode.x += this.contentOffset
        ImgNode.x += this.contentOffset
        item.addChild(ImgNode)
        labelNode.addComponent(cc.RichText).string = ''
        ImgNode.addComponent(cc.Sprite)
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
    private _calculatePosition(item:any){  //计算过直接返回，没计算过计算返回 
        if(this._itemPosition[item.name]){
            if(!this.adaptiveSize && !this.cycle) return this._itemPosition[item.name]
            else{
                if(this.scrollHorizontal) return cc.v2(this._itemPosition[item.name].x-item.width/2,this._itemPosition[item.name].y)
                else return cc.v2(this._itemPosition[item.name].x,this._itemPosition[item.name].y+item.height/2)
            }
        }
        else{
            if(!this.adaptiveSize && !this.cycle){
                if(this.pageMode && (item.name/this.itemNumX>=this.pageNumY || item.name%this.itemNumX>=this.pageNumX)){
                    return this._itemPosition[String(Number(item.name)%this.itemNumX%this.pageNumX+Math.floor(Number(item.name)/this.itemNumX)%this.pageNumY*this.itemNumX)]
                }
                else{
                    let column = Math.floor(Number(item.name) / this.itemNumX)
                    let row = Number(item.name) % this.itemNumX
                    this._itemPosition[item.name] = cc.v2(-this.content.width/2 +this.width/2+this.leftWidget+row*(this.width+this.interval),this.content.height/2-this.topWidget-(this.height/2+column*(this.height+this.interval)))
                    return this._itemPosition[item.name]
                }
            }
            else{
                if(this.scrollHorizontal){
                    this.content.width += item.width+this.interval
                    if(item.name == '0') this._itemPosition['0'] = cc.v2(item.width+this.leftWidget,0)
                    else this._itemPosition[item.name] = cc.v2(this._itemPosition[Number(item.name)-1].x+item.width+this.interval,0)
                    return cc.v2(this._itemPosition[item.name].x-item.width/2,0)
                }
                else{
                    this.content.height += item.height+this.interval
                    if(item.name == '0') this._itemPosition['0'] = cc.v2(0,-item.height-this.topWidget)
                    else  this._itemPosition[item.name] = cc.v2(0,this._itemPosition[Number(item.name)-1].y - item.height-this.interval)
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
                while(this._itemPosition[index].x < this.oriX - x ) {index++}
                return index
            }
            else{
                try{
                    while(-this._itemPosition[index].y < y-this.oriY) index ++
                    return index 
                }catch{ return -1}
            }
        }
    }
    private onceControl = true;
    private _isViewFull(){   
        if(!this.pageMode)
       { //-1:上边行不够   -2：下边行不够   -3：左边列不够    -4：右边列不够 
                cc.log('index = ',this._index,' itemposition ',this._itemPosition)
                if((this.scrollHorizontal) &&  (this._index >=0 &&(Number(this._itemDisplayingPool[0].name) % this.itemNumX>0) || this.cycle) && //不是第一列
                (this._itemPosition[String(this._index)].x - this._itemDisplayingPool[0].x-this._itemDisplayingPool[0].width/2 < 0 || this._findItemByname(this._itemDisplayingPool,String(this._index)) == null)) //需要显示的列序数小于已经加载的列序数
                    {cc.log('-3 = ');return -3;}
                else if((this.scrollHorizontal)&&this.itemNumX - 1 - this._index % this.itemNumX >= this.pageNumX && Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name) < this.itemNumX*this.itemNumY-1&& //不是最后几列
                this._itemDisplayingPool[this._itemDisplayingPool.length-1].x+this._itemDisplayingPool[this._itemDisplayingPool.length-1].width - this._itemPosition[String(this._index)].x < this.viewWidth) //加载出来的item与现在的item列数之差过小
                    {cc.log('-4 = ');return -4;}
                else if((this.scrollVertical)&& (Number(this._itemDisplayingPool[0].name) >= this.itemNumX || this.cycle)  && //不是第一行
                (this._findItemByname(this._itemDisplayingPool,String(this._index)) == null) || this._itemDisplayingPool[0].y - this._itemPosition[String(this._index)].y < 0 ) //需要显示的行序数小于已经加载的行序数
                    {cc.log('-1='+this._index);return -1;}   
                else if( (this.scrollVertical) && 
                ((Math.floor((this.itemNumY*this.itemNumX - 1-this._index)/this.itemNumX) >= this.pageNumY) && Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name) < this.itemNumX*this.itemNumY-1 )  //不是最后几行
                && this._itemPosition[String(this._index)].y+this._itemDisplayingPool[this._itemDisplayingPool.length-1].height - this._itemDisplayingPool[this._itemDisplayingPool.length-1].y <this.viewHeight) //加载出来的item与现在显示的item行数之差国小
                    {cc.log('-2=',);return -2}
                else {
                    cc.log('1 = ',);return 1;
                }
            
        }
        else{ //-4：往左滑 -3：往右滑 -2：往上滑 -1：往下滑
            if(this.onceControl&&this.scrollHorizontal&& Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name) % this.itemNumX < Math.min(this.itemNumX,this._data.length)-1 && //不是最后一篇
                this.content.x < -this.viewWidth*1/4){
                {cc.log('-4');this.onceControl = false;return -4}
            }
            else if(this.onceControl&&this.scrollHorizontal && Number(this._itemDisplayingPool[0].name) % this.itemNumX > 0 &&
                this.content.x > this.viewWidth/4)
               { cc.log('-3');this.onceControl = false;return -3}
            else if(this.onceControl&&this.scrollVertical && Math.floor(Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name) /this.itemNumX) < Math.min(this.itemNumY,this._data.length)-1 &&
                this.content.y > this.viewHeight/4)
                {cc.log('-2');this.onceControl = false;return -2}
            else if(this.onceControl&&this.scrollVertical && Math.floor(Number(this._itemDisplayingPool[0].name) /this.itemNumX) > 0 &&
                this.content.y < -this.viewHeight/4)
               { cc.log('-1 ');this.onceControl = false;return -1}
            else{
                if(Math.abs(this.content.x) < 0.01) {this.onceControl = true;}
                cc.log('1')
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
                if(flag == -4) this._initializePage(index+this.pageNumX)                
                else if(flag == -3) this._initializePage(index-this.pageNumX)                
                else if(flag == -2) this._initializePage(index+this.pageNumY*this.itemNumX)               
                else if(flag == -1) this._initializePage(index -this.pageNumY*this.itemNumX)                
                this.content.setPosition(0,0)
            }
        }
        else{
            while(flag < 0 ){
                this._itemDisplayingPool.sort((a,b)=>{
                    return Number(a.name) - Number(b.name)
                })
                var idLast = Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name)
                var idStart= Number(this._itemDisplayingPool[0].name)
                var columnNum = Math.floor(idLast/this.itemNumX - idStart /this.itemNumX)
                var rowNum = idLast%this.itemNumX - idStart % this.itemNumX
                if(flag + 3 > 0){
                    for(var i = rowNum; i>=0;i--){
                        if(columnNum > this.pageNumY && rowNum >this.pageNumX){
                            this._poolPut((flag+2)*(this._itemDisplayingPool.length-1))
                        }
                        this._poolGet((flag == -1?idStart:idLast)+(flag+1.5)*2*(-this.itemNumX+i),flag == -2)               
                        if(this.cycle) this.itemNumY++
                    }
                }
                else{
                    for(var i = columnNum;i >=0;i--){
                        this._poolGet((flag == -3?idStart:idLast)+(flag+3.5)*2*(-1+i*this.itemNumX),flag == -4)
                    }
                    if(this.cycle) this.itemNumX++
                    if(columnNum > this.pageNumY || rowNum > this.pageNumX){
                        for(var i = 0;i < this._itemDisplayingPool.length;i++){
                            if(((Number(this._itemDisplayingPool[i].name) - (flag == -3?idLast:idStart)) % this.itemNumX) == flag + 4) {
                                this._poolPut(i);
                                i--;
                            }
                        }
                    }
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
            this.content.height = this.viewHeight
            this.content.setPosition(0,0)
        }
        else if(this.adaptiveSize || this.cycle) {
            if(this.scrollHorizontal) this.content.anchorX = 0
            if(this.scrollVertical) this.content.anchorY = 1
            this.content.width = this.scrollVertical?this.viewWidth:60;
            this.content.height = this.scrollHorizontal?this.viewHeight:60;
            this.content.setPosition(this.scrollVertical?0:-this.viewWidth/2,this.scrollVertical?this.viewHeight/2:0)
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
        this._initializePage(0)
    }
    private _initializePage(num:number){ //输入要生成page的第一个item序号
        for(var i = 0;i < Math.min(this.itemNumX,this.pageNumX);i++){
            for(var j = 0; j < Math.min(this.itemNumY,this.pageNumY);j++){
                this._poolGet(num+i+j*this.itemNumX,true)
            }
        }
        while(this._itemDisplayingPool.length > 0 && this._isViewFull() < 0) {
            let pg = this._isViewFull() == -2 ? (Math.floor(Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name) / this.itemNumX)+1)*this.itemNumX:
            Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name)%this.itemNumX+1
            this._initializePage(pg)
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
        if(index > this.itemNumX*this.itemNumY - 1 || (index > this._data.length-1 && !this.cycle)) return
        if(this._findItemByname(this._itemDisplayingPool,String(index))!=null) return;
        if(this._pool.size()>0) {var item = this._pool.get();item.color = this.itemColor}
        else var item = this._creatrSingleItem();
        item.name = String(index)
        cc.log('create index='+item.name)
        if(this.cycle) index = this._cycleIndexProcess(index)
        try{
            item.getComponentInChildren(cc.RichText).string = typeof(this._data[index]) == 'string'?this._data[index] :''
            item.getChildByName('imgMsg').getComponent(cc.Sprite).spriteFrame = this._data[index] instanceof cc.SpriteFrame? this._data[index] : null
        }catch{}
        if(this._imgBg[index]) item.getComponent(cc.Sprite).spriteFrame = this._imgBg[index]
        this.pick.forEach(element => {
            if((Number(item.name)-Number(element))%this._data.length == 0) {
                item.color = cc.Color.RED}
         });
        this.content.addChild(item);
        item.getComponent('ListItem').itemOnLoad()
        item.setPosition(this._calculatePosition(item))
        flag?this._itemDisplayingPool.push(item):this._itemDisplayingPool.unshift(item)
        if(this.adaptiveSize || this.cycle) this.updateView()  
    }
    private _itemNumRenderByFrame = 12;
    private _pool = new cc.NodePool();
    private _itemDisplayingPool = [];
    private _createDone : boolean = false;
    update () {
        if(!this.messageMode){
            if(this._pool.size() >= this.pageNumX*this.pageNumY*3) this._createDone = true;
            if(!this._createDone) {
                let item = this._createItem().reverse()
                item.forEach(element => {
                    this._pool.put(element);
                });
            }
        }
        if(!this.cycle && !this.messageMode){
            if((-this.content.x+this.oriX) < -50 ||(-this.oriY+this.content.y) < -50) this._freshItem(); //上拉或左拉刷新
        }
        if(this.node.getComponent(cc.ScrollView).isScrolling() || this.node.getComponent(cc.ScrollView).isAutoScrolling()) this._loadScrollRecord();
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

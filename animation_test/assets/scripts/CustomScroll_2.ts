

const {ccclass, property,requireComponent} = cc._decorator;
import * as EventCenter from './eventCenter'
let eventCenter = new EventCenter.eventCenter
export {eventCenter}
@ccclass
// @requireComponent(cc.ScrollView)
export default class List extends cc.Component {


    @property(cc.Prefab)
    itemPrefab :cc.Prefab = null;
    @property(cc.SpriteFrame)
    viewBg :cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    barBg :cc.SpriteFrame = null;
    @property({
        displayName:'Page',
        tooltip:'翻页模式'
    })
    pageMode = false
    @property({
        displayName:'Vertical'
    })
    scrollVertical=true
    @property({
        displayName:'Horizontal'
    })
    scrollHorizontal=false
    @property({
        type:cc.Integer,
        displayName:'View Width X',
        tooltip:'X方向列表长度',

    })
    viewWidth:number = 100
    @property({
        type:cc.Integer,
        displayName:'View Height Y',
        tooltip:'Y方向列表长度',
    })
    viewHeight:number = 0
    @property({
        type:cc.Integer,
        min: 0,
        displayName:'Item Numbers Y',
        tooltip:'Y方向单元个数',
        visible(){
            return this.scrollVertical
        }
    })
    itemNumY:number = 1;
    @property({
        type:cc.Integer,
        min: 0,
        displayName:'Item Numbers X',
        tooltip:'X方向单元个数',
        visible(){
            return this.scrollHorizontal
        }
    })
    itemNumX:number = 1;
    @property({
        type:cc.Integer,
        min: 0,
        displayName:'Item Height Y',
        tooltip:'单元Y方向高度',
    })
    height:number = 80;
    @property({
        type:cc.Integer,
        min: 0,
        displayName:'Item Width X',
        tooltip:'单元X方向宽度',
    })
    width:number = 80;

    @property({
        type:cc.Integer,
        displayName:'Bar Width'
    })
    barWidth:number = 12

    view:cc.Node = new cc.Node();
    content :cc.Node = new cc.Node();

    pageNumX = 0;
    pageNumY = 0;
    pageNum = 0;
    oriY : number = 0;
    oriX : number = 0;

    //输入数据
    private _data:string[] = [];
    public loadData(data:any[] = [],transverse:boolean = false){
        if(data.length == 0) cc.error('input is empty')
        data.forEach(element => {
            this._data.push(String(element))
        });
        if(transverse) this._data.reverse()
        while(this._data.length < this.itemNumX*this.itemNumY){
            this._data.push('')
        } 
    }
    private _deleteList = []
    public deleteItem(){
        var length = this.pick.length;
        if(length == 0) return;
        this.pick.sort((a,b)=>{return Number(b)-Number(a)})
        cc.log('pick =',this.pick)
        for(var i = 0;i < this.pick.length;i++) {
            let name = this.pick[i];
            this._data.splice(Number(name),1)
            this._deleteList.push(this.pick[i]);
            let pickIndex = this._findItemByname(this._itemDisplayingPool,this.pick[i])
            if(pickIndex != null){
                this._itemDisplayingPool[pickIndex].color = cc.Color.GRAY
                this._pool.put(this._itemDisplayingPool[pickIndex])
            }
        };
        this.pick = []
    }
    public updateView(){   //删除后更新视图
        var min = Number(this._deleteList[this._deleteList.length-1])     
        cc.log('zuixiaozhi'+min)
            for(var i = 0;i<this._itemDisplayingPool.length;i++){

                if(min <= Number(this._itemDisplayingPool[i].name) ){
                    cc.log('谁大了'+this._itemDisplayingPool[i].name)
                    this._itemDisplayingPool[i].getComponentInChildren(cc.Label).string = this._data[Number(this._itemDisplayingPool[i].name)]
                }
            }
            for(var num = 0;num < this._deleteList.length;num++) this.content.addChild(this._pool.get())  
        this._deleteList = []
    }
    onLoad () {
        //setparams
        if(!this.scrollHorizontal) this.itemNumX = 1;
        if(!this.scrollVertical) this.itemNumY =1;
        let sprite = this.node.addComponent(cc.Sprite);
        sprite.spriteFrame = this.viewBg;
        this.node.width = 960;
        this.node.height = 640;
        //创建scroll view
        this._setScrollView();

        //创建scrollbar
        this._setBar();  
        //direction
    
    }
    start(){
        this.pageNumX = this.scrollHorizontal? Math.floor(this.view.width/this.width):1;
        this.pageNumY = this.scrollVertical? Math.floor(this.view.height/this.height):1;
        this.pageNum = this.pageNumX*this.pageNumY;
        this._freshItem();
        this._listen();
    }
    public pick = [];  //用于储存选中的item的 name
    private _listen(){
        eventCenter.on('select',(node)=>{
            node.forEach(element => {
                var flag = true;
                for(var i = 0;i < this.pick.length;i++){
                    if(this.pick[i] == element.name) flag = false
                    break;
                }
                if(!flag){
                    element.color = cc.Color.BLUE;
                    this.pick.splice(element.index,1)
                    cc.log('unpick  '+element.name)
                }
                else{
                    element.color = cc.Color.RED
                    this.pick.push(element.name)
                    cc.log('pick'+element.name)
                }
            });
        })
    }
    private _creatrSingleItem(){
        var labelNode = new cc.Node();
        var item = cc.instantiate(this.itemPrefab)
        item.color = cc.Color.GRAY
        item.addChild(labelNode)
        labelNode.addComponent(cc.Label)
        item.scaleX = this.width / item.width
        item.scaleY = this.height / item.height
        item.on(cc.Node.EventType.TOUCH_END,function(event){
                eventCenter.emit('select',event.target)
        },this)
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
    private _calculateIndex(x:number,y:number):number
    {
        return Math.floor((y - this.oriY) / this.height) * this.itemNumX + Math.floor((- x + this.oriX) / this.width)
    }
    private _isViewFull(){ 
        if(!this.pageMode)
       { //-1:上边行不够   -2：下边行不够   -3：左边列不够    -4：右边列不够 
            if((this.scrollHorizontal) &&  this._index >=0 &&(Number(this._itemDisplayingPool[0].name) % this.itemNumX) >0 && //不是第一列
            this._findItemByname(this._itemDisplayingPool,String(this._index-1)) == null ) //需要显示的列序数小于已经加载的列序数
            {cc.log('-3');return -3;}
            else if((this.scrollHorizontal)&&this.itemNumX - 1 - this._index % this.itemNumX >= this.pageNumX &&  //不是最后几列
            Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name)%this.itemNumX - this._index%this.itemNumX  < this.pageNumX) //加载出来的item与现在的item列数之差过小
            {cc.log('-4');return -4;}
            else if((this.scrollVertical)&& Number(this._itemDisplayingPool[0].name) >= this.itemNumX  && //不是第一行
            Math.floor(this._index/this.itemNumX-Number(this._itemDisplayingPool[0].name)/this.itemNumX) < 0) //需要显示的行序数小于已经加载的行序数
                {cc.log('-1==='+this._index);return -1;}   
            else if( (this.scrollVertical) && 
            ((this.itemNumY*this.itemNumX - 1-this._index)/this.itemNumX >= this.pageNumY)  //不是最后几行
            && Math.floor(Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name)/this.itemNumX-this._index / this.itemNumX) < this.pageNumY) //加载出来的item与现在显示的item行数之差国小
            {cc.log('-2========'+this._itemDisplayingPool[this._itemDisplayingPool.length-1].name);return -2}
            else {return 1;}}
        else{
            if(this.scrollHorizontal&& Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name) % this.itemNumX < this.itemNumX-1 && //不是最后一篇
                Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name) %this.itemNumX - this._index % this.itemNumX < this.viewWidth*3/4){
                return -4
            }
            else if(this.scrollHorizontal && Number(this._itemDisplayingPool[0].name) % this.itemNumX > 0 &&
                Number(this._itemDisplayingPool[0].name) %this.itemNumX - this._index % this.itemNumX > this.viewWidth/4)
                return -3
            else if(this.scrollVertical && Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name) /this.itemNumX < this.itemNumY-1 &&
                Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name) /this.itemNumX - this._index/this.itemNumX < this.viewHeight*3/4)
                return -2
            else if(this.scrollVertical && Number(this._itemDisplayingPool[0].name) /this.itemNumX > 0 &&
                Number(this._itemDisplayingPool[0].name) /this.itemNumX-this._index/this.itemNumX > this.viewHeight/4)
                return -1
            else
                return 0
        }
    }
    private _loadScrollRecord(){
        this._index = this._calculateIndex(this.content.x,this.content.y)
        // cc.log('index==='+this._index+'firstitem='+this._itemDisplayingPool[0].name)
        this.node.emit(`roll schedule ${this._index}`)   //抛出滚动进度事件
        //当开始位置比总的长度小则代表没加载完
        var flag = this._isViewFull()
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
                var posX = this._itemDisplayingPool[0].x
                var posY = this._itemDisplayingPool[0].y
                for(var i = rowNum; i>=0;i--){
                    if(columnNum > this.pageNumY && rowNum >this.pageNumX ){
                        this._poolPut(this._itemDisplayingPool.length-1)
                    }
                    this._poolGet(idStart-this.itemNumX+i,cc.v2(posX + i*this.width,posY + this.height),false)
                }  
            }
                if(flag == -2){
                    var posX = this._itemDisplayingPool[this._itemDisplayingPool.length-1].x
                    var posY = this._itemDisplayingPool[this._itemDisplayingPool.length-1].y
                    for(var i = rowNum;i>=0;i--){
                        if(columnNum > this.pageNumY && rowNum >this.pageNumX ){
                            this._poolPut(0)
                        }
                        this._poolGet(idLast+this.itemNumX-i,cc.v2(posX-i*this.width,posY-this.height),true)
                    }
                }                
                if(flag == -3){
                    var posX = this._itemDisplayingPool[0].x;
                    var posY = this._itemDisplayingPool[0].y
                    for(var i = columnNum;i >=0;i--){
                        this._poolGet(idStart-1+i*this.itemNumX,cc.v2(posX - this.width,posY - i * this.height),false)
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
                    var posX = this._itemDisplayingPool[this._itemDisplayingPool.length-1].x
                    var posY = this._itemDisplayingPool[this._itemDisplayingPool.length-1].y
                    for(var i = columnNum;i>=0;i--){
                        this._poolGet(idLast+1-i*this.itemNumX,cc.v2(posX+this.width,posY+i*this.height),true)
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

    private _freshItem(){
        cc.log('fresh')
        //初始化单元
        this.content.destroyAllChildren();
        this._pool.clear();
        this._itemDisplayingPool = [];
        this.pick = [];

        this.content.width = this.itemNumX*this.width
        this.content.height = this.itemNumY*this.height


        this.content.setPosition(this.content.width/2-this.viewWidth/2,-(this.content.height/2-this.viewHeight/2))        
        //设置参考位置
        this.oriX = this.content.x
        this.oriY = this.content.y
        this._initializePage(0);
    }
    private _initializePage(num:number){ //刷新一页
        for(var i = 0;i < this.pageNumX;i++){
            for(var j = 0; j < this.pageNumY;j++){
                this._poolGet(this.pageNumX*num+i+j*this.itemNumX,
                            cc.v2(-this.content.width/2+this.width/2+i*this.width,this.content.height/2-this.height/2-j*this.height),
                            true)
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
        // cc.log("delete "+this._itemDisplayingPool[index].name)
        this._pool.put(this._itemDisplayingPool[index]);
        this._itemDisplayingPool.splice(index,1)
    }
    private _poolGet(index:number,position:cc.Vec2,flag:boolean){
        if(this._findItemByname(this._itemDisplayingPool,String(index))!=null) return;
        if(this._pool.size()>0) {var item = this._pool.get();item.color = cc.Color.GRAY}
        else{
            var item = this._creatrSingleItem();
        }
        let itemLabel = item.getComponentInChildren(cc.Label)
        item.name = String(index)
        if(Number(item.name) < this._data.length-1) itemLabel.string = this._data[index]
        else itemLabel.string = ''
        this.pick.forEach(element => {
            if(element == item.name) {item.color = cc.Color.RED;}
        });
        item.setPosition(position)
        if(flag) this._itemDisplayingPool.push(item)
        else this._itemDisplayingPool.unshift(item)
        // cc.log('create ====='+itemLabel.string)
        this.content.addChild(item);
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
        this._loadScrollRecord();
        if((-this.content.x+this.oriX) < -50 ||(-this.oriY+this.content.y) < -50) this._freshItem(); //上拉或左拉刷新
        // cc.log('v2===='+(this.content.x-this.oriX)+(this.oriY-this.content.y))
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
            ScrollbarX.y = this.itemNumY>1? -this.view.height/2:this.view.height/2-this.height
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
            ScrollbarY.x = this.itemNumX>1? this.view.width/2:-this.viewWidth/2+this.width
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

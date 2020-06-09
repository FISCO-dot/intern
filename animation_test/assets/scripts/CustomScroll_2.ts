

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
    public deleteItem(node : cc.Node[] = []){
        var length = node.length;
        if(length == 0) return;
        node.forEach(element => {
            if(cc.isValid(element)){
                element.removeFromParent();
                element.destroy();
                this._creatrSingleItem();
            }
        });
        if(this.scrollVertical || this.scrollHorizontal){
            if(!this.scrollVertical){
                this.content.x -= length  *this.width/2;
                this.oriX -=  length  *this.width/2;
            }
            else if(!this.scrollHorizontal){
                this.content.y += length * this.height/2;
                this.oriY += length * this.height/2;
            }
            else {}
        }
    }
    onLoad () {
        //setparams
        if(!this.scrollHorizontal) this.itemNumX = 1;
        if(!this.scrollVertical) this.itemNumY =1;
        let sprite = this.node.addComponent(cc.Sprite);
        sprite.spriteFrame = this.viewBg;
        this.node.width = 960;
        this.node.height = 640
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
    }
    private _creatrSingleItem(){
        var labelNode = new cc.Node();
        var item = cc.instantiate(this.itemPrefab)
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
        //-1:上边行不够   -2：下边行不够   -3：左边列不够    -4：右边列不够 
        if((this.scrollHorizontal) && (Number(this._itemDisplayingPool[0].name) % this.itemNumX) >0 && this._index >0&&
        (this._index % this.itemNumX)<(Number(this._itemDisplayingPool[0].name) % this.itemNumX) ) 
        {cc.log('-3');return -3;}
        else if((this.scrollHorizontal)&&this.itemNumX - 1 - this._index % this.itemNumX >= this.pageNumX &&
        Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name)%this.itemNumX - this._index%this.itemNumX  < this.pageNumX) 
        {cc.log('-4');return -4;}
        else if((this.scrollVertical)&& Number(this._itemDisplayingPool[0].name) >= this.itemNumX  &&
        Math.floor(this._index/this.itemNumX-Number(this._itemDisplayingPool[0].name)/this.itemNumX) < this.pageNumY-1) 
            {cc.log('-1==='+this._index);return -1;}   
        else if( (this.scrollVertical) && 
        ((this.itemNumY*this.itemNumX - 1-this._index)/this.itemNumX >= this.pageNumY)
        && Math.floor(Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name)/this.itemNumX-this._index / this.itemNumX) < this.pageNumY) 
            {cc.log('-2========'+this._itemDisplayingPool[this._itemDisplayingPool.length-1].name);return -2}
        else {return 1;}
    }
    private _loadScrollRecord(){
        this._index = this._calculateIndex(this.content.x,this.content.y)
        // cc.log('idnex==='+this._index)
        
        this.node.emit(`roll schedule ${this._index}`)   //抛出滚动进度事件
        //当开始位置比总的长度小则代表没加载完
        var flag = this._isViewFull()
        while(flag < 0 && Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name) +1 < (this.itemNumX * this.itemNumY) )//
        {
            this._itemDisplayingPool.sort((a,b)=>{
                return Number(a.name) - Number(b.name)
            })
            var idLast = Number(this._itemDisplayingPool[this._itemDisplayingPool.length-1].name)
            var idStart= Number(this._itemDisplayingPool[0].name)
            var columnNum = Math.floor(idLast/this.itemNumX - idStart /this.itemNumX)
            var rowNum = idLast%this.itemNumX - idStart % this.itemNumX
            if(flag == -1){
                cc.log('0是多少啊'+this._itemDisplayingPool[0].name)
                var posX = this._itemDisplayingPool[0].x
                var posY = this._itemDisplayingPool[0].y
                for(var i = rowNum; i>=0;i--){
                    if(columnNum > this.pageNumY && rowNum >this.pageNumX){
                        cc.log('delete '+this._itemDisplayingPool[this._itemDisplayingPool.length-1].name)
                        this._pool.put(this._itemDisplayingPool[this._itemDisplayingPool.length-1])
                        this._itemDisplayingPool.splice(this._itemDisplayingPool.length-1,1)
                    }
                    if(this._pool.size()>0) var item = this._pool.get();
                    else{
                        var item = this._creatrSingleItem();
                    }
                    let itemLabel = item.getComponentInChildren(cc.Label)
                    item.name = String(idStart-this.itemNumX+i)
                    itemLabel.string = this._data[idStart-this.itemNumX+i]
                    item.setPosition(posX + i*this.width,posY + this.height)
                    this._itemDisplayingPool.unshift(item)
                    this.content.addChild(item);
                    cc.log('name======'+item.name+'positon==='+item.position+'id=========='+idStart)

                }  
            }
                if(flag == -2){
                    var posX = this._itemDisplayingPool[this._itemDisplayingPool.length-1].x
                    var posY = this._itemDisplayingPool[this._itemDisplayingPool.length-1].y
                    for(var i = rowNum;i>=0;i--){
                        if(columnNum > this.pageNumY && rowNum >this.pageNumX){
                            cc.log('delete '+this._itemDisplayingPool[0].name)
                            this._pool.put(this._itemDisplayingPool[0])
                            this._itemDisplayingPool.splice(0,1)
                        }
                        if(this._pool.size()>0) var item = this._pool.get();
                        else{
                            var item = this._creatrSingleItem();
                        }
                        let itemLabel = item.getComponentInChildren(cc.Label)
                        item.name = String(idLast+this.itemNumX-i)
                        if(Number(item.name) < this._data.length-1) itemLabel.string = this._data[idLast+this.itemNumX-i]
                        else itemLabel.string = ''
                        item.setPosition(posX-i*this.width,posY-this.height)
                        this._itemDisplayingPool.push(item)
                        this.content.addChild(item);
                    }
                }                
                if(flag == -3){
                    var posX = this._itemDisplayingPool[0].x;
                    var posY = this._itemDisplayingPool[0].y
                    for(var i = columnNum;i >=0;i--){
                        if(this._pool.size()>0) var item = this._pool.get();
                        else{
                            var item = this._creatrSingleItem();
                        }
                        let itemLabel = item.getComponentInChildren(cc.Label)
                        item.name = String(idStart-1+i*this.itemNumX)
                        itemLabel.string = this._data[idStart-1+i*this.itemNumX]
                        item.setPosition(posX - this.width,posY - i * this.height)
                        this._itemDisplayingPool.unshift(item)
                        this.content.addChild(item);
                    }
                    if(columnNum > this.pageNumY &&rowNum > this.pageNumX)
                    {for(var i = 0;i < this._itemDisplayingPool.length;i++){
                        if(((Number(this._itemDisplayingPool[i].name) - idLast) % this.itemNumX) == 0 ){
                            cc.log("delete "+this._itemDisplayingPool[i].name)
                            this._pool.put(this._itemDisplayingPool[i])
                            this._itemDisplayingPool.splice(i,1)
                            i--;
                        }
                    }} 
                }
                if(flag == -4){
                    var posX = this._itemDisplayingPool[this._itemDisplayingPool.length-1].x
                    var posY = this._itemDisplayingPool[this._itemDisplayingPool.length-1].y
                    for(var i = columnNum;i>=0;i--){
                        if(this._pool.size()>0) var item = this._pool.get();
                        else{
                            var item = this._creatrSingleItem();
                        }
                        let itemLabel = item.getComponentInChildren(cc.Label)
                        item.name = String(idLast+1-i*this.itemNumX)
                        if(Number(item.name) < this._data.length-1) itemLabel.string = this._data[idLast+1-i*this.itemNumX]
                        else itemLabel.string = ''
                        item.setPosition(posX+this.width,posY+i*this.height)
                        this._itemDisplayingPool.push(item)
                        this.content.addChild(item);
                    }
                    if(columnNum > this.pageNumY &&rowNum > this.pageNumX)
                    {for(var i = 0;i < this._itemDisplayingPool.length;i++){
                        if(((Number(this._itemDisplayingPool[i].name) - idStart) % this.itemNumX) == 0 ){
                            cc.log("delete "+this._itemDisplayingPool[i].name)
                            this._pool.put(this._itemDisplayingPool[i])
                            this._itemDisplayingPool.splice(i,1)
                            i--;
                        }
                    }}       
                }
                flag = this._isViewFull();
        }

        
        // this.content.getComponent(cc.Layout).updateLayout()
        // cc.log(`content y===${this.content.y}oriY ====${this.oriY}`)
        // cc.log(`contnt x===${this.content.x}oriX === ${this.oriX}`)
    }

    private _freshItem(){
        cc.log('fresh')
        //初始化单元
        this.content.destroyAllChildren();
        this._pool.clear();
        this._itemDisplayingPool = [];
        this.content.width = this.itemNumX*this.width
        this.content.height = this.itemNumY*this.height
        this.content.setPosition(this.content.width/2-this.viewWidth/2,-(this.content.height/2-this.viewHeight/2))        
        //设置参考位置
        this.oriX = this.content.x
        this.oriY = this.content.y
        this._initializePage();
    }
    private _initializePage(){
        for(var i = 0;i < this.pageNumX;i++){
            for(var j = 0; j < this.pageNumY;j++){
                let item = this._pool.size()>0?this._pool.get():this._creatrSingleItem();
                let itemLabel = item.getComponentInChildren(cc.Label)
                item.name = String(i+j*this.itemNumX)
                itemLabel.string = this._data[i+j*this.itemNumX]
                item.setPosition(-this.content.width/2+this.width/2+i*this.width,this.content.height/2-this.height/2-j*this.height)
                this._itemDisplayingPool.push(item)
                this.content.addChild(item)
            }
        }
    }
    private _deleteReduntItem(num:number){
        //0删除上面的行 1删除左面的列 2删除下面的行 3删除右面的列
        if(num == 0) {
            cc.log('delete 上面行')
            cc.log('头一个是'+this._itemDisplayingPool[0].name)
            while(this._index/this.itemNumX - Number(this._itemDisplayingPool[0].name)/this.itemNumX > 2*this.pageNumY){
                cc.log("delete "+ this._itemDisplayingPool[0].name)
                this._pool.put(this._itemDisplayingPool[0]);
                this._itemDisplayingPool.splice(0,1);  
            }
            
        }
        // else if(num == 1){
        //     cc.log('delete左列 ')
        //     cc.log('头一个是'+this._itemDisplayingPool[0].name)
        //     var itemToDelete = []
        //     for(var i = 0 ;;i += (this._itemDisplayingPool.length)/this.itemNumX){
        //         if(this._itemDisplayingPool[i]%this.itemNumX > 2*this.pageNumX){
        //             this._pool.put(this._itemDisplayingPool[i])
        //             this._itemDisplayingPool.splice(i,1)
        //         }
        //         else
        //     }

        // }
        else if(num == 2){
            cc.log('delete 下行')
            cc.log('尾一个是'+this._itemDisplayingPool[this._itemDisplayingPool.length-1].name)
            for(var i= 1;i<this._itemDisplayingPool.length-1;i++){
                if(Math.abs(this._itemDisplayingPool[i].y - this._itemDisplayingPool[this._itemDisplayingPool.length-1].y) < this.height/2){
                    cc.log(`delete  ${this._itemDisplayingPool[i].name}`)
                    this._pool.put(this._itemDisplayingPool[i])
                    this._itemDisplayingPool.splice(i,1)
                    
                }
            }
            this._pool.put(this._itemDisplayingPool[this._itemDisplayingPool.length-1])
            this._itemDisplayingPool.splice(this._itemDisplayingPool.length-1,1);
            
        }
        else{
            cc.log('delete 右列')
            cc.log('尾一个是'+this._itemDisplayingPool[this._itemDisplayingPool.length-1].name)
            for(var i= 1;i<this._itemDisplayingPool.length-1;i++){
                if(Math.abs(this._itemDisplayingPool[i].x - this._itemDisplayingPool[this._itemDisplayingPool.length-1].x) < this.width/2){
                    cc.log(`delete  ${this._itemDisplayingPool[i].name}`)
                    this._pool.put(this._itemDisplayingPool[i])
                    this._itemDisplayingPool.splice(i,1)
                   
                }
            }
            this._pool.put(this._itemDisplayingPool[this._itemDisplayingPool.length-1])
            this._itemDisplayingPool.splice(this._itemDisplayingPool.length-1,1);
            
        }
        cc.log('还剩几个？'+this._itemDisplayingPool.length)
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

        if((-this.content.x+this.oriX)+(-this.oriY+this.content.y) < -100) this._freshItem();
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
        scrollView.elastic =true
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
        scrollView.elastic = true;
    }
   
}

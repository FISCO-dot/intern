

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

    createFromIndex = 0;
    pageNumX = 0;
    pageNumY = 0;
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
        //设置layout
        this._setLayout();
        //创建scrollbar
        this._setBar();  
        //direction
    
    }
    start(){
        this.pageNumX = this.scrollHorizontal? Math.floor(this.view.width/this.width):1;
        this.pageNumY = this.scrollVertical? Math.floor(this.view.height/this.height):1;
        this._freshItem();
    }
    private _creatrSingleItem(){
        var labelNode = new cc.Node();
        var item = cc.instantiate(this.itemPrefab)
        item.name = String(this.createFromIndex)
        item.addChild(labelNode)
        let itemLabel = labelNode.addComponent(cc.Label)
        if(this.createFromIndex < this._data.length) itemLabel.string = this._data[this.createFromIndex]
        else itemLabel.string = ''  //删除了之后可能会产生长度不够，用空补全
        item.scaleX = this.width / item.width
        item.scaleY = this.height / item.height
        this.content.addChild(item)
        item.on(cc.Node.EventType.TOUCH_END,function(event){
                eventCenter.emit('select',event.target)
        },this)

        if(!(this.scrollVertical && this.scrollHorizontal))  {  //当为grid时kayout.typr = children，content的size已经被设定，不需要动态改变
            if(this.itemNumY > 1){//itemNumY =1 时不改变y的位置
                this.content.y -= this.height / 2;
                this.oriY -= this.height / 2
            }
            //先排x后排y，因此超过了itemx就不用更改x位置了
            if(this.createFromIndex < this.itemNumX ){
                cc.log(`index${this._index}lentth${length}itemX${this.itemNumX}`)
                this.content.x += this.width / 2;
                this.oriX += this.width / 2
            }
        } 
        this.createFromIndex++;
    }
    private _createItem(startIndex:number){

        if(startIndex + (this.pageNumX * this.pageNumY) * 3> this.itemNumX * this.itemNumY)
        {
            //超过数据范围的长度
            var length = this.itemNumX * this.itemNumY - startIndex;
        }

        else var length = 3 *(this.pageNumX * this.pageNumY)
        
        for(var i = 0;i<length;i++){
            this._creatrSingleItem();
        }
        this.content.getComponent(cc.Layout).updateLayout()
        // cc.log(`width====${this.content.width}heigth===${this.content.height}`)
 
    }
    private _index:number = 0;  //本list中item的代号
    private _calculateIndex(x:number,y:number):number
    {
        return Math.floor((y - this.oriY) / this.height) * this.itemNumX + Math.floor((- x + this.oriX) / this.width)
    }
    private _loadScrollRecord(){
        let scrollView = this.node.getComponent(cc.ScrollView)
        cc.log(`content y===${this.content.y}oriY ====${this.oriY}`)
        cc.log(`contnt x===${this.content.x}oriX === ${this.oriX}`)
        
        this._index = this._calculateIndex(this.content.x,this.content.y)
        // cc.log(this._index+'    '+this.createFromIndex)
        this.node.emit(`roll schedule ${this._index}`)   //抛出滚动进度事件
        //向下加载数据
        //当开始位置比总的长度小则代表没加载完
         if(this.createFromIndex  < (this.itemNumX * this.itemNumY)    &&
         (this.createFromIndex -1 - this._index <= 2*(this.pageNumX * this.pageNumY)) )//剩余item数量小于1个PAGE的数量且未显示完就继续加载，由于是按行加载，对列数多的缓冲效果没有对行多的好
        {
            this._createItem(this.createFromIndex);
            cc.log(`width${this.content.width}x${this.content.x}`)
        }
        
    }

    private _freshItem(){
        cc.log('fresh')
        //初始化单元
        this.content.destroyAllChildren();
        this.createFromIndex = 0;
        this._createItem(this.createFromIndex);
        this.content.setPosition(this.content.width/2-this.viewWidth/2,-(this.content.height/2-this.viewHeight/2))
        //设置参考位置
        this.oriY = this.content.position.y
        this.oriX = this.content.position.x
    }
    

    update (dt) {
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
            ScrollbarX.y = this.itemNumY>1? -this.view.height/2:(this.view.height-this.content.height)/2-this.height/2
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
            ScrollbarY.x = this.itemNumX>1? this.view.width/2:this.content.width/2-this.viewWidth/2+this.width/2
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
    private _setLayout(){
        let layout = this.content.addComponent(cc.Layout)
        layout.resizeMode = 1;//container
        layout.affectedByScale = true
        if(this.scrollVertical||this.scrollHorizontal){
            if(!this.scrollVertical) {
                layout.type = 1;
                layout.spacingX = 0;
                layout.paddingLeft = 0;
                layout.paddingRight = 0;
            }
            else if(!this.scrollHorizontal){
                layout.type = 2
                layout.spacingY = 0;
                layout.paddingTop = 0;
                layout.paddingBottom = 0;
            }
            else{
                layout.type = 3
                layout.resizeMode =2 ;
                layout.startAxis = 0//行多horizontal列多verticle  
                layout.cellSize.height = this.height;
                layout.cellSize.width = this.width;
                layout.startAxis = 0;
                layout.spacingX = 0;
                layout.paddingLeft = 0;
                layout.paddingRight = 0;
                layout.spacingY = 0;
                layout.paddingTop = 0;
                layout.paddingBottom = 0;
                this.content.width = this.width * this.itemNumX
                this.content.height = this.height * this.itemNumY
                // cc.log(`JINLAIle--width====${this.content.width}heigth===${this.content.height}`)
            }
        }
        else{
            layout.type = 0;
        }
    }
}

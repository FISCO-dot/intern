let layoutType = cc.Enum({
    x: 0,
    y: 1,
    grid:2
});

const {ccclass, property} = cc._decorator;

@ccclass
export default class CustomScroll extends cc.Component {


    @property(cc.Prefab)
    itemPrefab :cc.Prefab = null;
    @property(cc.SpriteFrame)
    viewBg :cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    barBg :cc.SpriteFrame = null;
    @property({
        type:cc.Integer,
        displayName:'View Length',
        tooltip:'垂直于滚动方向的长度'
    })
    viewWidth:number = 0
    @property({
        type:cc.Integer,
        min: 0,
        displayName:'Item Numbers On A Page'
    })
    pageNum:number = 8;
    @property({
        type:cc.Integer,
        min: 0,
        displayName:'Item Length',
        tooltip:'滚动方向长度'
        
    })
    height:number = 80;
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
        displayName:'Bar Width'
    })
    barWidth:number = 12

    view:cc.Node = new cc.Node();
    content :cc.Node = new cc.Node();
    scrollBar:cc.Node = new cc.Node();
    bar:cc.Node = new cc.Node();

    index:number = 0;
    createFromIndex = 0;
    oriY : number = 0;
    oriX : number = 0;
    // LIFE-CYCLE CALLBACKS:


    onLoad () {
        //setparams
        let sprite = this.node.addComponent(cc.Sprite);
        sprite.spriteFrame = this.viewBg;
        this.node.width = 960;
        this.node.height = 640
        //创建scroll view
        let scrollView = this.node.addComponent(cc.ScrollView);
        this.node.addChild(this.view)
        this.view.addChild(this.content)
        this.view.addComponent(cc.Mask)
        
        
        scrollView.content = this.content;

        let layout = this.content.addComponent(cc.Layout)
        layout.resizeMode = 1;//container

        
        //创建scrollbar
        this.node.addChild(this.scrollBar);
        let barComponent= this.scrollBar.addComponent(cc.Scrollbar)
        scrollView.verticalScrollBar = barComponent
        this.scrollBar.addChild(this.bar);
        let barSprite = this.bar.addComponent(cc.Sprite)
        barSprite.spriteFrame = this.barBg;
        barComponent.handle = barSprite
         
        //setparams

        //direction
        scrollView.vertical = this.scrollVertical;
        scrollView.horizontal = this.scrollHorizontal;
        if(this.scrollVertical && this.scrollHorizontal) {
            this._setVerticleBar(2)
            layout.type = 3;
            let horizontalBar = cc.instantiate(this.scrollBar)
            this.node.addChild(horizontalBar)
            scrollView.horizontalScrollBar = horizontalBar.getComponent(cc.Scrollbar)
            horizontalBar.getComponent(cc.Scrollbar).direction = 0;


        }
        else if(this.scrollVertical && !this.scrollHorizontal) {
            this.view.width = this.viewWidth;
            this.content.width = this.viewWidth-this.barWidth
            this.content.x = -this.barWidth;
            this.content.height = this.pageNum*this.height
            this.view.height = this.content.height
            layout.type = 2;
            barComponent.direction = 1;
            layout.spacingY = 0;
            layout.paddingTop = 0;
            layout.paddingBottom = 0;
            this._setVerticleBar(1)
        }
        else if(!this.scrollVertical && this.scrollHorizontal) {
            cc.log('-1-1-')
            this.view.height = this.viewWidth
            this.content.height = this.viewWidth
            this.content.y = this.barWidth
            this.content.width = this.pageNum*this.height
            this.view.width = this.content.width
            layout.type = 1;
            barComponent.direction = 0;
            layout.spacingX = 0;
            layout.paddingLeft = 0;
            layout.paddingRight = 0;
            this._setVerticleBar(0)
        }
        else layout.type = 0;

        //bar params

        

    }

    start(){
        this.createFromIndex = 0;
        this._createItem(this.createFromIndex);
        if(this.scrollVertical) this.content.setPosition(0,-this.content.height)
        if(this.scrollHorizontal) this.content.setPosition(this.content.width,0)
        this.oriY = this.content.position.y
        this.oriX = this.content.position.x
    }
    private _createItem(startIndex:number){

        if(startIndex + this.pageNum * 3>100)
        {
            //超过数据范围的长度
            var length = 100-startIndex;
        }
        else var length = 3*this.pageNum
        for(var i = 0;i<length;i++){
          var labelNode = new cc.Node();
          var item = cc.instantiate(this.itemPrefab)
          if(this.scrollVertical) item.height = this.height
          if(this.scrollHorizontal) item.width = this.height
          item.addChild(labelNode)
          let itemLabel = labelNode.addComponent(cc.Label)
          itemLabel.string = String(startIndex+i)
          this.content.addChild(item)
      }
      this.createFromIndex += length; 
      if(this.scrollVertical){
        this.content.y -= length /2 *this.height;
        this.oriY -= length /2 *this.height;
      }
      if(this.scrollHorizontal){
        this.content.x += length /2 *this.height;
        this.oriX += length /2 *this.height;
      }
      cc.log(`jinlail----index${this.index}lentth${length}`)
    }
    private _loadScrollRecord(){
        let scrollView = this.node.getComponent(cc.ScrollView)
        if(this.scrollVertical) this.index = Math.floor((this.content.position.y-this.oriY) / this.height)
        if(this.scrollHorizontal) this.index = Math.floor((this.oriX - this.content.position.x) / this.height)
        //向下加载数据
        //当开始位置比value_set的长度小则代表没加载完
         if(this.index  < 100 &&
            this.createFromIndex - this.index <= this.pageNum)//content小于1个PAGE的高度
        {
	        //_autoScrolling在引擎源码中负责处理scrollview的滚动动作
            if(scrollView.isAutoScrolling){ //等自动滚动结束后再加载防止滚动过快，直接跳到非常后的位置
                scrollView.elastic = false; //关闭回弹效果 美观
                
            }
            this._createItem(this.createFromIndex);
            return;
        }

    }
    public setScrollViewParams(bg,width,height,direction,prefab){

    }

    private _setVerticleBar(direction:number){
        //bar params
        if(direction == 1)
        {
            this.scrollBar.x = this.viewWidth/2
            this.scrollBar.height = this.view.height
            this.scrollBar.width = this.barWidth;
        }
        else if(direction == 0 ){
            this.scrollBar.y = -this.view.height/2
            this.scrollBar.height = this.barWidth
            this.scrollBar.width = this.viewWidth
       }
       else{

       }

    }

    

    update (dt) {
        this._loadScrollRecord();
        cc.log('------+++'+this.index)
    }
}

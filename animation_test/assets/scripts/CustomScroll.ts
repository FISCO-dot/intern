

const {ccclass, property} = cc._decorator;

@ccclass
export default class CustomScroll extends cc.Component {


    @property(cc.Prefab)
    itemPrefab :cc.Prefab = null;
    @property(cc.SpriteFrame)
    viewBg :cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    barBg :cc.SpriteFrame = null;

    view:cc.Node = null;
    content :cc.Node = null;
    scrollBar:cc.Node = null;
    bar:cc.Node = null;

    index = 0;
    createToIndex = 0;
    oriY : number = 0;
    pageNum:number = 0;
    height:number = 0;
    // LIFE-CYCLE CALLBACKS:


    onLoad () {
        //setparams
        let sprite = this.node.addComponent(cc.Sprite);
        sprite.spriteFrame = this.viewBg;

        //创建scroll view
        let scrollView = this.node.addComponent(cc.ScrollView);
        this.node.addChild(this.view)
        this.view.addChild(this.content)
        this.view.addComponent(cc.Mask)
        this.view.width = this.node.width;
        this.view.height = this.node.height
        scrollView.content = this.content;
        let layout = this.content.addComponent(cc.Layout)

        
        //创建scrollbar
        this.node.addChild(this.scrollBar);
        let barComponent= this.scrollBar.addComponent(cc.Scrollbar)
        scrollView.verticalScrollBar = barComponent
        this.scrollBar.addChild(this.bar);
        let barWidget = this.scrollBar.addComponent(cc.Widget)
        barWidget.isAlignBottom = true;
        barWidget.isAlignTop = true;
        barWidget.isAlignRight = true;
        barWidget.top = 0;
        barWidget.right = 0;
        barWidget.bottom = 0;


        //setparams
        this.pageNum = 8;

            //vertical =1
        scrollView.vertical = true;
        barComponent.direction = 1;
        layout.type = 1
            //bar params
        this.scrollBar.width = 12;
        let barSprite = this.bar.addComponent(cc.Sprite)
        barSprite.spriteFrame = null;
        barComponent.handle = barSprite
            //layout params :container = 1
        layout.resizeMode = 1
        layout.spacingY = 20;
        layout.paddingTop = 0;
        layout.paddingBottom = 0;

    }
    start(){
        this.index = 0;
        this.createToIndex = 0;
        this.oriY = this.content.position.y
        this._createItem(this.createToIndex);
    }
    private _createItem(startIndex:number){
        for(var i = 0;i<this.pageNum*3;i++){
          var item = cc.instantiate(this.itemPrefab)
          var itemLabel = item.addComponent(cc.Label)
          itemLabel.string = String(startIndex+i)
          this.content.addChild(item)
      }
    }
    private _loadScrollRecord(){
        //向下加载数据
        //当开始位置比value_set的长度小则代表没加载完
         if(this.index + this.pageNum * 3 < 100 &&
          this.star-this.index  <  this.pageNum>)//content超过2个PAGE的高度
        {
	        //_autoScrolling在引擎源码中负责处理scrollview的滚动动作
            if(this.scrollView.isAutoScrolling){ //等自动滚动结束后再加载防止滚动过快，直接跳到非常后的位置
                this.scrollView.elastic = false; //关闭回弹效果 美观
                return;
            }
            var down_loaded = this.pageNum; 
            this.startIndex += down_loaded;
            
            if(this.startIndex + this.pageNum * 3>this.valueSet.length)
            {
                //超过数据范围的长度
                var out_len = this.startIndex + this.pageNum * 3 - this.valueSet.length;
                down_loaded -= out_len;
                this.startIndex -= out_len;
            }
            this.load_recode(this.startIndex);
            this.content.position.y -= down_loaded * this.high;
            return;
        }
        //向上加载
        if(this.startIndex>0 && this.content.position.y<=this.startY)
        {
            if(this.scrollView.isAutoScrolling){ 
                this.scrollView.elastic = false;
                return;
             }
            var up_loaded = this.pageNum;
            this.startIndex -= up_loaded;
            if(this.startIndex<0){
                up_loaded +=this.startIndex;
                this.startIndex=0;
            }
            this.load_recode(this.startIndex);
            this.content.position.y += up_loaded * this.high;
        }
    }
    public setScrollViewParams(bg,width,height,direction,prefab){

    }

    public set

    // update (dt) {}
}

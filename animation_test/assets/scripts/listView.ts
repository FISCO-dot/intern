

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property({
        type:cc.ScrollView
    })
    scrollView:cc.ScrollView = null;
    @property({
        type:cc.Prefab
    })
    itemPrefab:cc.Prefab = null;


    high : number=80;
    pageNum :number = 8;
    valueSet = [];
    content : cc.Node = null;
    optItemSet = [];
    startIndex : number = 0;
    startY : number = 0;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        for(var i=1;i<=100;i++)
        {
            this.valueSet.push(i);
        }
        this.content = this.scrollView.content;
        cc.log('1111-----'+ this.scrollView.content)
        this.optItemSet = [];
        //每次加载3页
        for(var i=0;i<this.pageNum*3;i++)
        {
            var item = cc.instantiate(this.itemPrefab);
            this.content.addChild(item);
            this.optItemSet.push(item);
        }
        this.scrollView.node.on("scroll-ended",this.on_scroll_ended.bind(this),this);//监听scrollview事件


    }

    start () {
        this.startY = this.content.position.y;//初始化起始y坐标
        this.startIndex = 0; //100项数据里面的起始数据记录索引
        this.load_recode(this.startIndex);

    }
    load_recode(startIndex){
        this.startIndex=startIndex;
         for(var i = 0;i<this.pageNum*3;i++){
           var label = this.optItemSet[i].getChildByName("label").getComponent(cc.Label);
            //显示记录
           label.string = this.valueSet[this.startIndex+i];
       }
    }

    load_scroll_recode(){
        //向下加载数据
        //当开始位置比value_set的长度小则代表没加载完
         if(this.startIndex + this.pageNum * 3 < this.valueSet.length &&
          this.content.position.y >= this.startY + this.pageNum * 2 * this.high)//content超过2个PAGE的高度
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
    on_scroll_ended(){
        this.load_scroll_recode();
        this.scrollView.elastic = true; //加载结束后自动滚动回弹开启
    }
     update (dt) {
       this.load_scroll_recode();
    }

}

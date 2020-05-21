import CustomAnimation from './CustomAnimation'
let onLoadedType = cc.Enum({
    autoPlay: 1,
    doNotAutoPlay: 0,
});
const {ccclass, property,disallowMultiple,playOnFocus,executeInEditMode} = cc._decorator;
@ccclass
@disallowMultiple
@executeInEditMode
@playOnFocus
export default class CustomAnimationComponent extends cc.Component {
    
    @property({type:cc.SpriteFrame})
    private _spriteFrame: cc.SpriteFrame = null;
    @property({tooltip:"动画预览", type:cc.SpriteFrame})
    set spriteFrame(v : cc.SpriteFrame) {
        this._spriteFrame = v;
    }
    get spriteFrame() {
        return this._spriteFrame;
    }
    @property({type:cc.Integer})
    private _frameTag: number = 0
    @property({
        type:cc.Integer,
        min:0,
        displayName:'Frame Tag'
    })
    get frameTag():number{
        return this._frameTag
    }
    set frameTag(value:number){                         //修改frametag预览某一帧的图片,没有sprite时要先set frametag再set defalutPlay 
        var def_anim = this.customAnimation[this._defaultPlay]
        if(value < def_anim._startFrame) value =def_anim._startFrame
        if(value > def_anim._endFrame) value = def_anim._endFrame
        this._frameTag = value;  
        this._spriteFrame = def_anim._SpriteAtlas.getSpriteFrames()[this._frameTag]
        this.onLoad();
        this.sprite.spriteFrame = this._spriteFrame
        cc.log('framg' + this.sprite.spriteFrame.name)
    }
    @property({
        type:cc.Enum(onLoadedType)
    })
    playOnLoad = onLoadedType.autoPlay;                   //是否运行后自动播放
    @property({type:cc.Integer})
    private _defaultPlay : number = 0;
    @property({
        type: cc.Integer,
        min: 0,
        displayName: "default animation"
    })
    get defaultPlay():number{
        return this._defaultPlay;
    }
    set defaultPlay(v:number){                              //修改defalut后播放一次
        if(v > this.customAnimation.length-1) v = this.customAnimation.length-1;
        this._defaultPlay = v;
        this.onLoad();
        this.play(this.defaultPlay,1)
    }                                    
    @property(CustomAnimation)                                              
    customAnimation : CustomAnimation[] = []
    sprite: cc.Sprite = null;
    no_frame: boolean = false;
    frames :cc.SpriteFrame[] = []
    framesToPlay:cc.SpriteFrame[] = []
    playing : boolean = false;
    total_time : number = 0;
    timeLine:number = 0;
    anim : CustomAnimation = null;
    timesDone: number = 0;
    loopTime:number=0;
    beginFrame:number = 0;
    index:number = 0;
    seed :boolean= false;
    stopFrameIndex:number = 0;
    stopLoopCount :number =1;
    loopFrom:number = 0;
    onLoad(){        
        if(!this.sprite){
            this.sprite = this.addComponent(cc.Sprite);
        }
        this.sprite = this.getComponent(cc.Sprite);
        
        this.anim = this.customAnimation[this._defaultPlay]
        this.loopTime = this.anim.looptime;
        this.beginFrame=this.anim._startFrame;
        this.frames = this.anim._SpriteAtlas.getSpriteFrames().slice(this.beginFrame);
        this.sprite.spriteFrame = this.frames[this.beginFrame]; 
        this.initializeFrame();
        if(this.playOnLoad == 1 )
        {
            this.playing = true;
        }
    }
    initialize(){
        this.playing = false;
        this.no_frame = false;
        this.total_time  = 0;
        this.timeLine = 0;
        this.timesDone = 0;
        this.seed = false;
        this.stopFrameIndex = 0;
        this.stopLoopCount  =1;
        this.framesToPlay = [];
        this.loopFrom = 0;
    }
    initializeFrame(){                      //将图片压入即将播放的队列
        if (this.frames.length <= 0) {
            this.no_frame = true;
            return;
        }
        
        if(this.loopTime == 0) {
            this.loopFrom = this.framesToPlay.length
            
            this.framesToPlay = this.framesToPlay.concat(this.frames)
            cc.log('frametoplay'+this.framesToPlay.length)
        }
        else{
            for(var i = this.loopTime;i>0;i--){
                this.framesToPlay = this.framesToPlay.concat(this.frames)
            }
        }

    }
    play(animationIndex:number,loop:number,beginFrame:number=0,reverse:boolean = false){           //loop = 0为循环，loop >0 为循环次数
        this.initialize()
        this.anim = this.customAnimation[animationIndex]       
        if(beginFrame >= this.anim._SpriteAtlas.getSpriteFrames().length) cc.error('begin Frame too big') 
        this.frames = (!reverse) ? this.anim._SpriteAtlas.getSpriteFrames().slice(beginFrame):this.anim._SpriteAtlas.getSpriteFrames().slice(0,beginFrame).reverse()
        this.beginFrame = beginFrame
        this.loopTime = loop
        this.initializeFrame()
        this.playing = true
    }
    playAdditive(animationIndex:number,loop:number,beginFrame:number=0,reverse:boolean =false){  //在播放现有动画后继续播放，如果正在播放的为循环则直接播放后插入的动画
        if(this.playing == true){
            if(this.loopTime == 0) this.play(animationIndex,loop,beginFrame,reverse)
            else{
                if(beginFrame >= this.anim._SpriteAtlas.getSpriteFrames().length) cc.error('begin Frame too big') 
                this.beginFrame = beginFrame
                this.loopTime = loop
                this.anim = this.customAnimation[animationIndex]
                this.frames = (!reverse) ? this.anim._SpriteAtlas.getSpriteFrames().slice(beginFrame):this.anim._SpriteAtlas.getSpriteFrames().slice(0,beginFrame).reverse()
                this.initializeFrame()
            }
        }

        else this.play(animationIndex,beginFrame,loop,reverse)
    }
    stop(frameIndex:number=0,loopCount:number = 1){             //在播放某一遍某一帧后停止
        this.seed = true;  
        this.stopFrameIndex = frameIndex;
        this.stopLoopCount = loopCount;
    }
    pause(){                                                    //暂停
        this.playing = false
    }
    resume(){                                                   //恢复
        this.playing =true
    }
    update(dt){
        if(this.seed == true &&(this.index-this.loopFrom) == this.stopFrameIndex && this.timesDone == this.stopLoopCount){this.playing = false}    //stop    
        if (this.no_frame == true || this.playing == false){ 
            return;
        }        
        this.total_time += dt;               //控制播放时间
        this.timeLine += dt;                    //控制动画帧
        this.index = this.timesDone == 0?Math.floor(this.timeLine / (this.anim.duration/(this.frames.length-1))):Math.floor(this.timeLine / (this.anim.duration/(this.frames.length-1)))+this.loopFrom         //当前播放桢
        if (this.loopTime != 0){ 
            if(this.index > this.framesToPlay.length-1){
                this.index =this.framesToPlay.length-1
                this.no_frame = true;       
            }
            this.sprite.spriteFrame = this.framesToPlay[this.index]; 
        }
        else{
            if (this.index > this.framesToPlay.length-1){ // 播放完了一边，从index=0开始
                this.timeLine = 0
                this.timesDone++
                this.sprite.spriteFrame = this.framesToPlay[this.index-1]
            }
            else this.sprite.spriteFrame = this.framesToPlay[this.index]
            cc.log('index',this.index)
        }
    }
}

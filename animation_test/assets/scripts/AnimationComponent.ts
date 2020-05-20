import CustomAnimation from './CustomAnimation'
let onLoadedType = cc.Enum({
    autoPlay: 1,
    doNotAutoPlay: 0,
});
const {ccclass, property,disallowMultiple,playOnFocus,executeInEditMode} = cc._decorator;
@ccclass
@disallowMultiple
@executeInEditMode
// @playOnFocus
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
    set frameTag(value:number){
        var def_anim = this.customAnimation[this._defaultPlay]
        if(value < def_anim._startFrame) value =def_anim._startFrame
        if(value > def_anim._endFrame) value = def_anim._endFrame
        this._frameTag = value;  
        this._spriteFrame = def_anim._SpriteAtlas.getSpriteFrames()[this._frameTag]
        this.sprite.spriteFrame = this._spriteFrame
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
    set defaultPlay(v:number){
        if(v > this.customAnimation.length-1) v = this.customAnimation.length-1;
        this._defaultPlay = v;
        this.anim = this.customAnimation[this._defaultPlay]
        this.frames = this.customAnimation[this._defaultPlay]._SpriteAtlas.getSpriteFrames()
    }                                    
    @property(CustomAnimation)                                              
    customAnimation : CustomAnimation[] = []
    sprite: cc.Sprite = null;
    no_frame: boolean = false;
    frames :cc.SpriteFrame[] = []
    framesToPlay:cc.SpriteFrame[] = []
    playing : boolean = false;
    total_time : number = 0;
    anim : CustomAnimation = null;
    timesDone: number = 0;
    loopTime:number=0;
    beginFrame:number = 0;
    index:number = 0;
    seed :boolean= false;
    stopFrameIndex:number = 0;
    stopLoopCount :number =1;

    onLoad(){        
        if(!this.sprite){
            this.sprite = this.addComponent(cc.Sprite);
        }
        this.sprite = this.getComponent(cc.Sprite);
        this.anim = this.customAnimation[this._defaultPlay]
        this.frames = this.anim._SpriteAtlas.getSpriteFrames()
        this.initializeFrame();
        this.loopTime = this.anim.looptime;
        this.beginFrame=this.anim._startFrame
        if(this.playOnLoad == 1 )
        {
            this.playing = true;
        }
    }
    initialize(){
        this.playing = false;
        this.no_frame = false;
        this.total_time  = 0;
        this.timesDone = 0;
        this.seed = false;
        this.stopFrameIndex = 0;
        this.stopLoopCount  =1;
    }
    initializeFrame(){
        if (this.frames.length <= 0) {
            this.no_frame = true;
            return;
        }
        this.sprite.spriteFrame = this.frames[this.beginFrame]; 
        if(this.loopTime == 0) this.framesToPlay = this.frames
        else{
            for(var i = this.loopTime;i>0;i--){
                this.framesToPlay = this.framesToPlay.concat(this.frames)
            }
        }

    }
    play(animationIndex:number = 0,beginFrame:number=0,loop:number=0,reverse:boolean = false){           //loop = 0为循环，loop >0 为循环次数
        this.initialize()
        this.anim = this.customAnimation[animationIndex]        
        this.frames = this.anim._SpriteAtlas.getSpriteFrames()
        this.initializeFrame()
        if(reverse == true) {this.frames = this.frames.reverse();cc.log('frame'+this.frames)}     
        this.beginFrame = reverse == false?beginFrame : this.frames.length-1-beginFrame
        if(this.beginFrame >= this.frames.length) cc.error('begin Frame too big')
        this.loopTime = loop
        this.playing = true
    }
    playAdditive(animation:number,beginFrame:number=0,loop:number=0,reverse:boolean =false){
        if(this.playing == true){
            if(this.loopTime == 0) return
            else{

            }
        }

        else this.play(animation,beginFrame,loop,reverse)
    }
    stop(frameIndex:number=0,loopCount:number = 1){
        this.seed = true;  
        this.stopFrameIndex = frameIndex;
        this.stopLoopCount = loopCount;
    }
    pause(){
        this.playing = false
    }
    resume(){
        this.playing =true;
    }
    update(dt){
        if(this.seed == true &&this.index == this.stopFrameIndex && this.timesDone == this.stopLoopCount){this.playing = false}    //stop    
        if (this.no_frame == true || this.playing == false){ 
            return;
        }        
        this.total_time += dt;
        this.index = Math.floor(this.total_time / (this.anim.duration/(this.frames.length-1)))+this.beginFrame;
        if (this.loopTime != 0){ 
            if(this.timesDone < this.loopTime){
                if (this.index >= this.frames.length-1){ // 播放完了
                    this.index = this.beginFrame;
                    this.total_time = 0;
                    this.timesDone++;
                    console.log('count '+this.timesDone)
                }
                this.sprite.spriteFrame = this.frames[this.index]; 
            }
            else{
                this.playing = true;
                this.no_frame = true;
            }
        }
        else{
            if (this.index >= this.frames.length-1){ // 播放完了
                this.index = this.beginFrame; 
                this.total_time = 0;
                this.timesDone++;
                console.log('count '+this.timesDone)

            }
         
            this.sprite.spriteFrame = this.frames[this.index]; 
        }

    }


}

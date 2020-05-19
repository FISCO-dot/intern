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
    set frameTag(value){
        if(value < this.customAnimation[this._defaultPlay]._startFrame) value =this.customAnimation[this._defaultPlay]._startFrame
        if(value > this.customAnimation[this._defaultPlay]._endFrame) value = this.customAnimation[this._defaultPlay]._endFrame
        this._frameTag = value;       
        this._spriteFrame = this.customAnimation[this._defaultPlay].SpriteAtlas.getSpriteFrames()[this._frameTag]
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
        this._defaultPlay = v;
        let atlas =this.node.getComponent(cc.Sprite)
        cc.log('_defa'+this._defaultPlay)
        cc.log('atlas',this.customAnimation[this._defaultPlay].SpriteAtlas.getSpriteFrames()[this._frameTag].name  )
        atlas.spriteFrame = this.customAnimation[this._defaultPlay].SpriteAtlas.getSpriteFrames()[this._frameTag]
    }                                    
    @property(CustomAnimation)                                              
    customAnimation : CustomAnimation[] = []
    sprite: cc.Sprite = null;
    no_frame: boolean = false;
    frames :cc.SpriteFrame[] = []
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
        this.frames = this.customAnimation[this._defaultPlay].SpriteAtlas.getSpriteFrames()
        this.loopTime = this.anim.loop == 0 ? 0:this.anim.looptime;
        this.beginFrame=this.anim._startFrame
    }
    start(){
        if (this.frames.length <= 0) {
            this.no_frame = true;
            return;
        }
        this.sprite.spriteFrame = this.frames[this.beginFrame]; 

 
        if(this.playOnLoad == 1 )
        {
            this.playing = true;
        }
    }
    play( animationIndex:number = 0,beginFrame:number=0,loop:number=0){           //loop = 0为循环，loop >0 为循环次数
        this.initialize();
        this.sprite = this.getComponent(cc.Sprite);
        this.anim = this.customAnimation[this._defaultPlay]
        this.frames = this.customAnimation[animationIndex].SpriteAtlas.getSpriteFrames()
        console.log('loop'+loop)
        this.beginFrame = beginFrame
        this.loopTime = loop;
        this.playing = true
        this.start()
    }
    stopAnim(frameIndex:number=0,loopCount:number = 1){
        this.seed = true;  
        this.stopFrameIndex = frameIndex;
        this.stopLoopCount = loopCount;
    }
    initialize(){
        this.no_frame = false;
        this.playing  = false;
        this.total_time  = 0;
        this.timesDone = 0;
    }

    resumeAnim(){
        this.playing =true;
    }
    update(dt){
        if(this.seed == true &&this.index == this.stopFrameIndex && this.timesDone == this.stopLoopCount){this.playing = false}
        
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
                this.playing = false;
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

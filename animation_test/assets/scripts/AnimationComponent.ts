import CustomAnimation from './CustomAnimation'
let onLoadedType = cc.Enum({
    autoPlay: 1,
    doNotAutoPlay: 0,
});
const {ccclass, property} = cc._decorator;

@ccclass
export default class CustomAnimationComponent extends cc.Component {

    @property(cc.SpriteFrame)
    sp: cc.SpriteFrame

    @property({
        type:cc.Enum(onLoadedType)
    })
    playOnLoad = onLoadedType.autoPlay;                   //是否运行后自动播放

    @property({
        type: cc.Integer,
        min: 0,
        // max: this.effects.length,
        displayName: "default animation"
    })
    defaultPlay : number = 0;                                 
    @property(CustomAnimation)                                              
    customAnimation : CustomAnimation[] = []
    

    sprite: cc.Sprite = null;
    no_frame: boolean = false;
    frames :cc.SpriteFrame[] = []
    playing : boolean = false;
    total_time : number = 0;
    anim : CustomAnimation = null;
    timesDone: number = 0;
    onLoad(){
        this.sprite = this.getComponent(cc.Sprite);
        if(!this.sprite){
            this.sprite = this.addComponent(cc.Sprite);
        }
        this.anim = this.customAnimation[this.defaultPlay]
        
        this.frames = this.customAnimation[this.defaultPlay].SpriteAtlas.getSpriteFrames()
        
    }
    start(){
        if (this.frames.length <= 0) {
            this.no_frame = true;
            return;
        }
        console.log('frames  '+(this.frames[1] instanceof cc.SpriteFrame))
        this.sprite.spriteFrame = this.frames[0]; 

 
        if(this.playOnLoad == 1 )
        {
            this.playing = true;
        }
    }
    stopAnim(){
        this.playing = false;
    }
    resumeAnim(){
        this.playing =true;
    }
    update(dt){
        if (this.no_frame == true || this.playing == false){ 
            return;
        }
        
        this.total_time += dt;
        var index = Math.floor(this.total_time / (this.anim.duration/(this.frames.length-1)));
 
        if (this.anim.loop == 0){ 
            if(this.timesDone < this.anim.looptime){
                if (index >= this.frames.length-1){ // 播放完了
                    index = 0;
                    this.total_time = 0;
                    this.timesDone++;
                }
                this.sprite.spriteFrame = this.frames[index]; 
            }
            else{
                this.playing = false;
            }
        }
        else{
            if (index >= this.frames.length-1){ // 播放完了
                index = 0; 
                this.total_time = 0;
            }
         
            this.sprite.spriteFrame = this.frames[index]; 
        }

    }


}

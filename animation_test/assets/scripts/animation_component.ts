let loopType = cc.Enum({
    循环: 0,
    单次: 1,
});


const {ccclass, property} = cc._decorator;
@ccclass("customAnimation")
class customAnimation {
    @property(cc.SpriteAtlas)
    SpriteAtlas: cc.SpriteAtlas = null
    @property(Number)
    duration : number = 0;
}
@ccclass
export default class customAnimationComponent extends cc.Component {

    @property({
        type:cc.Enum(loopType)
    })
    loop = loopType.循环;
    @property({
        type: cc.Integer,
        displayName: "default animation"
    })
    defaultPlay : number = 0;                                 //默认播放动画选择，超过最大数量默认播放最后一个
    @property({                                               //在属性面板添加任意数量的动画
        type: [customAnimation],
        displayName: "动画"
    })
    effects: customAnimation[] = [];
    anim:cc.Animation = null;                                 //anim->节点下的animation component
    animNum:number = 0;                                       //节点下的动画计算
   

    onLoad () {
        if(this.effects[0].SpriteAtlas){
            this.CreateClip();                                //拖拽添加
        }
    }
    initializeSprite(){
        var sp = this.node.getComponent(cc.Sprite)
        if(!sp){
            sp = this.node.addComponent(cc.Sprite)
        }
        var atlas = this.effects[0].SpriteAtlas.getSpriteFrames()
        if(!sp.spriteFrame){
            var ori = atlas[0];
            sp.spriteFrame = ori;
        }
    }
    CreateClip(){
        this.initializeSprite();
        this.anim = this.node.addComponent(cc.Animation)
        for(var animCount = 0;animCount < this.effects.length;animCount++){
            if(this.effects[animCount].duration == 0){
                var sample = 10;
            }
            else {
                var sample = this.effects[animCount].SpriteAtlas.getSpriteFrames().length / this.effects[animCount].duration
            }
            var clip = cc.AnimationClip.createWithSpriteFrames(this.effects[animCount].SpriteAtlas.getSpriteFrames(),sample)
            clip.name = String(animCount);
            this.anim.addClip(clip);
            this.animNum++;
        }
        console.log('get clips '+ this.anim.getClips().length)
        var animState = this.anim.play(String(this.defaultPlay > (this.effects.length-1) ?(this.effects.length-1):this.defaultPlay));
        console.log('playing '+ animState.name)
        if(this.loop == 0){
            animState.wrapMode = cc.WrapMode.Loop;
        }
        else{
            animState.wrapMode = cc.WrapMode.Normal;
        }
    }
    addClip(clip,duration:number = 1){                         //脚本控制
        var newClip = new customAnimation ;
        newClip.SpriteAtlas = clip;
        newClip.duration = duration;
        this.effects.push(newClip);
        if(!this.anim){
            this.initializeSprite();
        }
        clip.name = String(this.animNum)
        this.anim.addClip(clip);
        this.animNum++;
    }
    removeClip(clip,force:boolean = false){
        if(!this.anim || !(clip instanceof cc.AnimationClip))
        return
        this.anim.removeClip(clip,force);
        this.effects.splice(Number(clip.name),1)
        this.animNum--;
    }

    // update (dt) {}
}

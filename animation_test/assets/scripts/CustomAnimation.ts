let loopType = cc.Enum({
    loop: 0,
    defineTimes: 1,
});

const {ccclass, property} = cc._decorator;

@ccclass('CustomAnimation')
export default class CustomAnimation {

    @property({type:cc.SpriteAtlas})
    _SpriteAtlas: cc.SpriteAtlas = null
    @property({
        type:cc.SpriteAtlas
    })
    get sa(){
        return this._SpriteAtlas
    }
    set sa(v:cc.SpriteAtlas){
        this._SpriteAtlas = v;
        this._endFrame = this._SpriteAtlas.getSpriteFrames().length-1
    }
    @property(cc.Float)
    duration : number = 1
    @property({
        type:cc.Enum(loopType)
    })
    loop = loopType.defineTimes                                     //是否循环播放
    
    @property({
        type:cc.Integer,
        visible(){
            return this.loop == 1;
        }
    })
    looptime:number = 1;
    @property({type:cc.Integer})
    _startFrame : number = 0        
     @property({
        type:cc.Integer,
        min:0,
        displayName:'Start Frame',
    })
    get startFrame():number{
        return this._startFrame
    }
    set startFrame(value){            
        if(value >= this._endFrame) value = this._endFrame -1;
        if(value < 0) value = 0
        this._startFrame = value
    }

    @property({type:cc.Integer})
    _endFrame : number = 1
    @property({
        type:cc.Integer,
        min:1,
        displayName:'End Frame',

    })
    get endFrame():number{
        return this._endFrame;
    }
    set endFrame(value){
        if(value >= this._SpriteAtlas.getSpriteFrames().length) value = this._SpriteAtlas.getSpriteFrames().length-1
        this._endFrame = value;
    }


}

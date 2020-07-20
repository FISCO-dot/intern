import List from '../../CustomScroll_2'
const {ccclass, property} = cc._decorator;

@ccclass
export default class AddPic extends cc.Component {
    @property(List)
    picList : List = null
    
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.loader.loadRes('AnimationAtlas/pig',cc.SpriteAtlas,(err,asset)=>{
            this.picList.loadData(asset.getSpriteFrames())
        })

    }
    clickOpenPic(){
        this.picList.node.active = !this.picList.node.active
        if(this.picList.node.active){
            let piclist = this.picList.node.getComponent('CustomScroll_2')
            piclist._freshItem()
            if(this.node.parent.getChildByName('EmojiButt').getChildByName('EmojiList').active)
                this.node.parent.getChildByName('EmojiButt').getChildByName('EmojiList').active = false
        }
    }
}

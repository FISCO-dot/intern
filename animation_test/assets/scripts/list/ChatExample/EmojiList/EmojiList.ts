import List from '../../CustomScroll_2'
const {ccclass, property,executionOrder} = cc._decorator;

@ccclass
@executionOrder(-5000)
export default class EmojiList extends cc.Component {
    @property(List)
    emojiList:List = null

    data:string[] = []
    onLoad () {
        for(var i = 0 ; i < 10;i++){
            this.data.push(String(i))
        }
        cc.loader.loadRes('ChatExample/EmojiPic/faceAll',cc.SpriteAtlas,(err,assets)=>{
            this.emojiList.loadData(assets.getSpriteFrames())
        })
    }

    clickOpenEmoji(){
        this.emojiList.node.active = !this.emojiList.node.active
        if(this.emojiList.node.active){
            let emojilist = this.emojiList.node.getComponent('CustomScroll_2')
            emojilist._freshItem()
            if(this.node.parent.getChildByName('AddPic').getChildByName('PicList').active)
                this.node.parent.getChildByName('AddPic').getChildByName('PicList').active = false
        }
    }

    // update (dt) {}
}

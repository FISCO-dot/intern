import List from '../../CustomScroll_2'
import { eventCenter } from '../../CustomScroll_2'
const {ccclass, property} = cc._decorator;

@ccclass
export default class MessageList extends cc.Component {
    @property(List)
    messageList : List = null
    @property(cc.EditBox)
    editbox:cc.EditBox = null
    type :number = 0
    channel:number
    private data = []
    private color = [cc.Color.WHITE,cc.Color.CYAN]
    private headPics = []
    private listInfo = []
    onLoad () {
        cc.loader.loadResDir('HeadPic',cc.SpriteFrame,(err,assets)=>{
            assets.forEach(element => {
                this.headPics.push(element)
            });
        })
        this.editbox.node.on('editing-return', this.sendInputMessage, this);
        eventCenter.on('pickUserList',(node)=>{
            this.channel = Number(node[0].name)
            let template = this.messageList.SetItemTemplate(this.channel)
            template.getChildByName('headPic').getComponent(cc.Sprite).spriteFrame = this.headPics[this.channel]
            this.messageList.setItemColor(this.color[this.channel])
            cc.log('pick channel '+this.channel)
        },this.node)
        eventCenter.on('unpickMessageList',(node)=>{
            node[0].color = this.color[this.listInfo[node[0].name]]
            cc.log('color change = ' + node[0].color)
        },this.node)
    }

    sendInputMessage(){
        if(this.editbox.string == '') return
        this.messageList.addData(this.editbox.string)
        let index = this.messageList.sendMessage()
        this.listInfo[index]= this.channel
        this.editbox.string = ''
    }
    // update (dt) {}
}

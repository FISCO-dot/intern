import List from '../../CustomScroll_2'
import { eventCenter } from '../../CustomScroll_2'
const {ccclass, property,executionOrder} = cc._decorator;

@ccclass

export default class MessageList extends cc.Component {
    @property(List)
    messageList : List = null
    @property(cc.RichText)
    editbox:cc.RichText = null

    type :number = 0
    channel:number 
    private data = []
    private color = [cc.Color.WHITE,cc.Color.CYAN,cc.color(255,255,255,255)]
    private headPics = []
    private listInfo = []
    private date = new Date()
    private currentTime : number
    onLoad () {
        cc.loader.loadResDir('ChatExample/HeadPic',cc.SpriteFrame,(err,assets)=>{
            assets.forEach(element => {
                this.headPics.push(element)
            });
            cc.loader.loadRes('ChatExample/EmojiPic/PicAdd',cc.SpriteFrame,(err,pic)=>{
                this.date = new Date()
                if(this.currentTime == undefined || this.date.getMinutes()-this.currentTime >= 5){
                    this.currentTime = this.date.getMinutes()
                    this.showTimeTip()
                }
                this.channel = 0
                this.sendInputMessage(pic)
                this.channel = 1
            })
        })
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onEnterDown, this);
        eventCenter.on('pickUserList',(node)=>{
            this.channel = Number(node[0].name)
            cc.find('Canvas/UserList').active = false
            cc.log('pick channel '+this.channel)
        },this.node)
        eventCenter.on('unpickMessageList',(node)=>{
            node[0].zIndex --
            cc.log('channel name = ',node[0].name)
            node[0].color = this.color[this.listInfo[node[0].name]]
            node[0].getChildByName('DropList').removeFromParent()
        },this.node)
        eventCenter.on('pickMessageList',(node)=>{
                cc.loader.loadRes('Prefab/item',cc.Prefab,(err,prefab)=>{
                    let dropListNode = new cc.Node('DropList')
                    let dropList = dropListNode.addComponent('CustomScroll_2')

                    dropListNode.addComponent('SecondaryList')
                    dropList.prefabSet.push(prefab)
                    node[0].addChild(dropListNode)
                    node[0].zIndex ++
                    dropListNode.setPosition(50,-150)
                })
        },this.node)
        eventCenter.on('pickPicList',(node)=>{
            if(this.channel == undefined) return
            this.date = new Date()
            if(this.currentTime == undefined || this.date.getMinutes()-this.currentTime >= 5){
                this.currentTime = this.date.getMinutes()
                this.showTimeTip()
            }
            this.sendInputMessage(node[0].getChildByName('imgMsg').getComponent(cc.Sprite).spriteFrame)
        },this.node)
        eventCenter.on('delete',(node)=>{
            this.listInfo[node[0].name] = 2
        },this.node)
    }
    onEnterDown(event){
        if(this.channel == undefined) return
        if(event.keyCode == cc.macro.KEY.enter){
            if(this.editbox.string == '') return
            this.date = new Date()
            if(this.currentTime == undefined || this.date.getMinutes()-this.currentTime >= 5){
                this.currentTime = this.date.getMinutes()
                this.showTimeTip()
            }
            this.sendInputMessage()
            this.editbox.node.getChildByName('cursor').setPosition(-65,0) 
        }
    }
    sendInputMessage(pic?:cc.SpriteFrame){
        let template = this.messageList.SetItemTemplate(this.channel)
        if(this.channel == 0) this.messageList.contentOffset = 10
        else this.messageList.contentOffset = 0
        template.getChildByName('headPic').getComponent(cc.Sprite).spriteFrame = this.headPics[this.channel]
        this.messageList.setItemColor(this.color[this.channel])
        pic == undefined? this.messageList.addData(this.editbox.string) : this.messageList.addData(pic)
        this.listInfo[this.messageList.sendMessage()]= this.channel
        let itemPos = this.messageList.getItemposition()
        let item = this.messageList.getItemByIndex(this.messageList.getItem().length-1)
        if(this.channel == 0) itemPos[item.name].x = -this.messageList.viewWidth/2+item.width/2+item.children[0].width
        else if(this.channel == 1) {
            itemPos[item.name].x = this.messageList.viewWidth/2-item.width/2-item.children[0].width;        
    }

        this.messageList.updateView()
        this.editbox.string = ''
        this.editbox.node.getComponent('InputBox').input = ''
        this.editbox.node.getComponent('InputBox').lineNumChange()
    }
    showTimeTip(){
        this.messageList.SetItemTemplate(2)
        this.messageList.addData(this.date.toLocaleString())
        this.messageList.fontSize = 10
        this.messageList.maxWidth = 0
        let index = this.messageList.sendMessage()
        this.messageList.getItemByIndex(Number(index)).off(cc.Node.EventType.TOUCH_END)
        this.listInfo[index]= 2
        this.messageList.fontSize = 30
        this.messageList.maxWidth = 200
    }

}

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
    private color = [cc.Color.WHITE,cc.Color.CYAN]
    private headPics = []
    private listInfo = []
    private date = new Date()
    private currentTime : number
    onLoad () {
        cc.loader.loadResDir('ChatExample/HeadPic',cc.SpriteFrame,(err,assets)=>{
            assets.forEach(element => {
                this.headPics.push(element)
            });
        })
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onEnterDown, this);
        eventCenter.on('pickUserList',(node)=>{
            this.channel = Number(node[0].name)
            cc.log('pick channel '+this.channel)
        },this.node)
        eventCenter.on('unpickMessageList',(node)=>{
            node[0].zIndex --
            node[0].color = this.color[this.listInfo[node[0].name]]
            node[0].getChildByName('DropList').removeFromParent()
        },this.node)
        eventCenter.on('pickMessageList',(node)=>{
            if(this.listInfo[node[0].name] == 2){
                node[0].color = cc.color(255,255,255,150)
                this.messageList.returnPick().length = 0
                cc.log('pick = ',this.messageList.returnPick().length)
            }
            else{                
                cc.loader.loadRes('Prefab/item',cc.Prefab,(err,prefab)=>{
                    let dropListNode = new cc.Node('DropList')
                    let dropList = dropListNode.addComponent('CustomScroll_2')
                    dropListNode.addComponent('SecondaryList')
                    dropList.prefabSet.push(prefab)
                    node[0].addChild(dropListNode)
                    node[0].zIndex ++
                    dropListNode.setPosition(50,-150)

                })
            }
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
    sendInputMessage(){

        let template = this.messageList.SetItemTemplate(this.channel)
        if(this.channel == 0) this.messageList.contentOffset = 10
        else this.messageList.contentOffset = 0
        template.getChildByName('headPic').getComponent(cc.Sprite).spriteFrame = this.headPics[this.channel]
        this.messageList.setItemColor(this.color[this.channel])
        this.messageList.addData(this.editbox.string)
        cc.log('???= '+this.editbox.string)
        this.messageList.fontSize = 30
        this.messageList.maxWidth = 200
        let index = this.messageList.sendMessage()

        this.listInfo[index]= this.channel
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
        let item = this.messageList.getItemByIndex(Number(index))
        let tipText = item.getComponentInChildren(cc.RichText)

        item.height = tipText.node.height +10
        item.width = tipText.node.width + 10
        cc.log('index = '+item.name)
        this.listInfo[index]= 2
    }
    
}

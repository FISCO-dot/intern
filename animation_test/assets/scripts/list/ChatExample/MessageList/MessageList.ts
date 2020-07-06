import List from '../../CustomScroll_2'
import { eventCenter } from '../../CustomScroll_2'
const {ccclass, property} = cc._decorator;

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
            node[0].color = this.color[this.listInfo[node[0].name]]
            cc.log('color change = ' + node[0].color)
        },this.node)
        eventCenter.on('pickMessageList',(node)=>{
            if(this.listInfo[node[0].name] == 2){
                node[0].color = cc.color(255,255,255,150)
                this.messageList.returnPick().length = 0
            }
            else{
                //创建子菜单
            }
        },this.node)
    }
    onEnterDown(event){
        if(this.channel == undefined) return
        if(event.keyCode == cc.macro.KEY.enter){
            cc.log('current time = '+this.currentTime+'system time = '+this.date.getSeconds())
            if(this.editbox.string == '') return
            this.date = new Date()
            if(this.currentTime == undefined || this.date.getMinutes()-this.currentTime >= 5){
                this.currentTime = this.date.getMinutes()
                this.showTimeTip()
            }
            this.sendInputMessage()
        }
        // cc.log('time = '+this.date.getMinutes())
    }
    sendInputMessage(){
        let template = this.messageList.SetItemTemplate(this.channel)
        template.getChildByName('headPic').getComponent(cc.Sprite).spriteFrame = this.headPics[this.channel]
        this.messageList.setItemColor(this.color[this.channel])
        this.messageList.addData(this.editbox.string)
        cc.log('???= '+this.editbox.string)
        let index = this.messageList.sendMessage()
        this.listInfo[index]= this.channel
        this.editbox.string = ''
        this.editbox.node.getComponent('InputBox').input = ''

    }
    showTimeTip(){
        this.messageList.SetItemTemplate(2)
        this.messageList.addData(this.date.toLocaleString())
        let index = this.messageList.sendMessage()
        let item = this.messageList.getItemByIndex(Number(index))
        let tipText = item.getComponentInChildren(cc.RichText)
        tipText.fontSize = 10
        tipText.maxWidth = 0
        tipText.lineHeight = 10
        item.height = tipText.node.height +10
        item.width = tipText.node.width + 10
        cc.log('index = '+item.name)
        this.listInfo[index]= 2
    }
    update () {
    }
}
